"use client";

import { useState, useCallback } from "react";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuizOption {
  label: string;
  /** If set, jump to this step index instead of the next one. */
  next?: number;
}

export interface QuizStep {
  question: string;
  options: QuizOption[];
  /** Optional image displayed alongside the question. */
  image?: string | null;
}

export interface QuizResult {
  title: string;
  description: string;
  /** Optional CTA shown after the result. */
  cta?: { label: string; href: string } | null;
}

export interface QuizSectionProps {
  title?: string;
  subtitle?: string;
  steps: QuizStep[];
  results: QuizResult[];
  /** Map answers to result index. Each key is a comma-joined answer string. Fallback = last result. */
  result_logic?: "score" | "first_match";
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuizSection({
  title,
  subtitle,
  steps,
  results,
  result_logic = "score",
  colors,
  theme,
  variantStyle,
}: QuizSectionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  if (!steps?.length || !results?.length) return null;

  const totalSteps = steps.length;
  const progress = finished ? 100 : Math.round((currentStep / totalSteps) * 100);

  const pickAnswer = useCallback(
    (optionIndex: number) => {
      const step = steps[currentStep];
      const option = step.options[optionIndex];
      const newAnswers = [...answers, optionIndex];
      setAnswers(newAnswers);

      const nextStep = option?.next ?? currentStep + 1;
      if (nextStep >= totalSteps) {
        setFinished(true);
      } else {
        setCurrentStep(nextStep);
      }
    },
    [currentStep, answers, steps, totalSteps],
  );

  const restart = useCallback(() => {
    setCurrentStep(0);
    setAnswers([]);
    setFinished(false);
  }, []);

  // Determine which result to show based on most-picked option index
  const resolveResult = (): QuizResult => {
    if (results.length === 1) return results[0];

    // Score-based: map each answer to the result at the same index (clamped)
    const counts: Record<number, number> = {};
    for (const a of answers) {
      const idx = Math.min(a, results.length - 1);
      counts[idx] = (counts[idx] || 0) + 1;
    }
    let best = 0;
    let bestCount = 0;
    for (const [idx, count] of Object.entries(counts)) {
      if (count > bestCount) {
        bestCount = count;
        best = Number(idx);
      }
    }
    return results[best] ?? results[results.length - 1];
  };

  const isLeft = variantStyle.headerAlign === "left";
  const cardBg = colors.background;
  const borderColor = mixColor(colors.text, colors.background, 0.9);
  const mutedText = mixColor(colors.text, colors.background, 0.35);

  return (
    <SectionWrap theme={theme} bg={colors.background}>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        {title && !finished && currentStep === 0 && (
          <Reveal>
            <div className={`mb-12 ${isLeft ? "text-left" : "text-center"}`}>
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                Quiz
              </p>
              <h2
                className={`text-3xl ${theme.heading.weight} ${theme.heading.tracking} sm:text-4xl md:text-5xl`}
                style={{ color: colors.text }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className={`mt-5 max-w-lg text-lg leading-relaxed ${isLeft ? "" : "mx-auto"}`}
                  style={{ color: mutedText }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </Reveal>
        )}

        {/* Progress bar */}
        {!finished && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: mutedText }}>
                {currentStep + 1} / {totalSteps}
              </span>
              <span className="text-sm" style={{ color: mutedText }}>
                {progress}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ background: mixColor(colors.primary, colors.background, 0.85) }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: colors.primary,
                }}
              />
            </div>
          </div>
        )}

        {/* Question card */}
        {!finished && (
          <Reveal key={currentStep}>
            <div
              className={`${variantStyle.cardRadius} border p-8 sm:p-10`}
              style={{ background: cardBg, borderColor }}
            >
              {steps[currentStep].image && (
                <img
                  src={steps[currentStep].image!}
                  alt=""
                  className={`mb-6 h-48 w-full object-cover ${variantStyle.cardRadius}`}
                />
              )}
              <h3
                className={`text-xl ${theme.heading.weight} sm:text-2xl mb-6`}
                style={{ color: colors.text }}
              >
                {steps[currentStep].question}
              </h3>
              <div className="flex flex-col gap-3">
                {steps[currentStep].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => pickAnswer(i)}
                    className={`w-full text-left ${variantStyle.cardRadius} border px-5 py-4 text-base font-medium transition-all duration-200 hover:scale-[1.01]`}
                    style={{
                      borderColor,
                      color: colors.text,
                      background: colors.background,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.background = mixColor(colors.primary, colors.background, 0.95);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = borderColor;
                      e.currentTarget.style.background = colors.background;
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Result */}
        {finished && (() => {
          const result = resolveResult();
          return (
            <Reveal>
              <div
                className={`${variantStyle.cardRadius} border p-8 sm:p-10 text-center`}
                style={{ background: cardBg, borderColor }}
              >
                <div
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: mixColor(colors.primary, colors.background, 0.88) }}
                >
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={colors.primary}
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3
                  className={`text-2xl ${theme.heading.weight} sm:text-3xl mb-4`}
                  style={{ color: colors.text }}
                >
                  {result.title}
                </h3>
                <p
                  className="text-base leading-relaxed mb-8"
                  style={{ color: mutedText }}
                >
                  {result.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {result.cta && (
                    <a
                      href={result.cta.href}
                      className={`inline-flex items-center justify-center ${variantStyle.cardRadius} px-8 py-3 text-base font-semibold transition-all duration-200 hover:brightness-110`}
                      style={{ background: colors.primary, color: colors.background }}
                    >
                      {result.cta.label}
                    </a>
                  )}
                  <button
                    onClick={restart}
                    className={`inline-flex items-center justify-center ${variantStyle.cardRadius} border px-8 py-3 text-base font-medium transition-all duration-200`}
                    style={{ borderColor, color: colors.text }}
                  >
                    Gör om quizen
                  </button>
                </div>
              </div>
            </Reveal>
          );
        })()}
      </div>
    </SectionWrap>
  );
}
