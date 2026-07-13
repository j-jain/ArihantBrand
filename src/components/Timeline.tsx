interface TimelineItem {
  year: string;
  title: string;
  text: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

/** Vertical timeline: a hairline spine, vermillion condensed year markers, and
 *  generous vertical rhythm. */
export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="timeline pl-8">
      <span className="timeline__spine" aria-hidden="true" />
      {items.map((item) => (
        <li key={item.year} className="relative pb-12 last:pb-0">
          <span
            className="absolute -left-8 top-[0.5rem] block h-2.5 w-2.5 -translate-x-1/2 rounded-sm bg-vermillion-deep"
            aria-hidden="true"
          />
          <p
            className="font-sans text-vermillion-deep"
            style={{
              fontWeight: 800,
              fontStretch: "85%",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.02em",
              fontSize: "1.15rem",
            }}
          >
            {item.year}
          </p>
          <h3 className="t-h4 mt-1 text-ink">{item.title}</h3>
          <p className="t-body measure mt-2 text-ink-soft">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}
