"use client";

import { useState } from "react";
import type { Colors, FAQItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import { mixColor } from "@/lib/colors";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";

function FAQAccordion({
  item,
  colors,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  colors: Colors;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border transition-all duration-300"
      style={{
        background: colors.background,
        borderColor: isOpen
          ? mixColor(colors.primary, colors.background, 0.7)
          : mixColor(colors.text, colors.background, 0.93),
        boxShadow: isOpen ? `0 4px 16px ${colors.primary}10` : "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors sm:p-7"
      >
        <span
          className="text-base font-semibold sm:text-lg"
          style={{ color: colors.text }}
        >
          {item.question}
        </span>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300"
          style={{
            background: mixColor(colors.primary, colors.background, 0.9),
            color: colors.primary,
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      <div
        className="transition-all duration-300 ease-out"
        style={{
          maxHeight: isOpen ? "500px" : "0",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: mixColor(colors.text, colors.background, 0.35) }}
          >
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection({
  title,
  subtitle,
  items,
  colors,
  theme,
}: {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
  colors: Colors;
  theme: Theme;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items?.length) return null;

  return (
    <SectionWrap theme={theme} bg={colors.background}>
      <div className="mx-auto max-w-3xl">
        {title && (
          <Reveal>
            <div className="mb-14 text-center">
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                FAQ
              </p>
              <h2
                className={`text-3xl ${theme.heading.weight} ${theme.heading.tracking} sm:text-4xl md:text-5xl`}
                style={{ color: colors.text }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className="mx-auto mt-5 max-w-lg text-lg leading-relaxed"
                  style={{ color: mixColor(colors.text, colors.background, 0.4) }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </Reveal>
        )}

        <div className="flex flex-col gap-3">
          {items.map((faq, i) => (
            <Reveal key={i} delay={i * 60}>
              <FAQAccordion
                item={faq}
                colors={colors}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}
