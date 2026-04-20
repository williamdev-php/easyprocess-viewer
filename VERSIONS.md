# Viewer Versions

This document tracks all viewer design versions. Each version is a frozen set of
components that renders customer sites. Once a version is in production, it must
not be changed (except critical bug fixes).

## Version History

### v1 — Original (current)

- **Status:** Active (production)
- **Components:** `components/` (root level — these ARE the v1 components)
- **Themes:** modern, bold, elegant, minimal
- **Style variants:** 0 (Original), 1 (Modern Cards), 2 (Clean & Minimal), 3 (Bold & Filled)
- **Sections:** hero, about, features, stats, services, process, gallery, team, testimonials, faq, cta, contact

All sites created before the versioning system was introduced are implicitly v1.
The backend defaults `viewer_version` to `"v1"` when the field is missing.

---

## How to Add a New Version

### 1. Create the component directory

```bash
mkdir viewer/components/v2
```

### 2. Create your new section components

You can start from scratch or copy v1 components as a base:

```bash
# Copy a component to modify
cp viewer/components/hero.tsx viewer/components/v2/hero.tsx
```

Each component must accept the same props interface as v1 (colors, theme, lang,
variantStyle, plus section-specific data). This ensures the same `SiteData` JSON
works across versions.

### 3. Create the version index

Create `viewer/components/v2/index.ts` that exports a `renderSection` function:

```typescript
// viewer/components/v2/index.ts
import type { SiteData } from "@/lib/types";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";

// Import your v2 components
import { Hero } from "./hero";
// ... etc

export interface RenderContext {
  data: SiteData;
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  lang: string;
  siteId: string;
}

export function renderSection(key: string, ctx: RenderContext): React.ReactNode {
  // Your v2 rendering logic
}
```

### 4. Register in the version registry

Edit `viewer/lib/version-registry.ts`:

```typescript
import { renderSectionV2 } from "@/components/v2";

export const VERSION_RENDERERS: Record<string, SectionRenderer> = {
  v1: renderSectionV1,
  v2: renderSectionV2,  // Add this
};

export const LATEST_VERSION = "v2";  // Update this
```

### 5. Update the backend

In `backend/app/sites/site_schema.py`, update `CURRENT_VIEWER_VERSION`:

```python
CURRENT_VIEWER_VERSION = "v2"
```

This makes all newly generated sites use v2. Existing sites keep v1.

### 6. Update this file

Add a new section above documenting what v2 includes and when it was created.

---

## Design Principles

1. **Versions are immutable** — once deployed, don't change them
2. **Data is version-agnostic** — the same `SiteData` JSON must render in any version
3. **New fields are always optional** — v1 components ignore fields they don't know about
4. **Upgrades are opt-in** — customers choose when to switch versions
5. **Bug fixes are OK** — fixing a broken layout in v1 is fine, redesigning it is not
