import "server-only";
import { promises as fs } from "fs";
import path from "path";

// Data lives in JSON files under data/ (or DATA_DIR). Every file gets serialised writes and
// write-to-temp-then-rename, so concurrent saves can't interleave and a crash never leaves half a file.
export const DATA_DIR = process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");

const queues = new Map<string, Promise<unknown>>();

export function jsonFile<T>(name: string, fallback: () => T) {
  const file = path.join(/*turbopackIgnore: true*/ DATA_DIR, name);

  async function read(): Promise<T> {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as T;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback();
      throw err;
    }
  }

  async function write(value: T) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2) + "\n");
    await fs.rename(tmp, file);
  }

  /** Read-modify-write under this file's lock. */
  function mutate<R>(fn: (current: T) => { next: T; result: R } | Promise<{ next: T; result: R }>): Promise<R> {
    const prev = queues.get(file) ?? Promise.resolve();
    const run = prev.then(async () => {
      const { next, result } = await fn(await read());
      await write(next);
      return result;
    });
    queues.set(file, run.catch(() => {}));
    return run;
  }

  return { read, mutate };
}
