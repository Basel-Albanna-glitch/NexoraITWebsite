import type { ReactNode } from "react";
import type { ShapeName } from "@/lib/content";
import { Constellation } from "./Constellation";

/** Two-column page header: label + oversized headline + intro on the left, particle shape on the right. */
export function PageHero({
  label, title, children, shape, shapeLabel,
}: { label: ReactNode; title: string; children?: ReactNode; shape: ShapeName; shapeLabel?: string }) {
  return (
    <section className="hero hero--page wrap">
      <div className="hero__text">
        <p className="label reveal">{label}</p>
        <h1 className="display reveal">{title}</h1>
        {children}
      </div>
      <div className="hero__visual">
        <Constellation shape={shape} count={1300} mobileCount={700} scale={0.34} label={shapeLabel} />
      </div>
    </section>
  );
}
