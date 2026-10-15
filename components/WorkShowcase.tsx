import Image from "next/image";
import Link from "next/link";
import { getDictionary, href, type Locale } from "@/lib/i18n";
import { getProjects } from "@/lib/projects-store";
import { isUploaded } from "@/lib/work";
import { Arrow } from "./Arrow";
import { Constellation } from "./Constellation";

/** "Built by us. Running today." — compact strip of projects, linking to their write-ups on /work. */
export async function WorkShowcase({ lang, label }: { lang: Locale; label?: string }) {
  const t = getDictionary(lang);
  // the first five, in the order set in the dashboard
  const projects = (await getProjects(lang)).slice(0, 5);
  if (!projects.length) return null;
  return (
    <section className="wrap section showcase">
      <div className="showcase__head">
        <div>
          <p className="label reveal">{label || t.work.label}</p>
          <h2 className="heading-lg reveal">{t.work.title} <span className="dim">{t.work.titleDim}</span></h2>
        </div>
        <Link href={href(lang, "/work")} className="ghost reveal">{t.cta.allProjects} <Arrow /></Link>
      </div>
      <ul className="showcase__list">
        {projects.map((p) => (
          <li key={p.slug} className="reveal">
            <Link href={`${href(lang, "/work")}#${p.slug}`} className="showcase__item">
              <div className="showcase__thumb">
                {p.image ? (
                  <Image src={p.image.src} width={p.image.width} height={p.image.height} alt={p.image.alt}
                         sizes="(max-width: 760px) 50vw, 240px" unoptimized={isUploaded(p.image.src)} />
                ) : (
                  <Constellation shape="lattice" count={500} mobileCount={350} scale={0.28} interactive={false} />
                )}
              </div>
              <p className="showcase__kind">{p.kind}</p>
              <h3 className="showcase__name">{p.name}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
