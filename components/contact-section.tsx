"use client";

import { useState, useRef } from "react";
import type { ReactNode } from "react";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { t } from "@/lib/i18n";
import { API_URL } from "@/lib/api";
import { sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMIT_COOLDOWN_MS = 5_000;

function ContactForm({
  colors,
  lang,
  siteId,
  variantStyle,
}: {
  colors: Colors;
  lang?: string;
  siteId?: string;
  variantStyle: VariantStyle;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [validationError, setValidationError] = useState<string | null>(null);
  const lastSubmitRef = useRef(0);

  function validate(): string | null {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();
    if (!name || name.length > 100) return t("contact.form.error", lang);
    if (!email || !EMAIL_RE.test(email) || email.length > 254) return t("contact.form.error", lang);
    if (!message || message.length > 5000) return t("contact.form.error", lang);
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!siteId) {
      setStatus("error");
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < SUBMIT_COOLDOWN_MS) {
      return;
    }

    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    lastSubmitRef.current = now;
    setStatus("sending");

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(`${API_URL}/api/sites/${siteId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`${variantStyle.cardRadius} border p-8 text-center`}
        style={{
          background: colors.background,
          borderColor: mixColor(colors.primary, colors.background, 0.7),
        }}
      >
        <svg className="mx-auto mb-4 h-12 w-12" style={{ color: colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-semibold" style={{ color: colors.text }}>
          {t("contact.form.success", lang)}
        </p>
      </div>
    );
  }

  const inputRadius = variantStyle.cardRadius.replace("2xl", "xl").replace("3xl", "2xl");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: colors.text }}>
          {t("contact.form.name", lang)}
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full ${inputRadius} border px-4 py-3 text-sm outline-none transition-colors focus:ring-2`}
          style={{
            background: colors.background,
            borderColor: mixColor(colors.text, colors.background, 0.88),
            color: colors.text,
          }}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: colors.text }}>
          {t("contact.form.email", lang)}
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full ${inputRadius} border px-4 py-3 text-sm outline-none transition-colors focus:ring-2`}
          style={{
            background: colors.background,
            borderColor: mixColor(colors.text, colors.background, 0.88),
            color: colors.text,
          }}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: colors.text }}>
          {t("contact.form.message", lang)}
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`w-full resize-none ${inputRadius} border px-4 py-3 text-sm outline-none transition-colors focus:ring-2`}
          style={{
            background: colors.background,
            borderColor: mixColor(colors.text, colors.background, 0.88),
            color: colors.text,
          }}
        />
      </div>
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
      {status === "error" && !validationError && (
        <p className="text-sm text-red-600">{t("contact.form.error", lang)}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className={`w-full ${variantStyle.buttonRadius} px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:brightness-110 disabled:opacity-60`}
        style={{
          background: colors.primary,
          boxShadow: `0 2px 8px ${colors.primary}30`,
        }}
      >
        {status === "sending" ? t("contact.form.sending", lang) : t("contact.form.send", lang)}
      </button>
    </form>
  );
}

function ContactInfoItems({
  contactItems,
  colors,
  variantStyle,
}: {
  contactItems: { icon: ReactNode; label: string; value: string; href?: string }[];
  colors: Colors;
  variantStyle: VariantStyle;
}) {
  const gridClass =
    contactItems.length === 1
      ? "mx-auto max-w-sm"
      : contactItems.length === 2
        ? "mx-auto max-w-2xl sm:grid-cols-2"
        : "sm:grid-cols-3";

  return (
    <div className={`grid gap-5 ${gridClass}`}>
      {contactItems.map((item, i) => {
        const Tag = item.href ? "a" : "div";
        return (
          <Tag
            key={i}
            {...(item.href ? { href: item.href } : {})}
            className={`group ${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} p-7 transition-all duration-300 ${variantStyle.hoverEffect} ${variantStyle.cardShadow}`}
            style={{
              background: colors.background,
              ...(variantStyle.cardBorder ? { borderColor: mixColor(colors.text, colors.background, 0.93) } : {}),
            }}
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center ${variantStyle.iconRadius}`}
              style={{
                background: `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.88)}, ${mixColor(colors.accent, colors.background, 0.85)})`,
              }}
            >
              <svg
                className="h-6 w-6"
                style={{ color: colors.primary }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                {item.icon}
              </svg>
            </div>
            <p
              className="mb-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: mixColor(colors.text, colors.background, 0.55) }}
            >
              {item.label}
            </p>
            <p className="text-sm font-semibold" style={{ color: colors.text }}>
              {item.value}
            </p>
          </Tag>
        );
      })}
    </div>
  );
}

export function ContactSection({
  title,
  text,
  email,
  phone,
  address,
  colors,
  theme,
  lang,
  siteId,
  show_form = true,
  show_info = true,
  variantStyle,
}: {
  title?: string;
  text?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  colors: Colors;
  theme: Theme;
  lang?: string;
  siteId?: string;
  show_form?: boolean;
  show_info?: boolean;
  variantStyle: VariantStyle;
}) {
  const safeEmail = sanitizeEmail(email);
  const safePhone = sanitizePhone(phone);

  const contactItems = [
    safeEmail && {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      ),
      label: t("contact.email", lang),
      value: safeEmail,
      href: `mailto:${safeEmail}`,
    },
    safePhone && {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      ),
      label: t("contact.phone", lang),
      value: safePhone,
      href: `tel:${safePhone}`,
    },
    address && {
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </>
      ),
      label: t("contact.address", lang),
      value: address,
      href: undefined,
    },
  ].filter(Boolean) as { icon: ReactNode; label: string; value: string; href?: string }[];

  if (!contactItems.length && !title) return null;

  const isLeft = variantStyle.headerAlign === "left";
  const isTwoColumn = variantStyle.contactLayout === "two-column";

  return (
    <SectionWrap theme={theme} bg={colors.background} id="contact">
      <div className={`mx-auto ${isTwoColumn ? "max-w-5xl" : "max-w-4xl"}`}>
        {/* Header */}
        <div className={isTwoColumn ? "text-left" : "text-center"}>
          {title && (
            <Reveal>
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                {t("section.contact", lang)}
              </p>
              <h2
                className={`text-3xl ${theme.heading.weight} ${theme.heading.tracking} sm:text-4xl md:text-5xl`}
                style={{ color: colors.text }}
              >
                {title}
              </h2>
            </Reveal>
          )}
          {text && (
            <Reveal delay={80}>
              <p
                className={`mt-5 max-w-lg text-lg leading-relaxed ${isTwoColumn ? "" : "mx-auto"}`}
                style={{ color: mixColor(colors.text, colors.background, 0.4) }}
              >
                {text}
              </p>
            </Reveal>
          )}
        </div>

        {isTwoColumn ? (
          /* Two-column layout: info on left, form on right */
          <div className="mt-14 grid gap-12 sm:grid-cols-2">
            {show_info && contactItems.length > 0 && (
              <Reveal delay={160}>
                <div className="flex flex-col gap-6">
                  {contactItems.map((item, i) => {
                    const Tag = item.href ? "a" : "div";
                    return (
                      <Tag
                        key={i}
                        {...(item.href ? { href: item.href } : {})}
                        className="flex items-center gap-4 transition-colors"
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center ${variantStyle.iconRadius}`}
                          style={{
                            background: `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.88)}, ${mixColor(colors.accent, colors.background, 0.85)})`,
                          }}
                        >
                          <svg
                            className="h-5 w-5"
                            style={{ color: colors.primary }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            {item.icon}
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: mixColor(colors.text, colors.background, 0.55) }}>
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold" style={{ color: colors.text }}>
                            {item.value}
                          </p>
                        </div>
                      </Tag>
                    );
                  })}
                </div>
              </Reveal>
            )}
            {show_form && siteId && (
              <Reveal delay={240}>
                <ContactForm colors={colors} lang={lang} siteId={siteId} variantStyle={variantStyle} />
              </Reveal>
            )}
          </div>
        ) : (
          /* Centered / card layout */
          <>
            {show_info && contactItems.length > 0 && (
              <Reveal delay={160}>
                <div className="mt-14">
                  <ContactInfoItems contactItems={contactItems} colors={colors} variantStyle={variantStyle} />
                </div>
              </Reveal>
            )}

            {show_form && siteId && (
              <Reveal delay={240}>
                <div className={`mx-auto mt-14 max-w-lg text-left ${variantStyle.contactLayout === "card" ? `${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} ${variantStyle.cardPadding} ${variantStyle.cardShadow}` : ""}`}
                  style={variantStyle.contactLayout === "card" ? {
                    background: colors.background,
                    ...(variantStyle.cardBorder ? { borderColor: mixColor(colors.text, colors.background, 0.93) } : {}),
                  } : {}}
                >
                  <h3
                    className="mb-6 text-center text-xl font-semibold"
                    style={{ color: colors.text }}
                  >
                    {t("contact.form.title", lang)}
                  </h3>
                  <ContactForm colors={colors} lang={lang} siteId={siteId} variantStyle={variantStyle} />
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>
    </SectionWrap>
  );
}
