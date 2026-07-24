import type { Faq } from "@/content/types";

interface FaqAccordionProps {
  faqs: Faq[];
}

/** Native <details>/<summary> accordion — works without JS, styled with a
 *  plus/minus indicator and hairline dividers. Pair with a FAQPage JsonLd. */
export function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <div>
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
