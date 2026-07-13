import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "onDark";

interface ButtonProps {
  href?: string;
  type?: "button" | "submit" | "reset";
  variant: Variant;
  size?: "md" | "lg";
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  onDark: "btn-ondark",
};

/** The one primary action treatment sitewide: 2px radius, >=44/48px target,
 *  a brand chevron that nudges right on hover. Renders a Link when `href` is
 *  set, otherwise a native button. */
export function Button({
  href,
  type = "button",
  variant,
  size = "md",
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "btn",
    variantClass[variant],
    size === "lg" && "btn-lg",
    className,
  );

  const inner = (
    <>
      <span>{children}</span>
      <span className="btn__chevron" aria-hidden="true">
        ▸
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {inner}
    </button>
  );
}
