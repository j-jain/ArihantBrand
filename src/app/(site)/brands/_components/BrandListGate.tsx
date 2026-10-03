"use client";

import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { WhatsAppIcon, track } from "@/components";
import { whatsappFor } from "@/lib/whatsapp";
import { submitLeadAction } from "@/app/actions/lead";
import type { LeadInput } from "@/content/types";
import { privacyNote } from "@/content/seed";

interface BrandListGateProps {
  /** WhatsApp digits with country code, for the confirmation fallback. */
  whatsapp: string;
  /**
   * Where the brand-list PDF lives once it exists. Absent until the client
   * supplies the file: the gate then confirms that the list will be sent on
   * WhatsApp rather than linking to a 404.
   */
  fileHref?: string;
}

const PHONE_RE = /^(?:\+?91)?[6-9]\d{9}$/;

/**
 * The brand list is the single most requested thing on this site, and it used
 * to be free. Two fields is the cheapest gate that still produces a lead worth
 * calling: a name and a number, submitted through the same server action and
 * the same validation as the full inquiry form, tagged `retailer`.
 *
 * Nothing on the page is hidden behind it: the 77-logo wall stays open. Only
 * the take-away list is gated.
 */
export function BrandListGate({ whatsapp, fileHref }: BrandListGateProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const honeypotRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);

  const baseId = useId();
  const fieldId = (f: string) => `${baseId}-${f}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (honeypotRef.current?.value) {
      setSent(true);
      return;
    }

    const next: { name?: string; phone?: string } = {};
    if (!name.trim()) next.name = "Please tell us your name.";
    if (!phone.trim()) next.phone = "A number lets us send the list.";
    else if (!PHONE_RE.test(phone.replace(/[\s-]/g, "")))
      next.phone = "Enter a 10-digit Indian mobile number.";
    setErrors(next);
    if (next.name) {
      nameRef.current?.focus();
      return;
    }
    if (next.phone) {
      phoneRef.current?.focus();
      return;
    }

    const payload: LeadInput = {
      intent: "retailer",
      name: name.trim(),
      phone: phone.trim(),
      message: "Requested the brand list from /brands.",
      sourcePage: "/brands",
    };

    startTransition(async () => {
      try {
        const result = await submitLeadAction(payload);
        if (result.ok) {
          track("Brand list requested");
          setSent(true);
          window.setTimeout(() => doneRef.current?.focus(), 0);
        } else {
          setFormError(
            result.error ?? "Could not send that. Please WhatsApp us instead.",
          );
        }
      } catch {
        setFormError("Could not send that. Please WhatsApp us instead.");
      }
    });
  };

  if (sent) {
    return (
      <div className="brand-gate" role="status" aria-live="polite">
        <p
          ref={doneRef}
          tabIndex={-1}
          className="t-h4 text-ink"
        >
          Thank you. The list is on its way.
        </p>
        <p className="t-body measure mt-2 text-ink-soft">
          {fileHref
            ? "Download it below, or ask us on WhatsApp for the version with your categories only."
            : "We will send it on WhatsApp within one working day. Message us now if you want it sooner."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          {fileHref ? (
            <a className="btn btn-primary" href={fileHref} download>
              <span>Download the brand list</span>
            </a>
          ) : null}
          <a
            className="btn btn-secondary"
            href={whatsappFor("/brands", whatsapp).href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            <span>Ask on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="brand-gate" onSubmit={handleSubmit} noValidate>
      <h2 className="t-h3 text-ink">Get the full brand list</h2>
      <p className="t-body measure mt-2 text-ink-soft">
        Categories, labels and who distributes what. Two fields, then it is
        yours.
      </p>

      <div className="brand-gate__fields mt-6">
        <div>
          <label className="field-label" htmlFor={fieldId("name")}>
            Name{" "}
            <span aria-hidden="true" className="text-vermillion-deep">
              *
            </span>
          </label>
          <input
            ref={nameRef}
            id={fieldId("name")}
            name="name"
            className="field-input"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? `${fieldId("name")}-err` : undefined}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name ? (
            <p id={`${fieldId("name")}-err`} className="field-error" aria-live="polite">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor={fieldId("phone")}>
            Phone{" "}
            <span aria-hidden="true" className="text-vermillion-deep">
              *
            </span>
          </label>
          <input
            ref={phoneRef}
            id={fieldId("phone")}
            name="phone"
            className="field-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-required="true"
            aria-invalid={errors.phone ? "true" : undefined}
            aria-describedby={errors.phone ? `${fieldId("phone")}-err` : undefined}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone ? (
            <p id={`${fieldId("phone")}-err`} className="field-error" aria-live="polite">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className="brand-gate__submit">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isPending}
            aria-busy={isPending}
          >
            <span>{isPending ? "Sending…" : "Send me the list"}</span>
            {isPending ? null : (
              <span className="btn__chevron" aria-hidden="true">
                ▸
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Honeypot — hidden from users and assistive tech. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={fieldId("website")}>Website</label>
        <input
          ref={honeypotRef}
          id={fieldId("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {formError ? (
        <p className="field-error mt-3" role="alert">
          {formError}
        </p>
      ) : null}

      <p className="form-privacy t-small mt-3 text-ink-soft">{privacyNote}</p>
    </form>
  );
}
