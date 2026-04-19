import type { ReactNode } from "react";
import type { Theme } from "@/lib/themes";

export function SectionWrap({
  children,
  theme,
  bg,
  className = "",
  id,
}: {
  children: ReactNode;
  theme: Theme;
  bg?: string;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative px-5 sm:px-8 ${theme.sectionPadding} ${className}`}
      style={{ background: bg }}
    >
      {theme.sectionDivider && (
        <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-6xl bg-black/[0.06]" />
      )}
      {children}
    </section>
  );
}
