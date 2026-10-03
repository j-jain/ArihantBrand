"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import Link from "next/link";
import type {
  LeadInput,
  LeadResult,
  SiteSettings,
  UnitContact,
} from "@/content/types";
import { gsap, useGSAP, EASE, DUR } from "@/lib/gsap";
import { track } from "./Analytics";
import { cn } from "./cn";
import { PhoneIcon, WhatsAppIcon } from "./icons";
import { privacyNote } from "@/content/seed";

type Intent = LeadInput["intent"];
type FieldName = "name" | "phone" | "email" | "city" | "company" | "message";
type Errors = Partial<Record<FieldName, string>>;
type Step = 1 | 2;

interface InquiryFormProps {
  action: (data: LeadInput) => Promise<LeadResult>;
  defaultIntent?: Intent;
  sourcePage: string;
  compact?: boolean;
  /** Optional WhatsApp digits for the confirmation fallback link. */
  whatsapp?: string;
  /**
   * Optional site contacts. When present, step 2 shows a routing panel with the
   * unit that will handle this inquiry. Absent (e.g. /partner) → no panel, no
   * layout hole. Safe default keeps every existing call-site compiling.
   */
  contacts?: SiteSettings["contacts"];
}

const INTENTS: { value: Intent; title: string; desc: string }[] = [
  {
    value: "retailer",
    title: "Retailer",
    desc: "I run a store and want to stock national brands.",
  },
  {
    value: "brand",
    title: "Brand",
    desc: "I'm a brand seeking Northeast India distribution.",
  },
  {
    value: "franchise",
    title: "Franchise investor",
    desc: "I want to own a managed Arihant Retail store.",
  },
  {
    value: "other",
    title: "Something else",
    desc: "A different question or partnership.",
  },
];

/** One helper line per intent, shown under the cards on step 1. `careers` is
 *  still a valid stored intent (old leads carry it) but is no longer offered,
 *  so it is deliberately absent from the chooser and from this map. */
const INTENT_HELPER: Partial<Record<Intent, string>> = {
  retailer: "You stock brands. This routes to the Arihant Marketing desk.",
  brand: "You're a brand. This routes to Arihant Marketing's distribution desk.",
  franchise: "A franchise enquiry. This routes to the Arihant Retail desk.",
  other: "Tell us what you need and we'll point you to the right desk.",
};

const PHONE_RE = /^(?:\+?91)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_ORDER: FieldName[] = [
  "name",
  "phone",
  "email",
  "city",
  "company",
  "message",
];

function companyLabel(intent: Intent | null): string {
  if (intent === "retailer") return "Store name";
  if (intent === "brand") return "Brand name";
  return "Company";
}

function messagePlaceholder(intent: Intent | null): string {
  switch (intent) {
    case "retailer":
      return "Which city is your store in, and what do you currently stock?";
    case "brand":
      return "Tell us about your brand and where it's distributed today.";
    case "franchise":
      return "Your city, the space you have, and your timeline.";
    default:
      return "How can we help?";
  }
}

function validateField(field: FieldName, value: string): string | undefined {
  const v = value.trim();
  if (field === "name" && !v) return "Please tell us your name.";
  if (field === "phone") {
    if (!v) return "A number lets us call or WhatsApp you.";
    if (!PHONE_RE.test(v.replace(/[\s-]/g, "")))
      return "Enter a 10-digit Indian mobile number.";
  }
  if (field === "email" && v && !EMAIL_RE.test(v))
    return "That email address doesn't look right.";
  return undefined;
}

/** Group phone into 5-5 (94350 45528) for readability. */
function formatPhone(phone: string): string {
  return phone.replace(/(\d{5})(\d{5})/, "$1 $2");
}

/**
 * Intent → the unit that handles it:
 *  retailer / brand / other → Arihant Marketing, franchise → Arihant Retail.
 * Falls back to marketing, then the first contact, so the panel is never empty.
 */
function routeContact(
  contacts: SiteSettings["contacts"] | undefined,
  intent: Intent | null,
): UnitContact | null {
  if (!contacts || contacts.length === 0) return null;
  const unit = intent === "franchise" ? "retail" : "marketing";
  return (
    contacts.find((c) => c.unit === unit) ??
    contacts.find((c) => c.unit === "marketing") ??
    contacts[0] ??
    null
  );
}

export function InquiryForm({
  action,
  defaultIntent,
  sourcePage,
  compact = false,
  whatsapp,
  contacts,
}: InquiryFormProps) {
  const [intent, setIntent] = useState<Intent | null>(defaultIntent ?? null);
  // A pre-selected intent (deep link / partner) lands straight on the fields.
  const [step, setStep] = useState<Step>(defaultIntent ? 2 : 1);
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: "",
    phone: "",
    email: "",
    city: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const honeypotRef = useRef<HTMLInputElement>(null);
  const firstIntentRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Step transition plumbing.
  const shellRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const fromHeightRef = useRef<number | null>(null); // outgoing panel height
  const hasMountedRef = useRef(false); // skip the transition on first render
  const wantFocusRef = useRef(false); // only move focus on a user-driven step

  const baseId = useId();
  const fieldId = (f: FieldName | "website") => `${baseId}-${f}`;

  const chosen = INTENTS.find((o) => o.value === intent) ?? null;
  const routed = routeContact(contacts, intent);

  const refFor = (field: FieldName): HTMLElement | null => {
    switch (field) {
      case "name":
        return nameRef.current;
      case "phone":
        return phoneRef.current;
      case "email":
        return emailRef.current;
      case "city":
        return cityRef.current;
      case "company":
        return companyRef.current;
      case "message":
        return messageRef.current;
    }
  };

  // Move focus into the newly-shown step — but only after a user action (never
  // on mount, so a ?intent= deep link doesn't steal focus/scroll).
  useEffect(() => {
    if (!wantFocusRef.current) return;
    wantFocusRef.current = false;
    const id = window.setTimeout(() => {
      if (step === 2) nameRef.current?.focus({ preventScroll: true });
      else firstIntentRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(id);
  }, [step]);

  // Focus the confirmation heading when the form is replaced.
  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  // GSAP step transition: height tween + autoAlpha/x crossfade, gated for
  // reduced motion (instant swap). Runs only when `step` changes.
  useGSAP(
    () => {
      const shell = shellRef.current;
      const incoming = step === 1 ? step1Ref.current : step2Ref.current;
      const outgoing = step === 1 ? step2Ref.current : step1Ref.current;
      if (!shell || !incoming || !outgoing) return;

      // Keep the hidden panel out of the tab order / a11y tree at all times.
      outgoing.inert = true;
      incoming.inert = false;

      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return; // first render: no transition, CSS holds the rest state
      }

      const fromHeight = fromHeightRef.current ?? outgoing.offsetHeight;
      const dir = step === 2 ? 1 : -1;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const toHeight = incoming.offsetHeight;
        gsap.set(shell, { height: fromHeight });
        gsap.set(outgoing, { autoAlpha: 1, x: 0, zIndex: 1 });
        gsap.set(incoming, { opacity: 0, visibility: "visible", x: 24 * dir, zIndex: 2 });

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          onComplete: () => {
            gsap.set([outgoing, incoming], {
              clearProps: "opacity,visibility,transform,zIndex",
            });
            gsap.set(shell, { clearProps: "height" });
          },
        });
        tl.to(outgoing, { autoAlpha: 0, x: -24 * dir, duration: DUR * 0.55 }, 0)
          .to(incoming, { opacity: 1, x: 0, duration: DUR }, DUR * 0.2)
          .to(shell, { height: toHeight, duration: DUR * 0.9 }, 0);

        return () => tl.kill();
      });

      return () => mm.revert();
    },
    { dependencies: [step], scope: shellRef },
  );

  const goToStep = (next: Step) => {
    const current = step === 1 ? step1Ref.current : step2Ref.current;
    fromHeightRef.current = current?.offsetHeight ?? null;
    wantFocusRef.current = true;
    setStep(next);
  };

  const setValue = (field: FieldName, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleBlur = (field: FieldName) => {
    const message = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    // Honeypot: a bot filled the hidden field — pretend success, submit nothing.
    if (honeypotRef.current?.value) {
      setSubmitted(true);
      return;
    }
    // Intent is required. The disabled "Continue" makes this unreachable via the
    // UI, but guard anyway: send the reader back to step 1 to choose one.
    if (!intent) {
      goToStep(1);
      return;
    }

    const nextErrors: Errors = {};
    for (const field of FIELD_ORDER) {
      const message = validateField(field, values[field]);
      if (message) nextErrors[field] = message;
    }
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    if (firstInvalid) {
      refFor(firstInvalid)?.focus();
      return;
    }

    const payload: LeadInput = {
      intent,
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || undefined,
      city: values.city.trim() || undefined,
      company: values.company.trim() || undefined,
      message: values.message.trim() || undefined,
      sourcePage,
    };

    startTransition(async () => {
      try {
        const result = await action(payload);
        if (result.ok) {
          track("Inquiry submitted", { intent, source: sourcePage });
          setSubmitted(true);
        } else {
          setFormError(
            result.error ??
              "Something went wrong sending your inquiry. Please call or WhatsApp us instead.",
          );
        }
      } catch {
        setFormError(
          "Something went wrong sending your inquiry. Please call or WhatsApp us instead.",
        );
      }
    });
  };

  if (submitted) {
    return (
      <div className="form-received flex flex-col gap-4" role="status" aria-live="polite">
        <span className="received-check" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="#fff"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h3 ref={successRef} tabIndex={-1} className="t-h3 text-ink received-heading">
          Received.
        </h3>
        <p className="t-lead measure text-ink-soft">
          Thank you. We will call you within one working day.
        </p>
        <p className="t-body measure text-ink-soft">
          If it is urgent, WhatsApp us and we will pick it up faster.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3">
          {whatsapp ? (
            <a
              className="btn btn-secondary"
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              <span>Message us on WhatsApp</span>
            </a>
          ) : null}
          <Link href="/blog" className="received-quiet-link">
            <span>Read Trade Notes while you wait</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="inquiry-form flex flex-col gap-6"
    >
      <p className="t-label step-indicator">Step {step} of 2</p>

      <div className="step-shell" ref={shellRef}>
        {/* Step 1 — intent (required to continue) */}
        <div
          className="step-panel"
          ref={step1Ref}
          data-active={step === 1 ? "true" : undefined}
        >
          <fieldset className="flex flex-col gap-3 border-0 p-0">
            <legend
              id={`${baseId}-intent-legend`}
              className="field-label mb-1 p-0"
            >
              What brings you to Arihant?
            </legend>
            <div
              role="radiogroup"
              aria-labelledby={`${baseId}-intent-legend`}
              className={cn(
                "grid gap-3",
                compact ? "sm:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-4",
              )}
            >
              {INTENTS.map((option, i) => (
                <label key={option.value} className="intent-card">
                  <input
                    ref={i === 0 ? firstIntentRef : undefined}
                    type="radio"
                    name="intent"
                    value={option.value}
                    checked={intent === option.value}
                    onChange={() => setIntent(option.value)}
                    className="sr-only"
                  />
                  <span className="intent-card__title">{option.title}</span>
                  <span className="t-small text-ink-soft">{option.desc}</span>
                </label>
              ))}
            </div>

            <p className="field-help" aria-live="polite">
              {intent ? INTENT_HELPER[intent] : "Choose one to continue."}
            </p>

            <div className="mt-2">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={!intent}
                onClick={() => goToStep(2)}
              >
                <span>Continue</span>
                <span className="btn__chevron" aria-hidden="true">
                  ▸
                </span>
              </button>
            </div>
          </fieldset>
        </div>

        {/* Step 2 — details (always mounted; hidden + inert on step 1) */}
        <div
          className="step-panel"
          ref={step2Ref}
          data-active={step === 2 ? "true" : undefined}
        >
          <div className="flex flex-col gap-6">
            <div className="intent-chip-row">
              <span className="intent-chip">
                <span className="intent-chip__dot" aria-hidden="true" />
                {chosen?.title ?? "Your inquiry"}
              </span>
              <button
                type="button"
                className="intent-chip__change"
                onClick={() => goToStep(1)}
              >
                Change
              </button>
            </div>

            <div className={cn("inquiry-grid", routed && "inquiry-grid--rail")}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
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
                      aria-describedby={
                        errors.name ? `${fieldId("name")}-err` : undefined
                      }
                      value={values.name}
                      onChange={(e) => setValue("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                    />
                    {errors.name ? (
                      <p
                        id={`${fieldId("name")}-err`}
                        className="field-error"
                        aria-live="polite"
                      >
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
                      aria-describedby={cn(
                        `${fieldId("phone")}-help`,
                        errors.phone && `${fieldId("phone")}-err`,
                      )}
                      value={values.phone}
                      onChange={(e) => setValue("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                    />
                    <p id={`${fieldId("phone")}-help`} className="field-help">
                      10-digit mobile. We&apos;ll call or WhatsApp you.
                    </p>
                    {errors.phone ? (
                      <p
                        id={`${fieldId("phone")}-err`}
                        className="field-error"
                        aria-live="polite"
                      >
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="field-label" htmlFor={fieldId("email")}>
                      Email
                    </label>
                    <input
                      ref={emailRef}
                      id={fieldId("email")}
                      name="email"
                      className="field-input"
                      type="email"
                      autoComplete="email"
                      aria-invalid={errors.email ? "true" : undefined}
                      aria-describedby={
                        errors.email ? `${fieldId("email")}-err` : undefined
                      }
                      value={values.email}
                      onChange={(e) => setValue("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                    />
                    {errors.email ? (
                      <p
                        id={`${fieldId("email")}-err`}
                        className="field-error"
                        aria-live="polite"
                      >
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="field-label" htmlFor={fieldId("city")}>
                      City
                    </label>
                    <input
                      ref={cityRef}
                      id={fieldId("city")}
                      name="city"
                      className="field-input"
                      type="text"
                      autoComplete="address-level2"
                      value={values.city}
                      onChange={(e) => setValue("city", e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor={fieldId("company")}>
                      {companyLabel(intent)}
                    </label>
                    <input
                      ref={companyRef}
                      id={fieldId("company")}
                      name="company"
                      className="field-input"
                      type="text"
                      autoComplete="organization"
                      value={values.company}
                      onChange={(e) => setValue("company", e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor={fieldId("message")}>
                      Message
                    </label>
                    <textarea
                      ref={messageRef}
                      id={fieldId("message")}
                      name="message"
                      className="field-input"
                      rows={4}
                      placeholder={messagePlaceholder(intent)}
                      value={values.message}
                      onChange={(e) => setValue("message", e.target.value)}
                    />
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
                  <p className="field-error" role="alert">
                    {formError}
                  </p>
                ) : null}

                <div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isPending}
                    aria-busy={isPending}
                  >
                    <span>{isPending ? "Sending…" : "Send inquiry"}</span>
                    {isPending ? null : (
                      <span className="btn__chevron" aria-hidden="true">
                        ▸
                      </span>
                    )}
                  </button>
                  <p className="form-privacy t-small mt-3 text-ink-soft">{privacyNote}</p>
                </div>
              </div>

              {routed ? (
                <aside
                  className="routing-rail"
                  aria-label="Who will handle your inquiry"
                >
                  <p className="t-label" style={{ color: "var(--ink-soft)" }}>
                    Routed to
                  </p>
                  <p
                    className="mt-1 font-display text-ink"
                    style={{ fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.2 }}
                  >
                    {routed.businessName}
                  </p>
                  <ul className="mt-3 flex flex-col">
                    {routed.phones.map((person) => (
                      <li key={person.phone}>
                        <a className="channel-link" href={`tel:+91${person.phone}`}>
                          <span className="channel-icon">
                            <PhoneIcon />
                          </span>
                          <span>
                            <span style={{ fontWeight: 650 }}>{person.name}</span>
                            {" · "}
                            {formatPhone(person.phone)}
                          </span>
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        className="channel-link"
                        href={`https://wa.me/${routed.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="channel-icon">
                          <WhatsAppIcon />
                        </span>
                        <span>WhatsApp</span>
                      </a>
                    </li>
                  </ul>
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
