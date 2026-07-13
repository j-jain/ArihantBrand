import type { Testimonial } from "@/content/types";

interface TestimonialRailProps {
  testimonials: Testimonial[];
}

/** Renders nothing until real testimonials are published (honesty rail). With
 *  published entries, a plain blockquote rail. */
export function TestimonialRail({ testimonials }: TestimonialRailProps) {
  const published = testimonials.filter((item) => item.published);
  if (published.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {published.map((item) => (
        <blockquote
          key={`${item.name}-${item.role}`}
          className="border-t border-line pt-6"
        >
          <p className="t-h3 measure text-ink">“{item.quote}”</p>
          <footer className="t-small mt-4 text-ink-soft">
            <span className="font-sans" style={{ fontWeight: 650 }}>
              {item.name}
            </span>{" "}
            · {item.role}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
