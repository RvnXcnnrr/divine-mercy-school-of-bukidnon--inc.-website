# Admin Site Management CMS Blueprint

## Admin UI Structure

### Sidebar Group
- `SITE MANAGEMENT` (collapsible)
- `Homepage`
- `About Page`
- `Academics Page`
- `Admissions Page`
- `Events Settings`
- `Gallery Settings`
- `Contact Page`
- `Footer`
- `Global Settings`

### Page Layout Pattern
- Sticky top action bar: `Save Draft`, `Publish`, `Reset Draft`
- Content cards with 12-16px radius, soft shadows, spacing scale 12/16/24
- Drag-and-drop sortable lists for timeline/cards/steps/categories
- Live preview panel (Homepage Hero)
- Toast feedback, confirmation modals, optional version restore

## Component Breakdown

### New/Updated Components
- `src/pages/admin/AdminSiteManagement.jsx`
- `src/components/admin/SortableCardsEditor.jsx`
- `src/components/admin/AdminRichTextEditor.jsx`
- `src/pages/admin/AdminLayout.jsx` (collapsible Site Management group)

### Supporting Services
- `src/services/siteManagementService.js`
- `src/data/siteManagementDefaults.js`

### Public-Side Integrations
- `src/components/Hero.jsx` (hero now driven by CMS hero settings)
- `src/pages/Home.jsx` (trust badges, news visibility/settings, testimonial visibility)
- `src/pages/Events.jsx` + `src/components/EventCard.jsx` (event settings toggles)
- `src/pages/Gallery.jsx` (layout/lightbox/category settings)
- `src/pages/Contact.jsx` (contact/map/messenger from CMS)
- `src/components/Footer.jsx` (description, social/nav links, credits)
- `src/App.jsx` (global announcement + maintenance mode + theme vars)

## Data Model (Current + Suggested)

### Current Production Model (Implemented)
- Uses `site_content.extra_content` JSON with managed keys:
  - `site_management_draft`
  - `site_management_published`
  - `site_management_history`
  - `site_management_meta`
- Legacy mirror fields are auto-maintained for backward compatibility:
  - `vision`, `mission`, `history`, `contact_email`, `contact_phone`
  - `extra_content.programs`, `facilities`, `admissions_steps`, etc.

### Suggested Normalized Schema (Scalable)

```sql
-- Core
site_configs(id, key, value_json, is_published, version, updated_by, updated_at)

-- Modular homepage blocks
homepage_sections(
  id uuid pk,
  section_type text,
  title text,
  content jsonb,
  image_url text,
  sort_order int,
  is_published boolean,
  created_at timestamptz,
  updated_at timestamptz
)

-- Generic content items
page_sections(
  id uuid pk,
  page_key text,         -- about, admissions, academics, etc.
  section_key text,      -- timeline, core_values, requirements, ...
  payload jsonb,
  sort_order int,
  is_visible boolean,
  updated_at timestamptz
)

-- Optional scheduling/versioning
content_releases(
  id uuid pk,
  page_key text,
  draft_payload jsonb,
  published_payload jsonb,
  version int,
  publish_at timestamptz,
  published_by uuid,
  created_at timestamptz
)
```

## Suggested API Routes

### Admin Content API
- `GET /api/admin/site-management` -> load draft/published/meta/history
- `PUT /api/admin/site-management/draft` -> save draft
- `POST /api/admin/site-management/publish` -> publish current draft
- `POST /api/admin/site-management/reset` -> reset draft to published
- `POST /api/admin/site-management/restore/:version` -> restore history snapshot to draft

### Public Content API
- `GET /api/site-settings` -> published site settings only
- `GET /api/site-settings/:page` -> page-specific published settings

### Media API
- `POST /api/admin/media/upload?bucket=gallery|forms|branding`
- `DELETE /api/admin/media/:id`

## Permission Roles

### Roles
- `super_admin`: full control, publish, maintenance mode, global settings
- `content_admin`: full content editing + publish, no auth/system settings
- `editor`: draft save, no publish
- `reviewer`: read-only preview + approve workflow (optional)

### Permission Matrix
- Draft save: `super_admin`, `content_admin`, `editor`
- Publish: `super_admin`, `content_admin`
- Restore version: `super_admin`, `content_admin`
- Global settings + maintenance mode: `super_admin`

## Pagination Logic

### Admin Lists
- Server-driven where possible; fallback client pagination for JSON arrays
- Formula:
  - `totalPages = max(1, ceil(totalItems / pageSize))`
  - `start = (page - 1) * pageSize`
  - `items = source.slice(start, start + pageSize)`
- Recommended `pageSize`: 10, 25, 50
- Keep current page clamped after deletions/reorders

### Public Lists
- News cards: `homepage.featuredNews.postsPerPage`
- Pagination controls: `homepage.featuredNews.paginationSize`

## UX Reasoning

- Draft/publish separation prevents accidental live regressions.
- Collapsible sidebar group keeps navigation clean despite expanded CMS scope.
- Sortable cards standardize reorder behavior across timeline/steps/badges/sections.
- Rich text editor supports non-technical admins for long-form sections.
- Global announcement + maintenance mode are immediate operational controls.
- Version restore offers rollback safety without direct DB edits.
