"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import type { LeadInput, LeadResult } from "@/content/types";
import { cn } from "./cn";
import { WhatsAppIcon } from "./icons";

type Intent = LeadInput["intent"];
type FieldName = "name" | "phone" | "email" | "city" | "company" | "message";
type Errors = Partial<Record<FieldName, string>>;

interface InquiryFormProps {
  action: (data: LeadInput) => Promise<LeadResult>;
  defaultIntent?: Intent;
  sourcePage: string;
  compact?: boolean;
  /** Optional WhatsApp digits for the confirmation fallback link. */
  whatsapp?: string;
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

function companyLabel(intent: Intent): string {
  if (intent === "retailer") return "Store name";
  if (intent === "brand") return "Brand name";
  return "Company";
}

function messagePlaceholder(intent: Intent): string {
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

export function InquiryForm({
  action,
  defaultIntent,
  sourcePage,
  compact = false,
  whatsapp,
}: InquiryFormProps) {
  const [intent, setIntent] = useState<Intent | null>(defaultIntent ?? null);
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
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const wantFocus = useRef(false);

  const baseId = useId();
  const fieldId = (f: FieldName | "website") => `${baseId}-${f}`;

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

  // Move focus to the first field only when the reader picks an intent (never
  // on initial mount, so a ?intent= deep link doesn't steal focus/scroll).
  useEffect(() => {
    if (intent && wantFocus.current) {
      wantFocus.current = false;
      nameRef.current?.focus();
    }
  }, [intent]);

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
    if (!intent) return;

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
      <div className="flex flex-col gap-3" role="status" aria-live="polite">
        <h3 className="t-h2 text-ink">Received.</h3>
        <p className="t-lead measure text-ink-soft">
          Thank you — we respond within two working days.
        </p>
        {whatsapp ? (
          <a
            className="channel-link mt-1"
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="channel-icon">
              <WhatsAppIcon />
            </span>
            Prefer to talk now? Message us on WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      {/* Step 1 — intent */}
      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="field-label mb-1 p-0">
          What brings you to Arihant?
        </legend>
        <div
          className={cn(
            "grid gap-3",
            compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {INTENTS.map((option) => (
            <label key={option.value} className="intent-card">
              <input
                type="radio"
                name="intent"
                value={option.value}
                checked={intent === option.value}
                onChange={() => {
                  wantFocus.current = true;
                  setIntent(option.value);
                }}
                className="sr-only"
              />
              <span className="t-h4 text-ink">{option.title}</span>
              <span className="t-small text-ink-soft">{option.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Step 2 — details (revealed after an intent is chosen) */}
      {intent ? (
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
                aria-describedby={errors.name ? `${fieldId("name")}-err` : undefined}
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
                10-digit mobile — we&apos;ll call or WhatsApp you.
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
          </div>
        </div>
      ) : null}
    </form>
  );
}
