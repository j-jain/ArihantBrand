"use client";

import { useId, useMemo, useRef, useState } from "react";

import { num } from "@/content/facts";
import type { ReturnsCalculatorCopy } from "@/content/types";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ReturnsCalculatorProps {
  copy: ReturnsCalculatorCopy;
  open: boolean;
  onClose: () => void;
}

type FieldKey = "area" | "rent" | "sales" | "margin" | "otherCosts";

const FIELD_ORDER: FieldKey[] = ["area", "rent", "sales", "margin", "otherCosts"];

const EMPTY: Record<FieldKey, string> = {
  area: "",
  rent: "",
  sales: "",
  margin: "",
  otherCosts: "",
};

/**
 * Parses a typed figure. Accepts en-IN grouping and stray spaces, because a
 * visitor pasting "12,50,000" from their own sheet should not be told off.
 * Returns null for empty, and NaN for something that is not a number, so the
 * caller can tell "not filled in yet" apart from "that is not a number".
 */
function parseFigure(raw: string): number | null {
  const cleaned = raw.replace(/[\s,]/g, "");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : Number.NaN;
}

/** Rupees, rounded to the whole unit. Negative values keep their sign: an
 *  honest worksheet has to be able to tell someone their numbers do not work. */
function rupees(value: number): string {
  const rounded = Math.round(value);
  return rounded < 0 ? `-Rs ${num(Math.abs(rounded))}` : `Rs ${num(rounded)}`;
}

function ratio(value: number, unit: string): string {
  return `${value.toFixed(1)}${unit}`;
}

/**
 * The returns worksheet.
 *
 * It is a worksheet, not a projection, and the distinction is load-bearing.
 * Arihant publishes no investment amount and no return percentage (PRODUCT.md
 * honesty rails), so every figure this panel prints is derived from what the
 * visitor typed on this page. There are no default values, no placeholder
 * figures, and nothing that would let an Arihant number in through the back
 * door. The disclosure sits above the fields, is never collapsed, and is what
 * the dialog points `aria-describedby` at.
 *
 * The visitor's figures are never put in a URL and never prefilled into the
 * inquiry form: that would contradict the sentence promising nothing is sent,
 * and financial data does not belong in a query string.
 */
export function ReturnsCalculator({ copy, open, onClose }: ReturnsCalculatorProps) {
  const [values, setValues] = useState<Record<FieldKey, string>>(EMPTY);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();

  const titleId = `${uid}-calc-title`;
  const noteId = `${uid}-calc-note`;

  // Reset between visits: a worksheet that remembers the last person's rent is
  // a worksheet nobody trusts. Done on the close path rather than in an effect
  // watching `open`, because every way out of this dialog (the close button,
  // Escape and a backdrop click) is routed through onClose by Modal.
  const handleClose = () => {
    setValues(EMPTY);
    onClose();
  };

  const parsed = useMemo(() => {
    const out = {} as Record<FieldKey, number | null>;
    for (const key of FIELD_ORDER) out[key] = parseFigure(values[key]);
    return out;
  }, [values]);

  const results = useMemo(() => {
    const ok = (v: number | null): v is number => v !== null && !Number.isNaN(v);
    const { area, rent, sales, margin, otherCosts } = parsed;

    const grossMargin = ok(sales) && ok(margin) ? (sales * margin) / 100 : null;
    // A blank cost field means zero cost, not an unanswerable sum: someone who
    // owns their property should not have to type 0 twice to see a total.
    const statedCosts =
      ok(rent) || ok(otherCosts)
        ? (ok(rent) ? rent : 0) + (ok(otherCosts) ? otherCosts : 0)
        : null;
    const leftOver =
      grossMargin !== null && statedCosts !== null ? grossMargin - statedCosts : null;
    const salesPerSqFt = ok(sales) && ok(area) && area > 0 ? sales / area : null;
    const rentShare = ok(rent) && ok(sales) && sales > 0 ? (rent / sales) * 100 : null;

    return { grossMargin, statedCosts, leftOver, salesPerSqFt, rentShare };
  }, [parsed]);

  const set = (key: FieldKey, next: string) =>
    setValues((prev) => ({ ...prev, [key]: next }));

  const rows: {
    key: keyof typeof results;
    label: string;
    value: string | null;
    note?: string;
  }[] = [
    {
      key: "grossMargin",
      label: copy.results.grossMargin,
      value: results.grossMargin === null ? null : rupees(results.grossMargin),
    },
    {
      key: "statedCosts",
      label: copy.results.statedCosts,
      value: results.statedCosts === null ? null : rupees(results.statedCosts),
    },
    {
      key: "leftOver",
      label: copy.results.leftOver,
      value: results.leftOver === null ? null : rupees(results.leftOver),
      note: copy.leftOverNote,
    },
    {
      key: "salesPerSqFt",
      label: copy.results.salesPerSqFt,
      value: results.salesPerSqFt === null ? null : rupees(results.salesPerSqFt),
    },
    {
      key: "rentShare",
      label: copy.results.rentShare,
      value: results.rentShare === null ? null : ratio(results.rentShare, "%"),
    },
  ];

  return (
    /* Focus lands on the title, not the first input, so a screen reader hears
       what this panel is and what the disclosure says before it reaches a
       numeric field. Modal applies it once the panel has arrived. */
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy={titleId}
      describedBy={noteId}
      initialFocusRef={titleRef}
    >
      <div className="calc">
        <h2 ref={titleRef} tabIndex={-1} id={titleId} className="t-h3 text-ink">
          {copy.heading}
        </h2>
        <p className="t-body measure mt-3 text-ink-soft">{copy.lead}</p>

        {/* The honesty rail. Above the fields, always visible, never behind a
            disclosure toggle, and the dialog's aria-describedby target. */}
        <p id={noteId} className="calc__note t-small">
          {copy.disclosure}
        </p>

        <div className="calc__grid">
          {FIELD_ORDER.map((key) => {
            const value = parsed[key];
            const invalid = Number.isNaN(value);
            const fieldId = `${uid}-${key}`;
            const helpId = `${uid}-${key}-help`;
            const errorId = `${uid}-${key}-error`;
            return (
              <div key={key} className="calc__field">
                <label className="field-label" htmlFor={fieldId}>
                  {copy.fields[key].label}
                </label>
                {/* Text, not number: inside a scrollable dialog a number input
                    lets the wheel silently change a figure the visitor set. */}
                <input
                  id={fieldId}
                  className="field-input"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={values[key]}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? `${helpId} ${errorId}` : helpId}
                  onChange={(event) => set(key, event.target.value)}
                />
                <p id={helpId} className="field-help">
                  {copy.fields[key].help}
                </p>
                {invalid ? (
                  <p id={errorId} className="field-error">
                    Enter a number, or leave this blank.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="calc__out">
          <p className="calc__result-note t-small">{copy.resultNote}</p>
          <dl>
            {rows.map((row) => (
              <div key={row.key} className="calc__row">
                <dt className="t-small text-ink-soft">
                  {row.label}
                  {row.note ? (
                    <span className="calc__row-note">{row.note}</span>
                  ) : null}
                </dt>
                <dd className={row.value ? "calc__figure" : "calc__figure calc__figure--empty"}>
                  {row.value ?? copy.results.empty}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="calc__foot">
          <Button href={copy.cta.href} variant="primary" className="press">
            {copy.cta.label}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
