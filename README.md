# Viewer — Public Site Renderer

The viewer is a Next.js application that renders all customer websites. It runs as a **single deployment** serving every customer via subdomain routing (`slug.qvickosite.com`) or custom domains.

## The Core Problem

Because every customer site is rendered by the same viewer code, **any change to a component changes every customer's website instantly** — without their consent.

## The Solution: Versioned Components

Each site is locked to a `viewer_version` (e.g. `"v1"`). The viewer uses a **version registry** to pick which set of components to render for that site. This means:

- Existing customers stay on `v1` forever (unless they choose to upgrade)
- New designs are developed as `v2`, `v3`, etc.
- One deployment, multiple design versions running side by side
- No risk of breaking live customer sites

## How It Works

```
Customer request → proxy.ts resolves subdomain → fetch site data (includes viewer_version)
                                                        ↓
                                            version-registry.ts picks component set
                                                        ↓
                                            Renders with v1/ or v2/ components
```

### Key files

| File | Purpose |
|------|---------|
| `lib/version-registry.ts` | Maps `viewer_version` → component set (renderSection function) |
| `lib/types.ts` | `SiteData.viewer_version` field |
| `components/v1/` | Frozen v1 components (re-exports from current components) |
| `components/v2/` | (future) New design components |
| `components/live-preview-wrapper.tsx` | Uses version registry for live editing |
| `components/preview-shell.tsx` | Uses version registry for editor preview |

### Data flow

1. Backend stores `viewer_version` on each `GeneratedSite` (default: `"v1"`)
2. API returns `viewer_version` inside `site_data`
3. Viewer reads `site_data.viewer_version` and looks up the correct component set
4. Components for that version render the site

## Rules

### Never modify v1 components after production launch

Once v1 is live with paying customers, treat `components/v1/` as **frozen**. Only fix critical bugs — never change design, layout, or behavior.

### New features go in the next version

Want a new hero design? A different grid layout? A new section type? Create it in `v2/` (or whatever the next version is). See `VERSIONS.md` for how to add a new version.

### Keep SiteSchema backward compatible

The backend `SiteSchema` (Pydantic) is shared across all versions. When adding fields:

- **Always** make new fields optional with sensible defaults
- **Never** remove or rename existing fields
- **Never** change the type of an existing field

This ensures v1 sites continue to work even as the schema evolves. See `backend/app/sites/site_schema.py` for the full checklist.

### Version upgrades are explicit

A customer's site should only change version when:
1. The customer explicitly opts in (e.g. "Upgrade to v2" button in dashboard)
2. A new site is created (gets the latest version automatically)

Never auto-upgrade existing sites.

## Development Workflow

```bash
# Working on the current viewer (v1 bug fix):
# Edit the component directly in components/ — it IS v1

# Creating v2:
# 1. Create components/v2/ directory
# 2. Copy/create new component files there
# 3. Register v2 in lib/version-registry.ts
# 4. Update VERSIONS.md
# 5. Set CURRENT_VIEWER_VERSION = "v2" in backend
```

## Tech Stack

- **Next.js 16** with App Router and React Server Components
- **Tailwind CSS v4** for styling
- **ISR** (Incremental Static Regeneration) for caching
- Subdomain routing via `proxy.ts` middleware
