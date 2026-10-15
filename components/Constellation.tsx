"use client";

import { useEffect, useRef } from "react";
import {
  brainShape, globeShape, latticeShape, phoneShape, startAmbient, startConstellation, torusShape, waveShape,
} from "@/lib/particles";
import type { ShapeName } from "@/lib/content";

const SHAPES: Record<ShapeName, typeof brainShape> = {
  brain: brainShape, globe: globeShape, wave: waveShape, lattice: latticeShape, torus: torusShape, phone: phoneShape,
};

interface Props {
  shape: ShapeName;
  count: number;
  mobileCount?: number;
  scale?: number;
  speed?: number;
  interactive?: boolean;
  label?: string;
}

export function Constellation({ shape, count, mobileCount, scale, speed, interactive, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const n = window.innerWidth < 760 && mobileCount ? mobileCount : count;
    return startConstellation(ref.current!, { shape: SHAPES[shape], count: n, scale, speed, interactive });
  }, [shape, count, mobileCount, scale, speed, interactive]);

  return label
    ? <canvas ref={ref} role="img" aria-label={label} />
    : <canvas ref={ref} aria-hidden="true" />;
}

export function AmbientField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => startAmbient(ref.current!), []);
  return <canvas ref={ref} id="ambient" aria-hidden="true" />;
}
