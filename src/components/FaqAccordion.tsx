import type { Faq } from "@/content/types";

interface FaqAccordionProps {
  faqs: Faq[];
  /** Inside a SectionReveal (change round 9): the questions stagger in as
   *  the section's rows. Inert anywhere else. */
  rows?: boolean;
}

/** Native <details>/<summary> accordion — works without JS, styled with a
 *  plus/minus indicator and hairline dividers. Pair with a FAQPage JsonLd. */
export function FaqAccordion({ faqs, rows = false }: FaqAccordionProps) {
  return (
    <div {...(rows ? { "data-sr": "rows" } : {})}>
      {faqs.map((faq) => (
        <details key={faq.question} className="faq-item">
          <summary className="faq-summary">{faq.question}</summary>
          <div className="faq-answer">
            <p className="t-body">{faq.answer}</p>
            {faq.bullets?.length ? (
              <ul className="faq-bullets">
                {faq.bullets.map((item) => (
                  <li key={item} className="t-body">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
