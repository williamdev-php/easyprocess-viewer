"use client";

import { useEffect, useState, useCallback } from "react";
import { t } from "@/lib/i18n";

/**
 * Wraps a subpage's content to make it clickable in editor-mode (iframe).
 * Clicking sends SECTION_CLICKED to the parent editor so the right panel opens.
 */
export function EditablePageWrapper({
  section,
  children,
}: {
  section: string;
  children: React.ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(window !== window.parent);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditing) return;
      if ((e.target as HTMLElement).closest("a")) return;
      e.preventDefault();
      e.stopPropagation();
      const targetOrigin = process.env.NEXT_PUBLIC_EDITOR_ORIGIN || window.location.origin;
      window.parent.postMessage({ type: "SECTION_CLICKED", section }, targetOrigin);
    },
    [section, isEditing]
  );

  if (!isEditing) return <>{children}</>;

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer transition-all duration-150 hover:outline hover:outline-2 hover:outline-blue-400/60 hover:outline-offset-[-2px] hover:rounded"
    >
      <div className="pointer-events-none absolute top-2 right-2 z-50 rounded bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity [div:hover>&]:opacity-100 shadow-sm">
        {t("editor.edit")}
      </div>
      {children}
    </div>
  );
}
