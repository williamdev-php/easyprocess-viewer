"use client";

import DOMPurify from "isomorphic-dompurify";
import { Animate } from "@/components/animate";
import type { AnimationType } from "@/components/animate";
import { SectionWrap } from "@/components/section-wrap";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";

interface Props {
  title?: string;
  content?: string;
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  animation?: AnimationType;
}

function sanitizeContent(html: string): string {
  if (!html) return "";
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "hr",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "del",
      "ul", "ol", "li",
      "a", "img",
      "blockquote", "pre", "code",
      "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "title",
      "src", "alt", "width", "height",
      "class", "style",
      "colspan", "rowspan",
    ],
  });
}

export function PageContentSection({
  title,
  content,
  colors,
  theme,
  variantStyle,
  animation = "fade-up",
}: Props) {
  if (!content && !title) return null;

  return (
    <SectionWrap colors={colors} theme={theme}>
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {title && (
          <Animate type={animation}>
            <h2
              className={`mb-8 text-3xl sm:text-4xl ${theme.heading.weight} ${theme.heading.tracking}`}
              style={{ color: colors.text }}
            >
              {title}
            </h2>
          </Animate>
        )}
        {content && (
          <Animate type={animation} delay={0.1}>
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-table:border-collapse prose-td:border prose-td:px-3 prose-td:py-2 prose-th:border prose-th:px-3 prose-th:py-2 prose-th:bg-gray-50"
              style={{ color: colors.text }}
              dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }}
            />
          </Animate>
        )}
      </div>
    </SectionWrap>
  );
}
