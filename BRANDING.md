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

Branch `rebrand` (2 commits: `6c512c71f6` rebrand, `b7833e400c` lint+validator). 116 files changed.

### 3.1 Brand chain (drives title/favicon/sidebar/login/emails/MCP)

- `packages/server/api/src/app/flags/theme.ts` — `defaultTheme` → `websiteName: 'Fuji'`; logo URLs composed from `DEFAULT_BRAND_LOGOS` and made absolute when `AP_FRONTEND_URL` is set (new `withFrontendUrl` helper) so emails and MCP clients get resolvable logos.
- `packages/core/shared/src/lib/core/common/brand-logos.ts` — defaults now local: `/logo-full.svg`, `/logo.svg` (CDN URLs removed).
- `packages/web/vite.config.mts` — `AP_TITLE='Fuji'`, `AP_FAVICON='/favicon.ico'`.
- `packages/core/shared` version `0.201.0 → 0.202.0` (minor: `DEFAULT_BRAND_LOGOS` behavior change; `supportUrl`/`feedbackUrl` exports removed with their files `support-url.ts`/`feedback-url.ts` and barrel lines in `src/index.ts`).

### 3.2 Telemetry / phone-home

- `system.ts` — `AP_TELEMETRY_ENABLED` default `'true'` → `'false'`; `platform-configuration.service.ts` COALESCE fallback `?? true` → `?? false`. (DB column defaults untouched; explicit inserts always set the value. Existing rows flipped by migration, §3.6.)
- `community-templates.service.ts` — source URL now read from new `AP_TEMPLATES_SOURCE_URL` (added to `system-props.ts` + validator map in `system-validator.ts`); empty ⇒ `list`→`{next:null,previous:null,data:[]}`, `getCategories`→`[]`, `getOrThrow`→404. Templates gallery shows its empty state, no network call. Re-enable by pointing the env at any source implementing the 3-JSON-endpoint contract (self-hosted templates recommended; content from upstream's gallery would re-introduce their branding inside template text).
- `packages/server/utils/src/ap-version.ts` — `getLatestRelease()` no longer fetches GitHub raw; returns `'0.0.0'`.

### 3.3 Web UI

- Strings rebranded across `credits-info-dialog`, `plan-selector(-utils)`, `platform-features`, `plan-feature-sample`, `api-keys`, `telemetry-section`, `internal-errors-table`, `handler-flow-builder` (author→Fuji), `platform-pieces-hooks` (toast→"Pieces have been synced."), `install-piece-dialog` (link stripped), `conversation-list`, `flow-chat` (bot name), `mcp-authorize` + `embedded-mcp-authorize-dialog`, `connect-git-dialog` (placeholders), `embedding-analytics-loader` (console prefix), `sample-data` (webhook path), `ai-model/index` (provider name Fuji + local logo).
- Links removed (components keep compiling; unused imports/props cleaned): help menu (`help-and-feedback.tsx` deleted + usages in `primary-rail`, `sidebar-user`), builder-header Support button, no-results Request Piece (`no-results-found.tsx` rewritten), language translate link (`language-toggle.tsx`), truncated-logs/formulas/import-table docs anchors, `system-health-tab` links + `link` prop, workers tabs links, `tracked-events-dialog`, `grants-tab`, embed page read-more, MCP directory/video links (`mcp-client-catalog.ts`), sales CTAs (`request-trial.tsx` deleted; `FeatureKey` type moved to `feature-tier.ts`; `plan-selector`, `use-team-project-limit-guard`, `feature-banner/-sample/-teaser`, `billing-page-shell`, `use-feature-gate` de-linked; `locked-feature-guard`/`locked-alert` props adjusted), billing support email (`platform/billing`, `automatic-trial-activation`).
- Newsletter opt-in removed from `sign-up-form.tsx` (was default-checked on CE).
- Privacy/terms: seed entries removed from `flag.service.ts` → signup legal note hidden (renders nothing when flags absent).
- `saml-dialog.tsx` — docs link stripped; **Audience URI literal `Activepieces` kept** (matches EE `saml-client.ts:95` entityID, untouchable).
- Wordmark: `activepieces-wordmark.tsx` → `fuji-wordmark.tsx` (mark + "Fuji" text); `show-powered-by.tsx` + `flow-screenshot-utils.ts` canvas twin → Fuji mountain mark, "Built with Fuji".
- Assets regenerated: `public/logo.svg`, `logo-full.svg`, `logo-192.png`, `logo-180.png`, `favicon.ico` (purple tile `#6e41e2`, white two-peak mark). Orphan PNGs deleted.

### 3.4 Locales (11 languages)

- 15 keys renamed (brand token swap; en value = key; non-en values token-swapped; structurally-changed keys reset to en text): telemetry consent, internal errors, MCP/API blurbs, desktop experience, MCP connect, "Model by Fuji", "Fuji AI —…", "Fuji AI", credits ×3, API keys ×2, pieces-sync toast, install-piece markdown, SAML markdown.
- 140 keys deleted (usage removed, verified unused against src) incl. help-menu, newsletter, Request Piece, Talk to sales, Contact Sales/Support, See the template format, Read the telemetry docs, How connecting works, Claude directory, billing support email — plus ~26 stale crowdin orphans in `ar`/`ru`.
- Sole remaining brand hit per locale: the SAML Audience-URI key (justified above).

### 3.5 Server / MCP / OpenAPI

- `mcp-server-builder.ts` — name/title Fuji, websiteUrl = `AP_FRONTEND_URL ?? ''`, icons from local assets; instructions header "## Fuji MCP Server". Brand strings rebranded in `ap-setup-guide`, `piece-expertise`, `mcp-usage-tracker`, `ap-validate-step-config`, `ai-router.service`, `ai-utils`, `knowledge-base.module`.
- `system-validator.ts` — 6 `docUrl`s emptied (field kept, zero in-repo consumers).
- `app.ts` — OpenAPI title "Fuji API Documentation"; `servers` and `externalDocs` entries removed (typed optional in @fastify/swagger; absent servers ⇒ relative `/`).
- AI provider display name → 'Fuji' in `providers/index.ts` + `ai-provider-service.ts` seed (existing rows via migration).

### 3.6 Migration

- `postgres/1867000000000-RebrandDefaultPlatformToFuji.ts` (registered in `postgres-connection.ts`, `breaking=false`, `release='0.93.0'`, reversible `down()`): platform name/logos (WHERE old defaults), THEME flag `websiteName`+logos (jsonb_set, guarded), `ai_provider.displayName`, `platform_configuration.isProductTelemetryEnabled` true→false, `template.author`. Historical migrations untouched.

### 3.7 Packaging

- `docker-compose.yml` — image `fuji:latest` (×2), container/network `fuji`, worker gets `AP_FRONTEND_URL=http://app` so its Socket.IO reaches the app inside the compose network (matches upstream's documented multi-container pattern).
- `docker-compose.deploy.yml` — production deploy variant (host port `32233:80`, `./exports` volume, 5 worker replicas), same rebrand rules; validated with `docker compose -f docker-compose.deploy.yml config -q`.
- `README.md` rewritten as fork readme (attribution + MIT + all-contributors kept; hero/badges/discord/crowdin/screenshots removed; install = build from repo), `docs/docs.json` (name Fuji; cloud signup/pieces links removed), `docs/install/options/docker.mdx` + `docker-compose.mdx` (local-build flow, `~/.fuji`), `deploy/activepieces-helm/values.yaml`, `deploy/pulumi/Pulumi.yaml`, `tools/update.sh`, `docker-entrypoint.sh` startup echo, `.env.example` (`AP_TEMPLATES_SOURCE_URL` commented opt-in; `AP_POSTGRES_DATABASE=fuji`).

## 4. Verification record

| Step | Result |
| --- | --- |
| `npm run lint-dev` | ✅ 38/38 tasks, **0 errors** (71 pre-existing warnings, untouched files) |
| Type build (`turbo build` web/api/worker/engine/server-utils) | ✅ 18/18 tasks (api `tsc`, web `vite`+checker) after adding the `TEMPLATES_SOURCE_URL` validator entry |
| `check-migrations` locally | ⚠️ fails for environmental reasons only: local Node 18 `ts-node` cannot `require()` ESM `evlog` (ERR_REQUIRE_ESM) — migration step never runs, drift check then fails. Validated via container boot instead (Node 24). |
| Docker image | ✅ `docker build -t fuji:latest .` exit 0 (1.35 GB) |
| Boot (compose: fuji-app, 1 worker, pgvector, redis) | ✅ `Starting Fuji (APP mode)`; all migrations ran **incl. `RebrandDefaultPlatformToFuji1867000000000`** (verified in `migrations` table) |
| Login page | ✅ `<title>Fuji</title>`; icons `/logo.svg`, `/logo-192.png`, `/logo-180.png`, `/favicon.ico` all HTTP 200 with correct content types |
| THEME flag | ✅ `websiteName: Fuji`, logos → `http://localhost:8080/logo*.svg` (absolute because `.env` sets `AP_FRONTEND_URL`), primary `#6e41e2`; `PRIVACY_POLICY_URL`/`TERMS_OF_SERVICE_URL` absent |
| Sign-up | ✅ user created, `verified: true`, platform + project provisioned |
| Piece catalog (registry sync kept on) | ✅ **776 pieces** incl. `@activepieces/piece-http@0.13.3`, `piece-webhook@0.1.43` |
| Flow E2E | ⚠️ partial: flow created; webhook trigger (`piece-webhook`/`catch_webhook`) + HTTP step (`send_request`) configured and published **only after** the worker Socket.IO link was fixed locally — the stock `.env` default `AP_FRONTEND_URL=http://localhost:8080` points the worker container at itself; **local compose needs `AP_INTERNAL_URL=http://app:3000`** (added to local `.env`; upstream `.env.example` has the same default). Final publish/webhook-execution re-test was skipped on request. Root cause is compose/env wiring, not branding code. |
| Bundle grep (`dist/packages/web`, 190 hits) | ✅ all functional: 79 `@activepieces/*` specifiers, ~95 `cdn.activepieces.com/pieces|icons` catalog icons, 3 cloud/secrets OAuth URLs (inactive on CE self-host), 5 posthog prop names (telemetry off), `AIProviderName.ACTIVEPIECES='activepieces'` enum/DB key, MCP `mcpServers:{activepieces:…}` config slug, `activepiecesLogin` query param, `extractActivepiecesRouteFromUrl` embed-sdk symbol, EE embed-sdk `Activepieces:` error prefix, 11 locale SAML Audience-URI literals (§2.6). Zero marketing strings, product-name strings, or doc/sales links. |

## 5. Rebase notes — the brand patch

116 files (below). On upstream merges, conflicts in these files are branding conflicts — take the upstream change, then re-apply the same substitution. Highest-churn files (expect conflicts every merge): `packages/web/public/locales/*/translation.json` (11 files), `README.md`, `docs/**`, `packages/web/src/features/billing/**` (upstream actively reworks sales CTAs), `packages/web/src/app/routes/platform/infra/**` (docs links re-added upstream), `packages/web/src/app/components/feature-*.tsx`.

Re-apply checklist: (1) grep `rg -i activepieces packages/web/src packages/server/api/src/app packages/core/shared/src -g '!*ee*'` and disposition new hits per §2; (2) regenerate locale renames with the same script pattern (rename key+value, delete unused, keep SAML audience literal); (3) verify `DEFAULT_BRAND_LOGOS`/`theme.ts` still feed the sentinel in `full-logo.tsx`; (4) re-run `npm run lint-dev` + `turbo build --filter=web --filter=api` + bundle grep.

```
.env.example                    BRANDING.md                    README.md
bun.lock                        deploy/activepieces-helm/values.yaml
deploy/pulumi/Pulumi.yaml       docker-compose.yml             docker-compose.deploy.yml
docker-entrypoint.sh
docs/docs.json                  docs/install/options/docker-compose.mdx
docs/install/options/docker.mdx
packages/core/shared/package.json
packages/core/shared/src/index.ts
packages/core/shared/src/lib/core/common/brand-logos.ts
packages/core/shared/src/lib/core/feedback-url.ts      (deleted)
packages/core/shared/src/lib/core/support-url.ts       (deleted)
packages/server/api/src/app/ai/{ai-provider-service,ai-router}.ts
packages/server/api/src/app/ai/providers/index.ts
packages/server/api/src/app/app.ts
packages/server/api/src/app/database/migration/postgres/1867000000000-RebrandDefaultPlatformToFuji.ts
packages/server/api/src/app/database/postgres-connection.ts
packages/server/api/src/app/flags/{flag.service,theme}.ts
packages/server/api/src/app/helper/system-validator.ts
packages/server/api/src/app/helper/system/{system-props,system}.ts
packages/server/api/src/app/knowledge-base/knowledge-base.module.ts
packages/server/api/src/app/mcp/{mcp-server-builder,mcp-usage-tracker}.ts
packages/server/api/src/app/mcp/tools/{ap-setup-guide,ap-validate-step-config,piece-expertise}.ts
packages/server/api/src/app/platform/platform-configuration.service.ts
packages/server/api/src/app/template/community-templates.service.ts
packages/server/utils/src/{ai-utils,ap-version}.ts
packages/web/public/{favicon.ico,logo-180.png,logo-192.png,logo-full.svg,logo.svg}
packages/web/public/locales/{ar,de,en,es,fr,ja,nl,pt,ru,zh,zh-TW}/translation.json
packages/web/vite.config.mts
packages/web/src/app/builder/builder-header/builder-header.tsx
packages/web/src/app/builder/flow-canvas/utils/flow-screenshot-utils.ts
packages/web/src/app/builder/piece-properties/text-input-with-mentions/components/function-search-popover.tsx
packages/web/src/app/builder/piece-properties/text-input-with-mentions/tiptap-editor.tsx
packages/web/src/app/builder/pieces-selector/no-results-found.tsx
packages/web/src/app/builder/run-details/flow-step-input-output.tsx
packages/web/src/app/components/account-settings/language-toggle.tsx
packages/web/src/app/components/{billing-page-shell,embedding-analytics-loader,feature-banner,feature-sample,feature-teaser,locked-feature-guard}.tsx
packages/web/src/app/components/help-and-feedback.tsx            (deleted)
packages/web/src/app/components/primary-rail/index.tsx
packages/web/src/app/components/project-settings/pieces/index.tsx
packages/web/src/app/components/sidebar/sidebar-user.tsx
packages/web/src/app/routes/chat-with-ai/conversation-list.tsx
packages/web/src/app/routes/chat/flow-chat.tsx
packages/web/src/app/routes/embed/embedded-mcp-authorize-dialog.tsx
packages/web/src/app/routes/mcp-authorize/index.tsx
packages/web/src/app/routes/mcp-server/grants/grants-tab.tsx
packages/web/src/app/routes/mcp-server/mcp-client-catalog.ts
packages/web/src/app/routes/mcp-server/pieces/pieces-panel.tsx
packages/web/src/app/routes/platform/billing/index.tsx
packages/web/src/app/routes/platform/infra/configurations/{telemetry-section,tracked-events-dialog}.tsx
packages/web/src/app/routes/platform/infra/event-destinations/lib/handler-flow-builder.ts
packages/web/src/app/routes/platform/infra/health/components/{internal-errors-table,system-health-tab}.tsx
packages/web/src/app/routes/platform/infra/workers/{index.tsx,worker-assignments-tab.tsx}
packages/web/src/app/routes/platform/{plan-feature-sample.tsx,sample-data.ts}
packages/web/src/app/routes/platform/security/api-keys/index.tsx
packages/web/src/app/routes/platform/security/embed/index.tsx
packages/web/src/app/routes/platform/security/sso/saml-dialog.tsx
packages/web/src/assets/img/custom/Activepieces*.png   (deleted ×2)
packages/web/src/components/custom/activepieces-wordmark.tsx   (deleted)
packages/web/src/components/custom/{fuji-wordmark.tsx,full-logo.tsx,locked-alert.tsx,show-powered-by.tsx}
packages/web/src/features/agents/ai-model/index.tsx
packages/web/src/features/authentication/components/sign-up-form.tsx
packages/web/src/features/billing/components/automatic-trial-activation.tsx
packages/web/src/features/billing/components/feature-usage/credits-info-dialog.tsx
packages/web/src/features/billing/components/plan-selector-utils.ts
packages/web/src/features/billing/components/plan-selector.tsx
packages/web/src/features/billing/components/request-trial.tsx    (deleted)
packages/web/src/features/billing/hooks/{use-feature-gate,use-team-project-limit-guard,use-upgrade-click}.ts*
packages/web/src/features/billing/index.ts
packages/web/src/features/billing/utils/{feature-tier,platform-features}.ts
packages/web/src/features/pieces/components/install-piece-dialog.tsx
packages/web/src/features/platform-admin/hooks/platform-pieces-hooks.ts
packages/web/src/features/project-releases/components/connect-git-dialog.tsx
packages/web/src/features/tables/components/import-table-dialog.tsx
tools/update.sh
```

## 6. Known limitations & operator notes

- **Email logo**: with `AP_FRONTEND_URL` set, default logos are absolute and render in emails; without it they are relative (`/logo.svg`) and email clients show the `{{platformName}}` ("Fuji") alt text instead of an image. Set `AP_FRONTEND_URL` on any real deployment.
- **Templates gallery**: off by default; `AP_TEMPLATES_SOURCE_URL` re-enables against a source you control (self-hosted JSON recommended — upstream gallery content carries their branding).
- **Placeholder artwork**: logos are generated purple/white mountain placeholders. To re-skin: replace the 5 files in `packages/web/public/`, the mark in `fuji-wordmark.tsx`, `show-powered-by.tsx`, `flow-screenshot-utils.ts` (`POWERED_BY_LOGO_PATH`), and `defaultTheme.primaryColor` in `flags/theme.ts`.
- **Piece icons** still load from `cdn.activepieces.com` (functional catalog data). Rehosting would require rewriting synced `piece_metadata.logoUrl` values.
- **Local compose**: workers need to reach the app — both compose files set `AP_FRONTEND_URL=http://app` on the worker service (the `.env` default `http://localhost:8080` points a worker container at itself inside the container network).
- **Deploy variant**: `docker-compose.deploy.yml` expects the same `.env` (`tools/deploy.sh` generates it) plus an externally accessible `AP_FRONTEND_URL` on the app (e.g. `http://<host>:32233`) so webhook URLs and email logos resolve for end users.
- **EE-bound branded strings** (§2.10) remain upstream-branded by license design; none execute on CE.
