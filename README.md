# Platform Design System — Token Generator

This repository contains the platform-independent **Design Token system** for KMP and Web SDKs. It provides a single source of truth for visual design decisions across Kotlin Multiplatform (Compose) and Web (Tailwind / CSS), ensuring consistent UI across both frontends.

---

## Consumer SDKs & Ecosystem

This design system serves as the centralized **Single Source of Truth (SSOT)** for visual design decisions across the platform ecosystem:

- [**`kmp-platform-sdk`**](https://github.com/mudrichenkoevgeny/kmp-platform-sdk) — Modular Kotlin Multiplatform client SDK for Android & Web (Wasm) built with Compose Multiplatform.
- [**`web-platform-sdk`**](https://github.com/mudrichenkoevgeny/web-platform-sdk) — Modular web client SDK and frontend applications built with Tailwind CSS & TypeScript.

---

## Architecture Overview

```
tokens/*.json (Single Source of Truth)
            │
            ▼
   scripts/generate-tokens.js
            │
            ▼
    generated/ (Local Output)
    ├── compose/GeneratedDesignTokens.kt
    ├── web/tokens.css
    └── web/tokens.ts
            │
    (Manual Copy / Sync)
    ├── kmp-platform-sdk (CoreTheme / Compose)
    └── web-platform-sdk (Tailwind / CSS)
```

---

## 1. Location of Source Tokens

Source tokens live in `tokens/`:

- **`colors.json`**: Primitive color palettes (Charcoal, Neutral, Error) and semantic color mappings (Light & Dark themes).
- **`spacing.json`**: Spacing tokens (`extraSmall`, `small`, `medium`, `large`).
- **`radius.json`**: Corner radius tokens (`extraSmall`, `small`, `medium`, `large`, `extraLarge`).
- **`sizing.json`**: Component sizing dimensions (headers, buttons, dialogs, progress indicators).
- **`elevation.json`**: Elevation and shadow tokens.
- **`typography.json`**: Font family (`PT Sans`), font weights (`regular: 400`, `bold: 700`), and font styles (`normal`, `italic`).

These JSON files serve as the single source of truth (SSOT). All values are stored using standard JSON format compatible with W3C Design Tokens.

---

## 2. Token Structure

Tokens are organized into:

1. **Primitive Tokens**: Direct raw values (e.g. hex codes, explicit pixel/dp values).
2. **Semantic Tokens**: Meaningful UI references pointing to primitive tokens (e.g. `{color.primitive.charcoal.700}`).

### Example (`colors.json`):
```json
{
  "color": {
    "primitive": {
      "charcoal": {
        "700": { "$value": "#2C3137", "$type": "color" }
      }
    },
    "semantic": {
      "light": {
        "primary": { "$value": "{color.primitive.charcoal.700}", "$type": "color" }
      }
    }
  }
}
```

---

## 3. How to Add or Change a Token

1. Open the appropriate JSON file in `tokens/`.
2. Edit or add your token using the standard format:
   ```json
   "myTokenName": { "$value": "#123456", "$type": "color" }
   ```
3. Run the regeneration script (see section below).

---

## 4. How to Regenerate Platform Outputs

Run the generation script from the project root using `pnpm`:

```bash
pnpm run generate
```

Or using Node.js directly as a fallback:

```bash
node scripts/generate-tokens.js
```

---

## 5. Generated Artifacts & Local Output Directory

The generator script parses all JSON files in `tokens/`, resolves alias references, and automatically creates files locally in the `generated/` directory:

- **Compose (KMP)**: `generated/compose/GeneratedDesignTokens.kt` — Kotlin `object` containing Compose `Color` (HEX), `Dp` values, and `Typography` constants (font family, font weights 400/700, font styles).
- **Web (CSS)**: `generated/web/tokens.css` — CSS custom properties (`:root` & `.dark`) with HSL/HEX colors, `rem` units for spacing/radius/sizing, `px` for elevation, and `--font-family-primary`/`--font-weight-*` variables.
- **Web (TypeScript)**: `generated/web/tokens.ts` — TypeScript constant object (`GeneratedDesignTokens`) for JS/TS UI logic and dynamic styling.

> **Note**: Do not edit these generated files manually in the generator repository. All changes must originate from `tokens/`.

---

## 6. Output Artifacts & Target Locations

After generation, the generated token files and font assets are manually copied to their respective target SDK repositories:

### Token Artifacts

| Generated Local Artifact | Target SDK Repository & Path |
| :--- | :--- |
| `generated/compose/GeneratedDesignTokens.kt` | [`kmp-platform-sdk`](https://github.com/mudrichenkoevgeny/kmp-platform-sdk)<br>`core/common/src/commonMain/kotlin/io/github/mudrichenkoevgeny/kmp/core/common/ui/theme/tokens/GeneratedDesignTokens.kt` |
| `generated/web/tokens.css` | [`web-platform-sdk`](https://github.com/mudrichenkoevgeny/web-platform-sdk)<br>`packages/core-common/src/theme/tokens/tokens.css` |
| `generated/web/tokens.ts` | [`web-platform-sdk`](https://github.com/mudrichenkoevgeny/web-platform-sdk)<br>`packages/core-common/src/theme/tokens/tokens.ts` |

### Font Asset Files

| Local Font Directory | Target SDK Repository & Path |
| :--- | :--- |
| `assets/fonts/ttf/*.ttf` | [`kmp-platform-sdk`](https://github.com/mudrichenkoevgeny/kmp-platform-sdk)<br>`core/common/src/commonMain/composeResources/font/` |
| `assets/fonts/woff2/*.woff2` | [`web-platform-sdk`](https://github.com/mudrichenkoevgeny/web-platform-sdk)<br>`packages/core-common/src/assets/fonts/` |

---

## 7. Platform Integrations

### Compose / KMP Integration
After copying `GeneratedDesignTokens.kt` to `kmp-platform-sdk`, Compose components consume tokens through `CoreTheme`:
- `Color.kt` maps `PrimaryLight`, `PrimaryDark`, etc. from `GeneratedDesignTokens.Colors.Light.primary`.
- `Dimens.kt` maps dimensions from `GeneratedDesignTokens.Spacing` and `GeneratedDesignTokens.Sizing`.
- `Shapes.kt` maps corner radii from `GeneratedDesignTokens.Radius`.
- `Typography.kt` maps font weights and styles in `ptSansFontFamily()` from `GeneratedDesignTokens.Typography`.
- **Font Resources**: Physical font files (`pt_sans_regular.ttf`, `pt_sans_bold.ttf`, `pt_sans_italic.ttf`, `pt_sans_bold_italic.ttf`) must be placed in `composeResources/font/` (e.g. `core/common/src/commonMain/composeResources/font/`) so Compose Resources can load them via `Res.font...`.

### Web Integration
After copying `tokens.css` and `tokens.ts` to `web-platform-sdk`:
- `packages/feature-clientuser/src/index.css` (or main stylesheet) imports `./styles/tokens/tokens.css`.
- `tokens.css` defines HSL and Hex CSS variables (`--color-primary`, `--spacing-md`, `--radius-sm`, `--dimen-action-button-height`, `--font-family-primary`, etc.) used by Tailwind CSS and custom component styling.
- `tokens.ts` exports `GeneratedDesignTokens` object for typed usage in TypeScript components, inline styles, or utility functions.
- **Font Resources**: Web fonts (e.g. `@font-face` definitions or Google Fonts import for `PT Sans`) must be loaded in the main stylesheet (`index.css` or `globals.css`).

---

## 8. Concrete Example: Modifying Primary Color

1. Edit `tokens/colors.json`:
   ```json
   "primary": { "$value": "#123456", "$type": "color" }
   ```
2. Run generation:
   ```bash
   pnpm run generate
   ```
3. Manually copy the generated files from `generated/` to their respective target SDK repositories (`kmp-platform-sdk` and `web-platform-sdk`).
4. Results in SDK projects:
   - **`GeneratedDesignTokens.kt`** in KMP SDK updates to:
     ```kotlin
     val primary: Color = Color(0xFF123456)
     ```
   - **`tokens.css`** in Web SDK updates to:
     ```css
     --color-primary-hex: #123456;
     --color-primary: 210 65% 20%;
     ```
   - **`tokens.ts`** in Web SDK updates to:
     ```typescript
     primary: '#123456'
     ```
   - **`Color.kt`** in KMP automatically exposes the new color via `PrimaryLight` and `CoreLightColorScheme.primary`.
   - **Web components** automatically render using the new `--color-primary` CSS variable or TypeScript token value.

---

## 9. Design Tools & W3C Standard

The design token schema used in `tokens/` strictly adheres to the **W3C Design Tokens Format specification**. Because of this open standard, the token system is entirely platform- and editor-agnostic, not bound to any single design software.

The repository is fully compatible with any design tool or pipeline supporting W3C design tokens (such as **Penpot**, **Tokens Studio**, **Style Dictionary**, **Figma**, etc.) via bidirectional synchronization with the `tokens/` directory:

- **Design-to-Code Sync**: Token changes made in your design tool of choice can be exported or synced directly to the `tokens/` directory via Git synchronization or URL-based sync.
- **Artifact Generation**: Running `pnpm run generate` compiles the synchronized tokens into target Compose and Web artifacts in `generated/`.
- **SDK Distribution**: Generated files are manually distributed to their target SDK repositories (`kmp-platform-sdk` and `web-platform-sdk`).
