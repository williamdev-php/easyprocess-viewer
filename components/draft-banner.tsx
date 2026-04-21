const DRAFT_LIFETIME_DAYS = 45;
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://qvicko.com";

const translations = {
  sv: {
    draft: "Utkast",
    message: "Den här sidan är ett utkast och raderas automatiskt",
    daysLeft: (d: number) => `om ${d} dagar`,
    activate: "Aktivera sidan",
  },
  en: {
    draft: "Draft",
    message: "This page is a draft and will be automatically deleted",
    daysLeft: (d: number) => `in ${d} days`,
    activate: "Activate page",
  },
};

interface DraftBannerProps {
  createdAt?: string;
  lang?: string;
}

export function DraftBanner({ createdAt, lang }: DraftBannerProps) {
  const t = translations[lang === "en" ? "en" : "sv"];

  let daysRemaining = DRAFT_LIFETIME_DAYS;
  if (createdAt) {
    const created = new Date(createdAt);
    const expires = new Date(created.getTime() + DRAFT_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
    daysRemaining = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="flex items-center justify-center gap-3 px-4 py-3 text-sm sm:gap-4 sm:py-3.5"
        style={{
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#fff",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            {t.draft}
          </span>
          <span className="hidden sm:inline">
            {t.message} {t.daysLeft(daysRemaining)}.
          </span>
          <span className="sm:hidden">
            {t.daysLeft(daysRemaining)}
          </span>
        </div>

        <a
          href={FRONTEND_URL}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: "#fff",
            color: "#d97706",
          }}
        >
          {t.activate}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
