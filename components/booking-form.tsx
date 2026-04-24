"use client";

import { useState, useEffect } from "react";
import { submitBooking } from "@/lib/api";
import { t } from "@/lib/i18n";
import type { Colors } from "@/lib/types";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
}

interface FormField {
  id: string;
  label: string;
  field_type: string;
  placeholder: string | null;
  is_required: boolean;
  options: string[] | null;
  sort_order: number;
}

interface PaymentMethods {
  stripe_connect_enabled: boolean;
  on_site_enabled: boolean;
  klarna_enabled: boolean;
  swish_enabled: boolean;
  connected_account_id?: string;
}

interface BookingFormProps {
  siteId: string;
  services: Service[];
  formFields: FormField[];
  paymentMethods: PaymentMethods | null;
  colors: Colors;
  lang: string;
}

function formatPrice(price: number, currency: string, lang: string): string {
  if (price === 0) return t("booking.free", lang);
  const locale = lang === "sv" ? "sv-SE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `${(n >> 16) & 0xff}, ${(n >> 8) & 0xff}, ${n & 0xff}`;
}

export default function BookingForm({
  siteId,
  services,
  formFields,
  paymentMethods,
  colors,
  lang,
}: BookingFormProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    email: "",
    phone: "",
    booking_date: "",
  });
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // Auto-select if only one service
  useEffect(() => {
    if (services.length === 1 && !selectedService) {
      setSelectedService(services[0].id);
    }
  }, [services, selectedService]);

  // Auto-select first available payment method
  useEffect(() => {
    if (paymentMethods && !paymentMethod) {
      if (paymentMethods.on_site_enabled) setPaymentMethod("on_site");
      else if (paymentMethods.stripe_connect_enabled) setPaymentMethod("card");
      else if (paymentMethods.swish_enabled) setPaymentMethod("swish");
      else if (paymentMethods.klarna_enabled) setPaymentMethod("klarna");
    }
  }, [paymentMethods, paymentMethod]);

  const sortedFormFields = [...formFields].sort((a, b) => a.sort_order - b.sort_order);

  const hasPaymentOptions = paymentMethods && (
    paymentMethods.on_site_enabled ||
    paymentMethods.stripe_connect_enabled ||
    paymentMethods.klarna_enabled ||
    paymentMethods.swish_enabled
  );

  function validate(): boolean {
    const errors: Record<string, boolean> = {};
    if (!selectedService) errors.service = true;
    if (!formData.name.trim()) errors.name = true;
    if (!formData.email.trim()) errors.email = true;
    if (!formData.booking_date) errors.booking_date = true;
    if (hasPaymentOptions && !paymentMethod) errors.payment = true;

    for (const field of sortedFormFields) {
      if (field.is_required && !customFields[field.id]?.trim()) {
        errors[`custom_${field.id}`] = true;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        service_id: selectedService,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        booking_date: formData.booking_date,
        payment_method: paymentMethod || undefined,
        custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
      };

      const result = await submitBooking(siteId, payload);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t("booking.error", lang));
    } finally {
      setSubmitting(false);
    }
  }

  const primaryRgb = hexToRgb(colors.primary);

  // Success state
  if (success) {
    return (
      <div className="text-center py-16">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ backgroundColor: `rgba(${primaryRgb}, 0.1)` }}
        >
          <svg className="w-10 h-10" style={{ color: colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
          {t("booking.success", lang)}
        </h2>
        <p className="text-base opacity-70" style={{ color: colors.text }}>
          {t("booking.successMessage", lang)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Step 1: Service Selection */}
      {services.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            {t("booking.selectService", lang)}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => {
              const isSelected = selectedService === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(service.id);
                    setValidationErrors((prev) => ({ ...prev, service: false }));
                  }}
                  className="relative text-left rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-md"
                  style={{
                    borderColor: isSelected ? colors.primary : `rgba(${hexToRgb(colors.text)}, 0.12)`,
                    backgroundColor: isSelected ? `rgba(${primaryRgb}, 0.04)` : "transparent",
                    boxShadow: isSelected ? `0 0 0 1px ${colors.primary}` : "none",
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <h3 className="font-semibold text-base pr-8" style={{ color: colors.text }}>
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-1.5 text-sm opacity-60" style={{ color: colors.text }}>
                      {service.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 opacity-50" style={{ color: colors.text }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.duration_minutes} {t("booking.duration", lang)}
                    </span>
                    <span className="font-semibold" style={{ color: colors.primary }}>
                      {formatPrice(service.price, service.currency, lang)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {validationErrors.service && (
            <p className="mt-2 text-sm text-red-500">{t("booking.required", lang)}</p>
          )}
        </section>
      )}

      {/* Step 2: Customer Details */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          {t("booking.yourDetails", lang)}
        </h2>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
              {t("booking.name", lang)} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setValidationErrors((prev) => ({ ...prev, name: false }));
              }}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                borderColor: validationErrors.name ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`,
                backgroundColor: "transparent",
                color: colors.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 3px rgba(${primaryRgb}, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = validationErrors.name ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`;
                e.target.style.boxShadow = "none";
              }}
              placeholder={t("booking.name", lang)}
            />
            {validationErrors.name && (
              <p className="mt-1 text-xs text-red-500">{t("booking.required", lang)}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
              {t("booking.email", lang)} <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setValidationErrors((prev) => ({ ...prev, email: false }));
              }}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                borderColor: validationErrors.email ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`,
                backgroundColor: "transparent",
                color: colors.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 3px rgba(${primaryRgb}, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = validationErrors.email ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`;
                e.target.style.boxShadow = "none";
              }}
              placeholder={t("booking.email", lang)}
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-500">{t("booking.required", lang)}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
              {t("booking.phone", lang)}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                borderColor: `rgba(${hexToRgb(colors.text)}, 0.15)`,
                backgroundColor: "transparent",
                color: colors.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 3px rgba(${primaryRgb}, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = `rgba(${hexToRgb(colors.text)}, 0.15)`;
                e.target.style.boxShadow = "none";
              }}
              placeholder={t("booking.phone", lang)}
            />
          </div>

          {/* Custom form fields */}
          {sortedFormFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                {field.label}
                {field.is_required && <span className="text-red-400"> *</span>}
              </label>

              {field.field_type === "textarea" ? (
                <textarea
                  value={customFields[field.id] || ""}
                  onChange={(e) => {
                    setCustomFields({ ...customFields, [field.id]: e.target.value });
                    setValidationErrors((prev) => ({ ...prev, [`custom_${field.id}`]: false }));
                  }}
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200 min-h-[100px] resize-y"
                  style={{
                    borderColor: validationErrors[`custom_${field.id}`] ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`,
                    backgroundColor: "transparent",
                    color: colors.text,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px rgba(${primaryRgb}, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = validationErrors[`custom_${field.id}`] ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder={field.placeholder || ""}
                />
              ) : field.field_type === "select" && field.options ? (
                <select
                  value={customFields[field.id] || ""}
                  onChange={(e) => {
                    setCustomFields({ ...customFields, [field.id]: e.target.value });
                    setValidationErrors((prev) => ({ ...prev, [`custom_${field.id}`]: false }));
                  }}
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{
                    borderColor: validationErrors[`custom_${field.id}`] ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`,
                    backgroundColor: "transparent",
                    color: colors.text,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px rgba(${primaryRgb}, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = validationErrors[`custom_${field.id}`] ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`;
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">{field.placeholder || `-- ${field.label} --`}</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.field_type === "checkbox" ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customFields[field.id] === "true"}
                    onChange={(e) => {
                      setCustomFields({ ...customFields, [field.id]: e.target.checked ? "true" : "false" });
                      setValidationErrors((prev) => ({ ...prev, [`custom_${field.id}`]: false }));
                    }}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: colors.primary }}
                  />
                  <span className="text-sm" style={{ color: colors.text }}>{field.placeholder || ""}</span>
                </label>
              ) : (
                <input
                  type={field.field_type === "email" ? "email" : field.field_type === "number" ? "number" : "text"}
                  value={customFields[field.id] || ""}
                  onChange={(e) => {
                    setCustomFields({ ...customFields, [field.id]: e.target.value });
                    setValidationErrors((prev) => ({ ...prev, [`custom_${field.id}`]: false }));
                  }}
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{
                    borderColor: validationErrors[`custom_${field.id}`] ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`,
                    backgroundColor: "transparent",
                    color: colors.text,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px rgba(${primaryRgb}, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = validationErrors[`custom_${field.id}`] ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder={field.placeholder || ""}
                />
              )}

              {validationErrors[`custom_${field.id}`] && (
                <p className="mt-1 text-xs text-red-500">{t("booking.required", lang)}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Step 3: Date Selection */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          {t("booking.date", lang)}
        </h2>
        <input
          type="date"
          value={formData.booking_date}
          onChange={(e) => {
            setFormData({ ...formData, booking_date: e.target.value });
            setValidationErrors((prev) => ({ ...prev, booking_date: false }));
          }}
          min={new Date().toISOString().split("T")[0]}
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200"
          style={{
            borderColor: validationErrors.booking_date ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`,
            backgroundColor: "transparent",
            color: colors.text,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primary;
            e.target.style.boxShadow = `0 0 0 3px rgba(${primaryRgb}, 0.1)`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = validationErrors.booking_date ? "#ef4444" : `rgba(${hexToRgb(colors.text)}, 0.15)`;
            e.target.style.boxShadow = "none";
          }}
        />
        {validationErrors.booking_date && (
          <p className="mt-1 text-xs text-red-500">{t("booking.required", lang)}</p>
        )}
      </section>

      {/* Step 4: Payment Method */}
      {hasPaymentOptions && (
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            {t("booking.paymentMethod", lang)}
          </h2>
          <div className="space-y-2">
            {paymentMethods.on_site_enabled && (
              <label
                className="flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: paymentMethod === "on_site" ? colors.primary : `rgba(${hexToRgb(colors.text)}, 0.12)`,
                  backgroundColor: paymentMethod === "on_site" ? `rgba(${primaryRgb}, 0.04)` : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="on_site"
                  checked={paymentMethod === "on_site"}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, payment: false }));
                  }}
                  className="w-4 h-4"
                  style={{ accentColor: colors.primary }}
                />
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-50" style={{ color: colors.text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    {t("booking.payOnSite", lang)}
                  </span>
                </div>
              </label>
            )}

            {paymentMethods.stripe_connect_enabled && (
              <label
                className="flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: paymentMethod === "card" ? colors.primary : `rgba(${hexToRgb(colors.text)}, 0.12)`,
                  backgroundColor: paymentMethod === "card" ? `rgba(${primaryRgb}, 0.04)` : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, payment: false }));
                  }}
                  className="w-4 h-4"
                  style={{ accentColor: colors.primary }}
                />
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-50" style={{ color: colors.text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    {t("booking.payWithCard", lang)}
                  </span>
                </div>
              </label>
            )}

            {paymentMethods.swish_enabled && (
              <label
                className="flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: paymentMethod === "swish" ? colors.primary : `rgba(${hexToRgb(colors.text)}, 0.12)`,
                  backgroundColor: paymentMethod === "swish" ? `rgba(${primaryRgb}, 0.04)` : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="swish"
                  checked={paymentMethod === "swish"}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, payment: false }));
                  }}
                  className="w-4 h-4"
                  style={{ accentColor: colors.primary }}
                />
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {t("booking.swish", lang)}
                </span>
              </label>
            )}

            {paymentMethods.klarna_enabled && (
              <label
                className="flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: paymentMethod === "klarna" ? colors.primary : `rgba(${hexToRgb(colors.text)}, 0.12)`,
                  backgroundColor: paymentMethod === "klarna" ? `rgba(${primaryRgb}, 0.04)` : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="klarna"
                  checked={paymentMethod === "klarna"}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, payment: false }));
                  }}
                  className="w-4 h-4"
                  style={{ accentColor: colors.primary }}
                />
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {t("booking.klarna", lang)}
                </span>
              </label>
            )}
          </div>
          {validationErrors.payment && (
            <p className="mt-2 text-sm text-red-500">{t("booking.required", lang)}</p>
          )}
        </section>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl py-4 text-base font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: colors.primary,
          boxShadow: `0 4px 14px rgba(${primaryRgb}, 0.35)`,
        }}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t("booking.submit", lang)}...
          </span>
        ) : (
          t("booking.submit", lang)
        )}
      </button>
    </form>
  );
}
