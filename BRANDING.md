# BRANDING.md — Fuji rebrand of an Activepieces fork

This fork rebrands the user-facing surfaces of Activepieces to **Fuji**. This file is the
inventory, the per-hit dispositions, the change log, the verification record, and the rebase
guide. It is the single source of truth for what was changed, what was deliberately kept, and why.

## 0. License boundaries (hard rules, verified against the on-disk LICENSE)

The root `LICENSE` splits licensing:

- `packages/ee/**` and `packages/server/api/src/app/ee/**` → **Activepieces Enterprise License**
  (`packages/ee/LICENSE`). Never modified, never deleted, never bypassed. This fork runs
  Community Edition (`AP_EDITION=ce`), where none of that code executes.
- Conservatively, **every path containing `/ee/` is treated as untouchable**, including
  `packages/core/shared/src/lib/ee/**` (technically MIT, but EE-domain) and
  `packages/server/worker/src/lib/execute/jobs/ee/**`.
- Everything else is **MIT Expat**. The root `LICENSE`, `packages/ee/LICENSE`, and all copyright
  notices remain intact and unmodified.

No license/entitlement flag, feature gate, or edition check was weakened, flipped, or removed
anywhere. EE features remain locked exactly as upstream intends.

## 1. Rebrand decisions

| Decision | Value | Notes |
| --- | --- | --- |
| Product name | **Fuji** | Replaces all user-facing "Activepieces" strings |
| Primary color | `#6e41e2` (unchanged) | Placeholder choice so the existing UI palette stays coherent; change `defaultTheme` in `packages/server/api/src/app/flags/theme.ts` + logo assets to re-skin |
| Logo/favicon | Generated placeholders | Simple mountain letter-mark; same filenames/URLs as before |
| Docs/community/Discord/status/sales links | **Removed** from UI | No placeholder URLs shipped; list of removal sites in §2.4 |
| Telemetry | Default **off** in code | `AP_TELEMETRY_ENABLED` still honored if an operator opts in |
| Templates gallery | Default **off** | New `AP_TEMPLATES_SOURCE_URL` env var, default empty |
| Piece sync (`AP_PIECES_SYNC_MODE=OFFICIAL_AUTO`) | **Kept on** | Required for a non-empty piece catalog; metadata comes from `cloud.activepieces.com`; piece code comes from npmjs |
| Internal identifiers | Kept | `@activepieces/*` scopes, `AP_*` env names, `AIProviderName.ACTIVEPIECES`, JWT issuer, DB schema — see §2.9 |

## 2. Inventory & dispositions

### 2.1 Root brand chain (highest impact — change)

Everything below the theme service inherits from these two files:

| Hit | Disposition |
| --- | --- |
| `packages/server/api/src/app/flags/theme.ts:76-80` — `defaultTheme` with `websiteName: 'Activepieces'` + `DEFAULT_BRAND_LOGOS` | **Change** → `websiteName: 'Fuji'`, local logo URLs |
| `packages/core/shared/src/lib/core/common/brand-logos.ts:1-5` — `DEFAULT_BRAND_LOGOS` → `cdn.activepieces.com/brand/*` | **Change** → local `/logo.svg` (favIcon/logoIcon) and full logo; see email caveat below |
| `packages/server/api/src/app/flags/flag.service.ts:173-177` — seeds `THEME` flag from `defaultTheme` | No edit needed (inherits); upgrader data migration covered in §3 |
| `packages/server/api/src/app/platform/platform.service.ts:59-62` — new platforms default to theme logos | No edit needed (inherits) |
| `packages/web/vite.config.mts:19-20` — `AP_TITLE='Activepieces'`, `AP_FAVICON='https://activepieces.com/favicon.ico'` | **Change** → `Fuji`, local `/favicon.ico` |
| `packages/web/index.html:8,11-14` — title placeholder + `/logo.svg`, `/logo-192.png`, `/logo-180.png` icons | Keep markup; **replace the asset files** (§2.5) |

Email caveat: invitation/reset/verify templates use `{{fullLogoUrl}}` in `<img>` tags. With a
relative default (`/logo.svg`) emails render the `{{platformName}}` alt text instead of a logo
until the deployment exposes an absolute logo URL. Recorded as a known limitation (§3).

### 2.2 Web UI strings & translations (change)

i18next uses natural keys — the English sentence IS the key — so each rebranded string changes
the `t()` call site, the `translation.json` key+value in `en`, and the key (plus in-value brand
token) in every other locale (~11 locales; keys mirror `en`).

`packages/web/public/locales/en/translation.json` — 16 values contain "Activepieces": help
translate (:468), desktop experience (:969), MCP connect (:984), billing support email (:1199),
telemetry consent (:1241), internal errors (:1440), API keys (:1544), SAML instructions (:1706),
"Model by Activepieces" (:2634), "Activepieces AI — …" (:2642, :2646), MCP+API blurb (:2672),
credits explainer (:2706, :2708, :2710), piece-sync toast (:3063). **All change** (SAML key keeps
the `Activepieces` Audience URI literal — see §2.6).

Hardcoded component strings (all **change** unless noted):

- `src/components/custom/show-powered-by.tsx:27,38` — "Built with activepieces" → "Built with Fuji"
- `src/app/builder/flow-canvas/utils/flow-screenshot-utils.ts:322-371,503` — canvas twin of the watermark → Fuji mark
- `src/app/routes/chat/flow-chat.tsx:95` — default bot name → `'Fuji'`
- `src/features/agents/ai-model/index.tsx:55,57` — AI provider display name → `'Fuji'`; CDN logo → local asset
- `src/features/billing/components/credits-info-dialog.tsx:133,156,170,200,207,218`, `plan-selector-utils.ts:192`, `platform-features.ts:54`, `plan-feature-sample.tsx:97`, `api-keys/index.tsx:46`, `telemetry-section.tsx:29`, `internal-errors-table.tsx:50`, `handler-flow-builder.ts:55` (author → Fuji), `platform-pieces-hooks.ts:66` (toast → "Fuji cloud"), `install-piece-dialog.tsx:191` (compatibility text), `conversation-list.tsx:315`, `mcp-authorize/index.tsx:191`, `embedded-mcp-authorize-dialog.tsx:102`, `billing/index.tsx:54` (drop support@ email), `connect-git-dialog.tsx:123,149` (example repo → your-org), `embedding-analytics-loader.tsx:46,51,94` (console prefix → Fuji), `sample-data.ts:119` (sample webhook path)
- `src/features/authentication/components/sign-up-form.tsx:86` — `websiteName === 'activepieces'` newsletter gate → neutralized (§3)

### 2.3 Brand resolution fallback chain (no edits needed beyond §2.1/§2.5)

CE chain: `flag.service.ts` seeds `THEME` → `ee/helper/appearance-helper.ts` (EE, untouchable,
returns `defaultTheme` on CE) → web `useWebsiteBranding()` → `theme-provider.tsx:48-99`
(document title + favicon), `page-title.tsx:14` (`… | Fuji`), `primary-rail/index.tsx:219,258,265,284`
(sidebar icon + `<h1>`), `home-button.tsx:56`, `auth-backdrop.tsx:22`, `full-logo.tsx:12-16`
(sentinel: renders inline wordmark when `logoUrl === DEFAULT_BRAND_LOGOS.fullLogoUrl` — the
sentinel keeps working because both sides import the same constant), `automations-empty-state.tsx:266`.

### 2.4 External links removed from the UI (user decision: remove, not re-point)

| Surface | File:line |
| --- | --- |
| Help & Feedback menu (docs, changelog, community) — whole dropdown removed | `src/app/components/help-and-feedback.tsx:28,42,61` + its render site |
| Builder header "Support" button | `src/app/builder/builder-header/builder-header.tsx:184` |
| Pieces "no results" feedback link | `src/app/builder/pieces-selector/no-results-found.tsx:35` |
| Language settings translate + i18n docs links | `src/app/components/account-settings/language-toggle.tsx:70,119` |
| Truncated-logs docs link | `src/app/builder/run-details/flow-step-input-output.tsx:355` |
| Formula docs link | `function-search-popover.tsx:266` |
| Custom-piece docs link | `install-piece-dialog.tsx:191` |
| Tables import docs link | `import-table-dialog.tsx:428` |
| Enterprise-upgrade URL (5 copies) | `use-feature-gate.tsx:119`, `feature-banner.tsx:52`, `billing-page-shell.tsx:18`, `feature-sample.tsx:123`, `feature-teaser.tsx:139` |
| Sales contact URLs | `request-trial.tsx:35-40,75`, `plan-selector-utils.ts:9` |
| Billing support mailto | `automatic-trial-activation.tsx:338`, `platform/billing/index.tsx:54` |
| MCP docs link | `mcp-server/grants/grants-tab.tsx:36` |
| MCP directory links (Claude/Cursor listings of upstream cloud) + tutorial videos | `mcp-client-catalog.ts:63,65,70,72` |
| Health page docs + releases links | `system-health-tab.tsx:28,31,91,109` |
| Workers docs links | `worker-assignments-tab.tsx:36`, `workers/index.tsx:155` |
| Telemetry tracked-events docs link | `tracked-events-dialog.tsx:22` |
| Embed docs link | `platform/security/embed/index.tsx:147` |
| Event-streaming docs link | `plan-feature-sample.tsx:129` |
| SAML docs link | `saml-dialog.tsx:422` (text rebranded, link stripped) |
| Shared constants `supportUrl` / `feedbackUrl` | `packages/core/shared/src/lib/core/support-url.ts`, `feedback-url.ts` — exports removed with their last consumers |
| Privacy/terms flag defaults | `flag.service.ts:193-203` → empty defaults; UI hides when empty (§3) |

Kept (functional tool icons, not brand): `mcp-client-display.ts:4` `CDN_ICONS_URL` (Claude/Cursor
logos), `ai-providers.ts` / `step-utils.tsx` / `agent-tools.tsx` / `ai-actions-list.tsx` piece &
provider icons on `cdn.activepieces.com`.

### 2.5 Image assets (change — placeholders)

| Asset | Action |
| --- | --- |
| `packages/web/public/logo.svg` | Replace with Fuji mark SVG |
| `packages/web/public/logo-192.png`, `logo-180.png`, `favicon.ico` | Regenerate from the Fuji mark |
| `src/components/custom/activepieces-wordmark.tsx` | Replace inline AP wordmark paths with Fuji wordmark (renamed `fuji-wordmark.tsx`) |
| `src/components/custom/show-powered-by.tsx` inline swoosh | Replace with Fuji mark |
| `src/assets/img/custom/ActivepiecesCreateTodoGuide.png`, `ActivepiecesTodo.png` | Delete (unreferenced orphans) |

### 2.6 Server user-facing strings (change)

- `mcp/mcp-server-builder.ts:22,55-66` — MCP server header/name/title/websiteUrl/description/icons → Fuji, local icons
- `mcp/tools/ap-setup-guide.ts:47,99,109,118,133,144,212`, `mcp/tools/piece-expertise.ts:23`, `mcp/mcp-usage-tracker.ts:76`, `mcp/tools/ap-validate-step-config.ts:91` — "your Activepieces dashboard" style strings → Fuji
- `ai/providers/index.ts:35`, `ai/ai-provider-service.ts:429` — managed AI provider display name → Fuji (DB rows of existing installs handled by migration, §3)
- `ai/ai-router.service.ts:67`, `packages/server/utils/src/ai-utils.ts:152` — error strings → Fuji
- `knowledge-base/knowledge-base.module.ts:13` → Fuji
- `helper/system-validator.ts:90,309,325,333,351,361` — `docUrl` in admin error payloads → emptied (field kept for API shape)
- `app/app.ts:153,170,174` — OpenAPI title → "Fuji API", server URL neutralized, externalDocs removed
- CE SAML dialog `saml-dialog.tsx:430` keeps the literal `Activepieces` as Audience URI because EE `saml-client.ts:95` (untouchable) hardcodes `entityID: 'Activepieces'` — mismatching them would break SAML for entitled editions. **Deliberate keep.**
- Emails: templates are already placeholder-based (`{{platformName}}`, `{{fullLogoUrl}}`, `{{primaryColor}}`); no "Activepieces" text in any subject or body. Sender defaults (`AP_SMTP_SENDER_NAME/EMAIL`) have no code default to change — documented for operators.
- Historical migrations `1709051625110` (sqlite) / `1709052740378` (postgres) seed the default platform with `Activepieces`/CDN logos: **not edited** (immutable history); fresh installs get Fuji via code defaults, upgraders via the new data migration (§3, after the migrations playbook).

### 2.7 Phone-home / external endpoints

| Endpoint | Default | Disposition |
| --- | --- | --- |
| Telemetry (`PostHog us.i.posthog.com`) | `AP_TELEMETRY_ENABLED='true'` (`system.ts:56`), `?? true` fallback (`platform-configuration.service.ts:61`), DB column defaults `true` (`platform-configuration.entity.ts:17-26`) | **Change** default to false in code; row snapshot then stores false on first boot |
| Template telemetry (`cloud.activepieces.com/api/v1/templates-telemetry`) | gated by product telemetry | Off automatically once telemetry defaults false |
| Templates source (`community-templates.service.ts:4`) | hardcoded `https://cloud.activepieces.com/api/v1/templates` | **Change** → new `AP_TEMPLATES_SOURCE_URL` prop, default empty; empty ⇒ empty lists/categories, UI shows its empty state (graceful) |
| Version check (`packages/server/utils/src/ap-version.ts:36-50`) | fetches `raw.githubusercontent.com/activepieces/activepieces` | **Change** → no call home; `getLatestRelease()` returns `'0.0.0'` |
| Piece metadata sync (`piece-sync-service.ts:18`) | `cloud.activepieces.com/api/v1/pieces`, mode `OFFICIAL_AUTO` | **Keep** — required for catalog; failure is non-fatal (hourly retry) |
| Piece code bundles (`piece-bundle.ts:87`) | npmjs registry (CDN mirror opt-in, default off) | **Keep** |
| Cloud OAuth2 (`secrets.activepieces.com`, `cloudAuthEnabled` default true) | on | **Keep** — functional connection helper; can be disabled by operators via `AP_CLOUD_AUTH_ENABLED` |
| AI model catalog / pricing (`model-catalog.ts:81`, `model-tier-catalog.ts:126`) | cdn.activepieces.com, env-overridable, graceful fallback | **Keep** |
| Autumn console (`system.ts:25`) | console.activepieces.com | **Keep** — EE billing only, inert on CE |
| `/ingest` PostHog reverse proxy (`server.ts:69-100`) | present | **Keep** — inert while telemetry off |
| Web `cloud.activepieces.com` host check (`src/lib/api.ts:13`) | cloud-mode only | **Keep** (functional) |

### 2.8 Packaging, Docker, docs

- **Change**: `docker-compose.yml` (image `ghcr.io/activepieces/activepieces:0.92.2` ×2 → `fuji:latest` local-build placeholder; container/network names → fuji), `.env.example` (`AP_TEMPLATES_SOURCE_URL` stale upstream URL → empty/commented; `AP_POSTGRES_DATABASE` example), `README.md` (hero/badges/tagline/nav/community/license sections → fork readme; all-contributors table kept as attribution), `docs/docs.json` (name → Fuji, cloud Sign-Up link removed), `docs/install/options/docker.mdx` + `docker-compose.mdx` install commands (image refs, `get.activepieces.com` script), `deploy/activepieces-helm/values.yaml:10`, `deploy/pulumi/Pulumi.yaml`, `tools/update.sh`, `docker-entrypoint.sh:31` startup echo.
- **Keep (functional)**: `docker-entrypoint.sh:22` JWT issuer `'activepieces'` (matches server-side validation — internal identifier), root `package.json` name, all `@activepieces/*` turbo filters, CI workflows (`continuous-delivery-*.yml`, `ci.yml` repo guards — no-ops in this fork), benchmark cloudbuild configs, dev/test compose files (CI-coupled), CONTRIBUTING.md / SECURITY.md / CODE_OF_CONDUCT (upstream process docs, kept as attribution + upstream policy), all-contributors table, docs/ content (1,034 mentions across 154 files — upstream-authored documentation; only the fork-facing install commands change).
- Helm chart internal naming (`activepieces.fullname` helpers, `activepiecesConfig` values keys): **keep** — renaming churns the chart for zero user visibility; noted as cosmetic-optional.

### 2.9 Kept intentionally — functional identifiers (summary)

`@activepieces/*` npm scope & import paths (~1,500 hits; piece engine + registry resolution key off them) · `AP_*` env var names · `AIProviderName.ACTIVEPIECES` enum value + `activepieces` DB provider key · `ActivepiecesError`/`ActivepiecesAi*` type names · `CLOUD_HOSTNAME` cloud detection · `LOGIN_QUERY_PARAM='activepiecesLogin'` · `FALLBACK_SLUG='activepieces'` MCP slug · `activepieces-validator` MCP clientInfo · JWT issuer · logger/otel service names (`activepieces-worker`, `activepieces.queue-metrics`) · PostHog API keys (inert while telemetry off) · telemetry property names (`activepiecesEdition`…) · piece display names/authors in catalog metadata (synced data) · DB/table/column names · `/api/v1/*` surface · historical migrations · test fixtures · `app.ts:349` edition log line.

### 2.10 EE-bound branded strings — exist but are NOT touched (CE never executes them)

`smtp-email-sender.ts:106` (cloud email footer w/ SF address; CE sends empty footer) · all email subjects (`:131-145`) · `agent-user-identity.ts:57` prompt · `scim-discovery-controller.ts:20,48,77,208` · `saml-client.ts:95` entityID · `onepassword-provider.ts:10` · `project-replace.service.ts:140` · `agent-model-resolution.ts:87` · `cloudflare.service.ts:119` fallback origin · `appsumo.module.ts:104` · `chat-analytics-sync.ts:16` · `license-key-usage-report-service.ts` (PostHog usage report, gated on license key — none on CE) · worker EE agent UA strings/tool texts · `core/shared/src/lib/ee/*` provider logos, `about_activepieces` skill, SCIM schema URN.

## 3. Change log

_(filled in during the change phase — each entry: file, what changed)_

## 4. Verification record

_(filled in during the verification phase — each §4.3 step of the brief with output snippets)_

## 5. Rebase notes — the brand patch

Every file below is part of the brand patch. On upstream merges, conflicts in these files are
branding conflicts — re-apply the Fuji side (or re-run the same substitutions). Files NOT listed
here should merge clean.

_(final list generated from `git diff --name-only main..rebrand` at the end of the change phase)_
