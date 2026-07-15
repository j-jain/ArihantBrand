"use client";

import Image from "next/image";
import type { Partner } from "@/content/types";
import { UNIT_ACCENT, unitScope } from "@/lib/units";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface PartnerModalProps {
  /** The brand currently selected, or null when the wall has none. */
  partner: Partner | null;
  open: boolean;
  onClose: () => void;
}

const TITLE_ID = "partner-modal-title";

/** One shared modal for the whole logo wall, driven by the selected partner.
 *  Shows the brand mark large, which Arihant business distributes it (scoped in
 *  that unit's decorative accent), its verified category when we have one, and a
 *  single sitewide-vermillion CTA to stock the label. */
export function PartnerModal({ partner, open, onClose }: PartnerModalProps) {
  return (
    <Modal open={open} onClose={onClose} labelledBy={TITLE_ID}>
      {partner ? (
        <div
          style={unitScope(partner.unit)}
          className="flex flex-col items-start gap-6"
        >
          {/* Brand mark, larger than a wall tile */}
          <div className="relative aspect-[3/2] w-full max-w-[15rem] rounded-md border border-line bg-white p-8">
            <div className="relative h-full w-full">
              <Image
                src={partner.image}
                alt=""
                fill
                sizes="240px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 id={TITLE_ID} className="t-h3 text-ink">
              {partner.name}
            </h2>
            <span
              aria-hidden="true"
              className="block h-[3px] w-14 rounded-full"
              style={{ background: "var(--unit-accent)" }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className="t-small inline-flex items-center rounded-full px-3 py-1 text-ink"
              style={{ background: "var(--unit-accent-wash)", fontWeight: 650 }}
            >
              Distributed by {UNIT_ACCENT[partner.unit].name}
            </span>
            {partner.category ? (
              <span
                className="t-small inline-flex items-center rounded-full border border-line px-3 py-1 text-ink-soft"
                style={{ fontWeight: 600 }}
              >
                {partner.category}
              </span>
            ) : null}
          </div>

          <p className="t-body measure text-ink-soft">
            Talk to the {UNIT_ACCENT[partner.unit].name} team about ranging{" "}
            {partner.name} for your store and the terms that come with it.
          </p>

          <div className="mt-1">
            <Button variant="primary" href="/contact?intent=retailer">
              Stock this label
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
