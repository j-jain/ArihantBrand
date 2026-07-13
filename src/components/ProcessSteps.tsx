import type { ProcessStep } from "@/content/types";

interface ProcessStepsProps {
  steps: ProcessStep[];
}

/** A true, ordered sequence — numbered 01..0N (numbers earn their place here).
 *  Stacks on mobile, four columns on desktop, joined by a connecting hairline. */
export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <ol className="grid gap-x-6 gap-y-10 md:grid-cols-4">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-col gap-3 border-t border-line pt-5"
        >
          <span
            className="t-h3 font-display text-vermillion-deep"
            style={{ fontVariantNumeric: "tabular-nums" }}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="t-h4 text-ink">{step.title}</h3>
          <p className="t-body text-ink-soft">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
