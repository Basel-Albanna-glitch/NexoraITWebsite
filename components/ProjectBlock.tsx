import Image from "next/image";
import Link from "next/link";
import { href, type Locale } from "@/lib/i18n";
import { isUploaded, type Project, type ProjectVideo } from "@/lib/work";
import { Arrow } from "./Arrow";
import { Constellation } from "./Constellation";

/** A project case study: visual on one side, story on the other; reels underneath.
 *  `project` must already be localized (lib/work.ts → localizeProject). */
export function ProjectBlock({ project: p, lang, serviceTitles, flip = false, headingLevel = 2 }: {
  project: Project; lang: Locale; serviceTitles: Record<string, string>; flip?: boolean; headingLevel?: 2 | 3;
}) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const videos = p.videos ?? [];
  return (
    <article className={`project${flip ? " project--flip" : ""}`} id={p.slug}>
      <div className="project__media reveal">
        {p.image ? (
          <Image src={p.image.src} width={p.image.width} height={p.image.height} alt={p.image.alt}
                 sizes="(max-width: 960px) 100vw, 560px" className="project__img" unoptimized={isUploaded(p.image.src)} />
        ) : (
          <div className="project__visual">
            <Constellation shape="lattice" count={900} mobileCount={500} scale={0.3} interactive={false} />
          </div>
        )}
      </div>
      <div className="project__body">
        <p className="label reveal">{p.kind}</p>
        <H className="heading reveal">{p.name}</H>
        <p className="project__headline reveal">{p.headline}</p>
        {p.client && <p className="caption project__client reveal">{p.client}</p>}
        <p className="body body--muted reveal">{p.summary}</p>
        <ul className="checks reveal">
          {p.points.map((x) => <li key={x}>{x}</li>)}
        </ul>
        <div className="project__services reveal">
          {p.services.filter((s) => serviceTitles[s]).map((slug) => (
            <Link key={slug} href={href(lang, `/services/${slug}`)} className="ghost">{serviceTitles[slug]} <Arrow /></Link>
          ))}
        </div>
        {/* a single reel sits under the story, beside the poster */}
        {videos.length === 1 && <div className="reels reels--inline"><Reel video={videos[0]} /></div>}
      </div>
      {videos.length > 1 && (
        <div className="reels">
          {videos.map((v) => <Reel key={v.src} video={v} />)}
        </div>
      )}
    </article>
  );
}

function Reel({ video: v }: { video: ProjectVideo }) {
  return (
    <figure className="reel reveal">
      <video src={v.src} poster={v.poster} controls playsInline preload="none" />
      <figcaption className="caption">{v.title}</figcaption>
    </figure>
  );
}
