import "server-only";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

// Each data document (content, projects, messages, stats) is one JSON value.
// - Locally (no Redis keys): a file under data/ (or DATA_DIR), written to a temp file then renamed,
//   so a crash never leaves half a file.
// - On Vercel (Upstash Redis connected): one Redis key per document. The first read falls back to
//   the bundled data/*.json, so the site starts with the content that's in git.
// Writes are serialised per document: in-process with a queue, and across server instances with a
// short Redis lock.
export const DATA_DIR = process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");

/** The minimal Redis surface used here (lets tests pass an in-memory fake). */
export interface RedisLike {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { nx: true; px: number }): Promise<unknown>;
  eval(script: string, keys: string[], args: string[]): Promise<unknown>;
}

let defaultRedis: RedisLike | null | undefined;
export function redisFromEnv(): RedisLike | null {
  if (defaultRedis !== undefined) return defaultRedis;
  // Vercel's Upstash integration sets KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  defaultRedis = url && token ? (new Redis({ url, token }) as unknown as RedisLike) : null;
  return defaultRedis;
}

export const usingRedis = () => redisFromEnv() !== null;

const KEY_PREFIX = "nexorait:";
const LOCK_MS = 15_000;
const RELEASE = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const queues = new Map<string, Promise<unknown>>();

export function jsonFile<T>(name: string, fallback: () => T, redis: RedisLike | null = redisFromEnv()) {
  const file = path.join(/*turbopackIgnore: true*/ DATA_DIR, name);
  const key = KEY_PREFIX + name.replace(/\.json$/, "");

  async function readFile(): Promise<T> {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as T;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback();
      throw err;
    }
  }

  async function read(): Promise<T> {
    if (!redis) return readFile();
    const v = await redis.get<T>(key);
    return v ?? readFile(); // not saved to Redis yet: start from the bundled file
  }

  async function write(value: T) {
    if (redis) { await redis.set(key, value); return; }
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2) + "\n");
    await fs.rename(tmp, file);
  }

  /** Across instances: hold a short Redis lock while reading-modifying-writing. */
  async function locked<R>(fn: () => Promise<R>): Promise<R> {
    if (!redis) return fn();
    const lock = `${key}:lock`, id = randomBytes(8).toString("hex");
    const deadline = Date.now() + LOCK_MS;
    while (!(await redis.set(lock, id, { nx: true, px: LOCK_MS }))) {
      if (Date.now() > deadline) throw new Error(`Timed out waiting for ${key}`);
      await sleep(50 + Math.random() * 100);
    }
    try {
      return await fn();
    } finally {
      await redis.eval(RELEASE, [lock], [id]).catch(() => {});
    }
  }

  /** Read-modify-write under this document's lock. */
  function mutate<R>(fn: (current: T) => { next: T; result: R } | Promise<{ next: T; result: R }>): Promise<R> {
    const prev = queues.get(key) ?? Promise.resolve();
    const run = prev.then(() => locked(async () => {
      const { next, result } = await fn(await read());
      await write(next);
      return result;
    }));
    queues.set(key, run.catch(() => {}));
    return run;
  }

  return { read, mutate };
}
