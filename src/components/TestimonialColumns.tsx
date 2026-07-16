import type { Testimonial } from "@/content/types";

interface TestimonialColumnsProps {
  testimonials: Testimonial[];
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function TestimonialCard({
  testimonial,
  duplicate = false,
}: {
  testimonial: Testimonial;
  /** The seamless-loop copy — hidden from assistive tech. */
  duplicate?: boolean;
}) {
  return (
    <figure className="tcol__card" aria-hidden={duplicate || undefined}>
      <blockquote className="tcol__quote">{testimonial.quote}</blockquote>
      <figcaption className="tcol__foot">
        <span className="tcol__avatar" aria-hidden="true">
          {initialsOf(testimonial.name)}
        </span>
        <span className="tcol__meta">
          <span className="tcol__name">{testimonial.name}</span>
          <span className="tcol__role">{testimonial.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** A wall of testimonials. Desktop shows three columns of gently self-scrolling
 *  cards (each column a CSS marquee at its own pace, paused on hover/focus);
 *  tablet drops to two columns; mobile collapses to a short static list. The
 *  duplicated marquee copy is `aria-hidden`, and reduced motion / the global
 *  motion reset leave every column static. All motion is CSS keyframe based —
 *  no JS is required for it to be legible. */
export function TestimonialColumns({ testimonials }: TestimonialColumnsProps) {
  if (testimonials.length === 0) return null;

  const columns: Testimonial[][] = [[], [], []];
  testimonials.forEach((t, i) => {
    columns[i % 3].push(t);
  });

  const durations = ["38s", "46s", "42s"];

  return (
    <div className="tcols">
      {/* Mobile: a short static list (first four), no marquee. */}
      <ul className="tcols__mobile">
        {testimonials.slice(0, 4).map((t) => (
          <li key={`m-${t.name}-${t.role}`}>
            <TestimonialCard testimonial={t} />
          </li>
        ))}
      </ul>

      {/* Tablet / desktop: self-scrolling columns. */}
      <div className="tcols__grid">
        {columns.map((col, ci) => (
          <div className="tcol" key={`col-${ci}`}>
            <div
              className="tcol__track"
              style={{ ["--tcol-dur" as string]: durations[ci] }}
            >
              {col.map((t) => (
                <TestimonialCard
                  key={`${ci}-a-${t.name}-${t.role}`}
                  testimonial={t}
                />
              ))}
              {col.map((t) => (
                <TestimonialCard
                  key={`${ci}-b-${t.name}-${t.role}`}
                  testimonial={t}
                  duplicate
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
