# Admin Dashboard Replication Blueprint

## Source Of Truth

This blueprint is based on:

- `docs/ADMIN_SITE_MANAGEMENT_CMS.md`
- the implemented admin routes and layout in `src/App.jsx` and `src/pages/admin/AdminLayout.jsx`
- the implemented modules in `src/pages/admin/*`
- the current data and storage services in `src/services/*`, `src/lib/supabaseStorage.js`, and `supabase-setup.sql`

It reflects the actual finished dashboard behavior in the current project, then reorganizes that behavior into a cleaner, reusable architecture for a new website.

## 1. Admin Dashboard Replication Plan

### Existing dashboard summary

The current dashboard is a React admin SPA backed by Supabase auth, Postgres, and Supabase Storage. The admin experience centers on:

- a nested admin shell with a collapsible `Site Management` group
- a dashboard overview page with publishing/activity stats
- a posts manager with bulk actions and a dedicated post editor
- a testimonials moderation queue
- a large site management module with draft/publish/reset flow
- embedded media uploads inside content modules
- a faculty/team directory managed inside the About page editor
- public-site operational settings such as announcements and maintenance mode stored in site-management data

### Core modules that must be recreated

Required parity modules:

- Admin shell and dashboard overview
- Website content/settings editor with draft, publish, reset, and revision restore
- Announcements/posts manager
- Post editor with media upload and preview
- Testimonials moderation
- Custom entity manager for team/faculty or equivalent directory entity
- Global site settings editor
- File upload and storage handling

Required platform modules to add as first-class features in the new build:

- Media library
- Admin users/roles manager
- Audit logs
- Subscribers/leads manager

### Reusable / generic parts

- Admin shell layout, sidebar, breadcrumbs, page header, action bar
- Draft/publish workflow
- Revision history and restore
- Sortable list/card editor
- Rich text editor wrapper
- Generic CRUD table patterns
- Bulk actions, filters, pagination, confirm dialogs
- Media upload/picker components
- Role guard and permission gate system
- Audit logging and activity feed

### Project-specific parts that must be adapted

- Page/module registry: `homepage`, `about`, `academics`, `admissions`, `events`, `gallery`, `contact`, `footer`, `global`
- Hero copy, trust badges, school-specific homepage blocks
- About-page timeline and principal message
- Faculty/team entity shape
- Admissions requirements/forms and transport program blocks
- Gallery category taxonomy
- Footer links, SEO defaults, branding, announcement text, maintenance message

For the new website, these should be represented as configurable content schemas, not hard-coded school data.

## 2. Recommended Architecture For The New Website

### Frontend structure

Use a modular React admin app with nested routing and domain-based features:

- React 19
- React Router for deep-linkable admin routes
- TanStack Query for server state
- React Hook Form + Zod for validation
- a shared admin UI kit for tables, forms, dialogs, uploaders, and section editors
- a page registry that drives site-management routes from configuration

Recommended frontend layers:

- `app`: router, providers, auth bootstrap
- `features`: module-specific pages, hooks, services, and validators
- `components`: reusable admin UI building blocks
- `lib`: API client, storage helpers, audit helper, utility functions

### Backend / API structure

Do not keep privileged writes entirely in the browser.

Recommended pattern:

- frontend authenticates the user
- frontend calls backend admin endpoints or edge functions
- backend validates permissions, writes data, records audit logs, and manages storage cleanup
- backend uses server credentials for protected operations

Recommended backend domains:

- `auth`
- `admin-content`
- `posts`
- `media`
- `users`
- `roles`
- `audit`
- `testimonials`
- `subscribers`
- `custom-entities`

If the new site stays on Supabase, implement this layer with:

- server routes in the main web app, or
- Supabase Edge Functions for privileged mutations

### Database structure

Use a hybrid model:

- normalized tables for users, roles, posts, media, audit logs, and custom entities
- document-style JSON payloads for page/module content
- separate revision tables for draft/publish history

This preserves the flexibility of the current CMS while removing the original monolithic `site_content.extra_content` bottleneck.

### Auth / roles / permissions structure

Use explicit admin roles:

- `admin`
- `editor`
- `viewer`

Do not default missing profiles to elevated access. A user without a valid admin profile should have no admin access.

Enforce permissions in three places:

- route guard
- UI capability checks
- backend / database policy enforcement

### Media / storage handling

Replace scattered uploads with a reusable media system:

- one storage service for upload, replace, delete, and list
- `media_assets` table for file metadata
- `media_usages` table to track which records reference a file
- deletion queue or background cleanup for orphaned files
- bucket strategy by concern: `posts`, `site`, `documents`, `avatars`, `branding`

## 3. Route And Page Structure

Recommended admin route map:

```text
/admin/login
/admin
/admin/dashboard

/admin/content
/admin/content/site/homepage
/admin/content/site/about
/admin/content/site/academics
/admin/content/site/admissions
/admin/content/site/events
/admin/content/site/gallery
/admin/content/site/contact
/admin/content/site/footer
/admin/content/site/global
/admin/content/site/history/:moduleKey

/admin/posts
/admin/posts/new
/admin/posts/:postId
/admin/posts/categories

/admin/testimonials
/admin/subscribers

/admin/media
/admin/media/:assetId

/admin/users
/admin/users/new
/admin/users/:userId
/admin/roles

/admin/entities
/admin/entities/team
/admin/entities/team/:itemId

/admin/settings/general
/admin/settings/seo
/admin/settings/integrations
/admin/settings/system
/admin/settings/audit-logs
```

### Route behavior notes

- `/admin` should redirect to `/admin/dashboard`
- every major content section must have its own route for deep-linking
- history/restore should be reachable per module, not hidden
- subscribers should be a real route, not a dormant page
- global settings should be a real module, not only stored in the content payload
- team/faculty should be a dedicated entity module even if it also appears contextually on the About page

## 4. Module-By-Module Build Specification

### Dashboard shell and overview

Purpose:

- provide navigation, summary metrics, recent activity, and quick actions

Key UI components:

- collapsible sidebar
- sticky top bar
- KPI stat cards
- recent activity list
- quick actions panel
- permission-aware nav items

CRUD operations needed:

- read dashboard metrics
- read recent activity

Database tables/models:

- `posts`
- `testimonials`
- `subscribers`
- `admin_audit_logs`
- `content_modules`

API/service methods:

- `GET /admin/dashboard/summary`
- `GET /admin/dashboard/activity`

Permissions per role:

- `admin`: full access
- `editor`: read dashboard
- `viewer`: read dashboard

Validations:

- none beyond authenticated admin access

Important UX behavior:

- show only actions the current role can execute
- keep sidebar state and open groups persisted locally

### Website content/settings editor

Purpose:

- manage page-based website content and global site settings with draft/publish safety

Key UI components:

- section tabs or route-based subnavigation
- sticky action bar with `Save Draft`, `Publish`, `Reset Draft`
- revision history panel
- sortable section/block editors
- rich text editor
- media picker/uploader
- live preview for hero and other high-impact blocks

CRUD operations needed:

- create/update draft payload
- publish module
- reset draft to published
- restore revision to draft
- manage nested blocks inside each module

Database tables/models:

- `content_modules`
- `content_revisions`
- `media_assets`
- `media_usages`

API/service methods:

- `GET /admin/content/modules`
- `GET /admin/content/modules/:moduleKey`
- `PUT /admin/content/modules/:moduleKey/draft`
- `POST /admin/content/modules/:moduleKey/publish`
- `POST /admin/content/modules/:moduleKey/reset`
- `POST /admin/content/modules/:moduleKey/restore/:revisionId`

Permissions per role:

- `admin`: read, edit, publish, restore, configure global settings
- `editor`: read, edit draft, upload media
- `viewer`: read-only preview

Validations:

- required text fields per section schema
- URL validation for links
- slug-safe values for category-like settings
- max lengths for copy and headings
- image/file type and size limits

Important UX behavior:

- unsaved changes indicator
- route-level deep linking
- restore should never auto-publish
- publish note should be supported
- section configuration should come from schema metadata, not a monolithic component

### Announcements/posts manager

Purpose:

- manage news, announcements, event posts, and media posts

Key UI components:

- searchable/filterable table
- status filter
- content-type filter
- bulk select and bulk actions
- featured toggle
- row actions for edit/delete

CRUD operations needed:

- create post
- read list/detail
- update post
- delete post
- bulk publish/draft
- toggle featured

Database tables/models:

- `posts`
- `post_categories`
- `media_assets`
- `media_usages`

API/service methods:

- `GET /admin/posts`
- `GET /admin/posts/:id`
- `POST /admin/posts`
- `PATCH /admin/posts/:id`
- `DELETE /admin/posts/:id`
- `POST /admin/posts/bulk-status`
- `POST /admin/posts/:id/feature`
- `GET /admin/post-categories`

Permissions per role:

- `admin`: full CRUD, bulk actions, hard delete
- `editor`: create/edit/delete draft content, upload media, cannot publish if publish is reserved
- `viewer`: read-only

Validations:

- title required, min 3 characters
- content required, min 10 characters
- status enum
- image/video URLs valid
- slug unique
- category optional but normalized

Important UX behavior:

- idempotent create requests
- autosave for unsaved new posts
- preview before save
- media should be selectable from library, not upload-only

### Post editor

Purpose:

- provide detailed create/edit screen for a single post

Key UI components:

- metadata form
- rich text or long-form content field
- gallery uploader/picker
- featured image preview
- publish status controls
- preview modal

CRUD operations needed:

- same as posts manager, scoped to one record

Database tables/models:

- `posts`
- `media_assets`
- `media_usages`

API/service methods:

- `GET /admin/posts/:id`
- `POST /admin/posts`
- `PATCH /admin/posts/:id`
- `POST /admin/media/upload`

Permissions per role:

- `admin`: full
- `editor`: create/edit draft
- `viewer`: read-only preview if allowed

Validations:

- same as posts manager

Important UX behavior:

- local draft recovery for unsaved new items
- upload progress
- preserve gallery order
- do not orphan replaced files

### Testimonials moderation

Purpose:

- review public submissions and approve, reject, or delete them

Key UI components:

- status tabs
- search and date filters
- moderation cards or table
- one-click approve/reject/delete actions

CRUD operations needed:

- read submissions
- update status
- delete submission

Database tables/models:

- `testimonials`
- `admin_audit_logs`

API/service methods:

- `GET /admin/testimonials`
- `PATCH /admin/testimonials/:id/status`
- `DELETE /admin/testimonials/:id`

Permissions per role:

- `admin`: full moderation
- `editor`: approve/reject if allowed by policy
- `viewer`: read-only

Validations:

- status enum: `pending`, `approved`, `rejected`

Important UX behavior:

- default to `pending` filter
- no destructive action without confirmation
- audit moderator decisions

### Media library

Purpose:

- centralize uploads, selection, reuse, replacement, and safe deletion

Key UI components:

- asset grid/list
- filter by bucket/type/module
- upload drawer
- replace file action
- copy URL action
- usage inspector
- delete/archive action

CRUD operations needed:

- upload asset
- read asset library
- update asset metadata
- soft delete asset
- mark usage links

Database tables/models:

- `media_assets`
- `media_usages`

API/service methods:

- `GET /admin/media`
- `POST /admin/media`
- `PATCH /admin/media/:id`
- `DELETE /admin/media/:id`
- `GET /admin/media/:id/usages`

Permissions per role:

- `admin`: full
- `editor`: upload, browse, attach, replace
- `viewer`: browse if needed, no mutation

Validations:

- allowed MIME types
- max size by bucket
- duplicate filename handling
- block deletion when asset is still referenced unless force flow is explicitly allowed

Important UX behavior:

- media upload should return a database asset record, not only a storage URL
- display usage count before delete
- queue cleanup for actual storage deletion

### Admin users / roles manager

Purpose:

- manage admin access, invitations, role assignment, activation, and deactivation

Key UI components:

- users table
- invite form
- user detail page
- role editor
- activation/deactivation controls
- last login and status display

CRUD operations needed:

- invite user
- read users
- update profile and role assignments
- deactivate/reactivate user
- revoke active sessions

Database tables/models:

- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`

API/service methods:

- `GET /admin/users`
- `POST /admin/users/invite`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id`
- `POST /admin/users/:id/deactivate`
- `POST /admin/users/:id/reactivate`
- `POST /admin/users/:id/revoke-sessions`
- `GET /admin/roles`
- `PATCH /admin/roles/:id`

Permissions per role:

- `admin`: full
- `editor`: none
- `viewer`: none

Validations:

- unique email
- role must exist
- cannot remove the last active admin

Important UX behavior:

- user deletion should be soft-delete or deactivation, not blind hard delete
- keep audit trail of who changed access
- prevent self-lockout and last-admin lockout

### Subscribers / leads manager

Purpose:

- manage newsletter or contact-list records and export them safely

Key UI components:

- filterable table
- date filters
- export button

CRUD operations needed:

- read subscribers
- export subscribers
- optionally delete or suppress records

Database tables/models:

- `subscribers`

API/service methods:

- `GET /admin/subscribers`
- `GET /admin/subscribers/export`
- `DELETE /admin/subscribers/:id` if deletion is supported

Permissions per role:

- `admin`: full
- `editor`: read/export if allowed
- `viewer`: read-only or no access based on privacy policy

Validations:

- unique email
- export rate limiting if exposed as a downloadable endpoint

Important UX behavior:

- this should be a live routed module, not an orphaned page
- hide or restrict if privacy policy requires

### Custom entity module: team / faculty directory

Purpose:

- manage reusable directory-style content that appears in public pages

Key UI components:

- entity list
- sort order controls
- image upload/picker
- create/edit form

CRUD operations needed:

- create, read, update, delete directory entries

Database tables/models:

- preferred: `team_members`
- reusable alternative: `custom_entity_definitions`, `custom_entity_records`

API/service methods:

- `GET /admin/entities/team`
- `POST /admin/entities/team`
- `PATCH /admin/entities/team/:id`
- `DELETE /admin/entities/team/:id`

Permissions per role:

- `admin`: full
- `editor`: full content CRUD
- `viewer`: read-only

Validations:

- name required
- role/title required
- sort order optional integer

Important UX behavior:

- keep dedicated entity routes
- optionally embed a linked picker inside the About page module instead of storing records inside page JSON

### Audit logs

Purpose:

- record all privileged actions and support operational traceability

Key UI components:

- audit table
- filters by user, module, action, date
- detail drawer with before/after snapshot summary

CRUD operations needed:

- create logs automatically
- read logs

Database tables/models:

- `admin_audit_logs`

API/service methods:

- `GET /admin/audit-logs`

Permissions per role:

- `admin`: read
- `editor`: none
- `viewer`: none

Validations:

- immutable rows

Important UX behavior:

- log publish, reset, restore, delete, invite, role change, media delete, login failure, and maintenance-mode changes

## 5. Database Schema Plan

### Required tables

#### `profiles`

- `id uuid pk` references auth user
- `email text`
- `full_name text`
- `avatar_url text`
- `status text` enum `active|inactive|invited`
- `last_login_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `roles`

- `id uuid pk`
- `key text unique`
- `label text`
- `is_system boolean`
- `created_at timestamptz`

Seed roles:

- `admin`
- `editor`
- `viewer`

#### `permissions`

- `id uuid pk`
- `key text unique`
- `module text`
- `description text`

#### `user_roles`

- `user_id uuid`
- `role_id uuid`
- composite primary key

#### `role_permissions`

- `role_id uuid`
- `permission_id uuid`
- composite primary key

#### `content_modules`

- `id uuid pk`
- `module_key text unique`
- `module_type text` such as `site_page`, `site_setting`, `custom_page`
- `title text`
- `schema_key text`
- `draft_payload jsonb`
- `published_payload jsonb`
- `status text` enum `draft|published|archived`
- `version integer`
- `last_saved_at timestamptz`
- `last_published_at timestamptz`
- `updated_by uuid`
- `published_by uuid`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `content_revisions`

- `id uuid pk`
- `module_id uuid` references `content_modules`
- `version integer`
- `payload jsonb`
- `note text`
- `created_by uuid`
- `created_at timestamptz`

#### `post_categories`

- `id uuid pk`
- `name text unique`
- `slug text unique`
- `description text`
- `created_at timestamptz`

#### `posts`

- `id uuid pk`
- `title text`
- `slug text unique`
- `excerpt text`
- `content text` or `content_json jsonb`
- `featured_image_asset_id uuid nullable`
- `video_url text nullable`
- `category_id uuid nullable`
- `status text` enum `draft|published|archived`
- `is_featured boolean`
- `published_at timestamptz nullable`
- `created_by uuid`
- `updated_by uuid`
- `idempotency_key uuid nullable unique`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `media_assets`

- `id uuid pk`
- `storage_provider text`
- `bucket text`
- `path text`
- `public_url text`
- `mime_type text`
- `size_bytes bigint`
- `width integer nullable`
- `height integer nullable`
- `alt_text text`
- `title text`
- `status text` enum `active|orphaned|deleted`
- `uploaded_by uuid`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `media_usages`

- `id uuid pk`
- `asset_id uuid`
- `entity_type text`
- `entity_id uuid`
- `field_key text`
- `created_at timestamptz`

#### `admin_audit_logs`

- `id uuid pk`
- `actor_user_id uuid`
- `action text`
- `module text`
- `entity_type text`
- `entity_id text`
- `summary text`
- `before_data jsonb nullable`
- `after_data jsonb nullable`
- `ip_address inet nullable`
- `user_agent text nullable`
- `created_at timestamptz`

### Optional tables

#### `testimonials`

- `id uuid pk`
- `name text`
- `role text`
- `quote text`
- `avatar_asset_id uuid nullable`
- `status text` enum `pending|approved|rejected`
- `created_at timestamptz`
- `updated_at timestamptz`
- `moderated_by uuid nullable`
- `moderated_at timestamptz nullable`

#### `subscribers`

- `id uuid pk`
- `email text unique`
- `status text` enum `active|unsubscribed|suppressed`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `team_members`

- `id uuid pk`
- `name text`
- `role text`
- `bio text nullable`
- `photo_asset_id uuid nullable`
- `sort_order integer nullable`
- `status text` enum `active|archived`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `scheduled_publishes`

- `id uuid pk`
- `module_id uuid`
- `payload jsonb`
- `publish_at timestamptz`
- `created_by uuid`
- `status text` enum `scheduled|published|cancelled`

### Relationships

- `user_roles.user_id -> profiles.id`
- `user_roles.role_id -> roles.id`
- `role_permissions.role_id -> roles.id`
- `role_permissions.permission_id -> permissions.id`
- `content_revisions.module_id -> content_modules.id`
- `posts.category_id -> post_categories.id`
- `posts.featured_image_asset_id -> media_assets.id`
- `media_usages.asset_id -> media_assets.id`
- `team_members.photo_asset_id -> media_assets.id`
- `testimonials.avatar_asset_id -> media_assets.id`

### Improvements over the original schema

- split monolithic page JSON into module-level records
- make revisions first-class instead of hiding them in a JSON field
- track media in the database so cleanup is possible
- replace `auth.role() = 'authenticated'` write access with actual role-based enforcement
- add audit logs
- add lifecycle fields for users, subscribers, and media

## 6. Auth, Roles, And Permissions Plan

### Role behavior

#### `admin`

- full access to all admin routes
- publish/reset/restore site content
- manage posts and categories
- moderate testimonials
- manage media
- manage users, roles, and system settings
- access audit logs
- enable maintenance mode and global announcement

#### `editor`

- access dashboard
- edit content drafts
- create and edit posts
- upload and attach media
- manage custom entities like team/faculty
- moderate testimonials if explicitly enabled
- cannot manage users/roles
- cannot change system-level settings
- cannot publish if publish remains an admin-only action

#### `viewer`

- read-only dashboard and module views
- no create/update/delete/publish actions

### Permission model

Use permission keys such as:

- `dashboard.read`
- `content.read`
- `content.edit`
- `content.publish`
- `content.restore`
- `posts.read`
- `posts.edit`
- `posts.publish`
- `media.read`
- `media.write`
- `users.manage`
- `settings.manage`
- `audit.read`

### Route guards

- block unauthenticated users at `/admin/*`
- resolve the current user profile and permissions before rendering protected routes
- deny access when the role is inactive or missing
- guard per route, not just at the top-level admin shell

### UI visibility rules

- render nav items only when the user has route permission
- render action buttons only when the user has action permission
- show read-only state instead of hiding full pages when `viewer` access is allowed

### Backend / database enforcement

- every mutation endpoint checks permission keys before writing
- DB RLS or server layer ensures editors cannot write admin-only resources
- never trust client-side role checks for publish, role changes, or destructive deletes

### Access inconsistencies to fix from the original

- no default fallback to `editor` when `profiles` lookup fails
- no blanket `authenticated` write policy for all tables
- no shared route allowing everyone with basic auth into modules they should not touch

## 7. Reusable Component And Code Structure Plan

### Reusable frontend components

- `AdminLayout`
- `AdminSidebar`
- `AdminTopbar`
- `AdminPageHeader`
- `AdminStatCard`
- `StatusBadge`
- `DataTable`
- `FilterToolbar`
- `AdminPagination`
- `ConfirmDialog`
- `ToastProvider`
- `PermissionGate`
- `UnsavedChangesPrompt`
- `RevisionHistoryDrawer`
- `PublishActionBar`
- `SortableItemsEditor`
- `RichTextEditor`
- `MediaPicker`
- `MediaUploadButton`
- `EntityFormDrawer`

### Reusable backend/services

- `AuthService`
- `PermissionService`
- `ContentModuleService`
- `RevisionService`
- `PostService`
- `CategoryService`
- `MediaService`
- `StorageCleanupService`
- `UserAdminService`
- `AuditLogService`
- `EntityService`

### Recommended folder structure

```text
src/
  app/
    router/
    providers/
    guards/
  pages/
    admin/
      dashboard/
      content/
      posts/
      media/
      users/
      settings/
      entities/
  components/
    admin/
      layout/
      tables/
      forms/
      editors/
      feedback/
    ui/
  services/
    api/
    auth/
    content/
    posts/
    media/
    users/
    audit/
    entities/
  hooks/
    auth/
    content/
    posts/
    media/
    table/
  contexts/
    auth/
    permissions/
    toast/
  types/
    auth/
    content/
    posts/
    media/
    users/
    entities/
```

### Reuse strategy

- implement a `module registry` for site pages so new websites swap schemas instead of cloning pages
- implement a generic `EntityModule` pattern so `team`, `partners`, `board members`, `program cards`, or similar modules reuse the same primitives
- keep API clients grouped by domain, not by screen

## 8. Refactoring And Improvements Over The Original

### Monolithic page structure

Original issue:

- `AdminSiteManagement.jsx` is a single large multi-purpose page

Improvement:

- split site management into route-level editors backed by a shared schema registry and shared action bar

### Inconsistent role handling

Original issue:

- frontend falls back to `editor`
- backend/database effectively trust any authenticated user for writes

Improvement:

- explicit roles, permission map, backend enforcement, and no elevated fallback

### Incomplete user deletion lifecycle

Original issue:

- no actual admin user lifecycle UI

Improvement:

- invitation, deactivate/reactivate, revoke sessions, ownership protection, last-admin protection, audit logging

### Missing cleanup for uploaded files

Original issue:

- uploads are stored by URL with only partial cleanup on delete

Improvement:

- track assets in `media_assets`, store usage links, and run orphan cleanup

### Missing audit logs

Original issue:

- no durable record of admin actions

Improvement:

- log all privileged actions with actor, module, entity, timestamp, and before/after context

### Missing deep-linking / module routes

Original issue:

- some functionality is hidden inside one page or not routable at all

Improvement:

- every module and submodule gets its own route, URL, and permission boundary

### Dormant features not fully integrated

Original issue:

- subscribers page exists but is not routed
- global settings exist in defaults but are not exposed as a first-class admin route
- revision history exists but is hidden

Improvement:

- promote dormant capabilities into routed modules with full UI and permission checks

## 9. Build Order / Development Roadmap

### Phase 1. Setup and architecture

- choose the hosting/runtime model
- create the admin route skeleton
- establish shared UI tokens and layout primitives
- add database migrations for auth, roles, content modules, revisions, media, and audit logs

### Phase 2. Auth and permissions

- implement login/session bootstrap
- add `profiles`, `roles`, `permissions`, `user_roles`, `role_permissions`
- build route guards and permission gates
- enforce permission checks in backend/admin APIs

### Phase 3. Admin shell / layout

- build sidebar, top bar, breadcrumbs, page header, and dashboard shell
- wire dashboard summary endpoints

### Phase 4. Content module foundation

- build `content_modules` and `content_revisions`
- implement draft/save/publish/reset/restore services
- build shared `PublishActionBar`, `RevisionHistoryDrawer`, `SortableItemsEditor`, and `RichTextEditor`
- implement route registry for site modules

### Phase 5. Content pages

- homepage editor
- about editor
- academics editor
- admissions editor
- events settings editor
- gallery settings editor
- contact editor
- footer editor
- global settings editor

### Phase 6. Announcements / posts module

- categories API and UI
- post list
- post editor
- autosave and idempotent create flow
- featured-post workflow

### Phase 7. Media module

- storage upload service
- media asset records
- usage tracking
- media browser/picker
- orphan cleanup job

### Phase 8. Users / roles module

- invite flow
- role assignment
- deactivate/reactivate flow
- session revoke
- protect last admin

### Phase 9. Custom entities and operational modules

- team/faculty entity module
- testimonials moderation
- subscribers manager
- audit logs viewer

### Phase 10. Polish and security improvements

- optimistic UI where safe
- unsaved-change prompts
- accessibility and keyboard coverage
- error boundaries
- rate limits and abuse protection
- RLS review and penetration-style permission testing

## 10. Final Replication Blueprint

Build the new dashboard as a modular admin system, not as a page clone.

Implementation rules:

- keep the original module set and admin flow
- preserve draft/publish behavior for site content
- preserve the posts workflow, testimonials moderation, and custom directory entity behavior
- expose hidden original capabilities as proper routes
- move uploads, permissions, and revision history into reusable platform services
- separate reusable engine code from project-specific content schemas

Recommended system shape:

1. A reusable admin platform layer:
   - auth, roles, permissions, audit logs, media, layout, tables, editors, revision workflow
2. A website-specific configuration layer:
   - page/module registry
   - section schemas
   - labels, defaults, public rendering contracts
3. A content/data layer:
   - content modules, revisions, posts, media assets, custom entities

If followed, the new website will reproduce the current admin experience while being cleaner to maintain, safer to secure, and faster to reuse for future projects.

## Deliverables Summary

### What must be built

- Admin shell and dashboard
- Content module engine with draft/publish/reset/restore
- Site page editors for all required sections
- Posts manager and post editor
- Testimonials moderation
- Media library
- Users/roles manager
- Subscribers manager
- Team/faculty custom entity module
- Audit logs

### What can be reused as patterns

- Collapsible admin navigation
- Sticky action bars
- Sortable list editors
- Rich text editor wrapper
- Table filtering, bulk actions, and pagination
- Revision workflow
- Media upload and preview flow

### What should be improved from the old version

- split monolithic site management page
- replace weak role enforcement
- add actual user lifecycle management
- add media usage tracking and cleanup
- add audit logs
- expose dormant features as routed modules

### What is needed to make the new dashboard production-ready

- backend-enforced permissions
- migration-backed schema with seeded roles and permissions
- RLS or server-layer access enforcement
- audit trail coverage
- media cleanup workflow
- deep-linkable routes for every module
- QA for publish/restore/delete paths
- last-admin and self-lockout protections
