import type { PostBlock } from "@/content/types";

/** Renders an article's typed content blocks. The article <h1> is already used
 *  by the page header, so h2/h3 blocks map to real <h2>/<h3> elements stepped
 *  down in Besley scale. Lists carry a vermillion chevron marker. */
export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`;
        switch (block.type) {
          case "p":
            return (
              <p key={key} className="t-body measure text-ink">
                {block.text}
              </p>
            );
          case "h2":
            return (
              <h2 key={key} className="t-h3 text-ink" style={{ marginTop: "1.25rem" }}>
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={key}
                className="font-display text-ink"
                style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.3, marginTop: "0.75rem" }}
              >
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={key} className="flex flex-col gap-3 measure">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 t-body text-ink">
                    <span
                      aria-hidden="true"
                      className="flex-none text-vermillion-deep"
                      style={{ marginTop: "0.35em", lineHeight: 1 }}
                    >
                      ▸
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
