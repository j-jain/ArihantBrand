import type { Testimonial } from "@/content/types";

interface TestimonialColumnsProps {
  testimonials: Testimonial[];
  /** Columns from 768px up. Three on /recognition's full-width band; two
   *  where the wall shares a row with other content (the home awards band). */
  columns?: 2 | 3;
  /** "dark" sets the cards for a charcoal ground. */
  tone?: "paper" | "dark";
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

/** A wall of testimonials. From 768px up it shows two or three columns of
 *  gently self-scrolling cards (each column a CSS marquee at its own pace,
 *  paused on hover/focus), the same count at every width so the wall never
 *  re-flows; mobile shows the first four as a snap rail. The
 *  duplicated marquee copy is `aria-hidden`, and reduced motion / the global
 *  motion reset leave every column static. All motion is CSS keyframe based —
 *  no JS is required for it to be legible. */
export function TestimonialColumns({
  testimonials,
  columns: count = 3,
  tone = "paper",
}: TestimonialColumnsProps) {
  if (testimonials.length === 0) return null;

  const columns: Testimonial[][] = Array.from({ length: count }, () => []);
  testimonials.forEach((t, i) => {
    columns[i % count].push(t);
  });

  const durations = ["38s", "46s", "42s"];

  return (
    <div
      className={tone === "dark" ? "tcols tcols--dark" : "tcols"}
      style={{ ["--tcols" as string]: count }}
    >
      {/* Mobile: the first four as a horizontal snap rail (see .tcols__mobile
          in mobile.css). `display: none` above 767px keeps this out of the
          desktop tab order entirely, so the tabindex the scroll region needs
          costs nothing there. */}
      <ul
        className="tcols__mobile m-rail m-rail-wide"
        tabIndex={0}
        aria-label="Testimonials"
      >
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
