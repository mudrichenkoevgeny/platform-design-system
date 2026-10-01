# Development & Contribution Guidelines

This document provides instructions for developers contributing to the **Platform Design System — Token Generator**.

---

## 1. Prerequisites

Before working on design tokens, ensure you have the following tools installed:

- **Node.js**: `v18.0.0` or higher
- **pnpm**: `v8.0.0` or higher (recommended)

---

## 2. Environment Setup

Clone the repository and install the required dependencies:

```bash
pnpm install
```

---

## 3. Token Generation Commands

### Run Token Generation
To parse all token definition files in `tokens/` and generate outputs for KMP and Web:

```bash
pnpm run generate
```

Fallback using Node.js directly:

```bash
node scripts/generate-tokens.js
```

---

## 4. Workflow for Adding or Modifying Tokens

Follow these steps when making changes to design tokens:

### Step 1: Edit Token Source Files
Edit or add tokens in the appropriate JSON file under `tokens/`:

- `tokens/colors.json`: Primitive palettes and Light/Dark semantic mappings.
- `tokens/spacing.json`: Spacing and padding dimensions.
- `tokens/radius.json`: Corner radii definitions.
- `tokens/sizing.json`: Component dimensions (buttons, headers, dialogs, etc.).
- `tokens/elevation.json`: Header and shadow elevations.
- `tokens/typography.json`: Font family, font weights (`regular: 400`, `bold: 700`), and font styles (`normal`, `italic`).

Ensure all token definitions adhere to the **W3C Design Tokens Format** schema (e.g., using `"$value"` and `"$type"`).

### Step 2: Regenerate Artifacts
Run the generation script:

```bash
pnpm run generate
```

This updates files in the local `generated/` directory:
- `generated/compose/GeneratedDesignTokens.kt`
- `generated/web/tokens.css`
- `generated/web/tokens.ts`

### Step 3: Verify Output Files
Inspect the generated files in `generated/` to ensure valid Kotlin syntax, CSS custom properties, and TypeScript objects were produced without errors.

### Step 4: Distribute to Target SDKs
Manually copy the generated artifacts to their respective target SDK repositories:

| Generated Local File | Target Repository & Path |
| :--- | :--- |
| `generated/compose/GeneratedDesignTokens.kt` | **`kmp-platform-sdk`**<br>`core/common/src/commonMain/kotlin/io/github/mudrichenkoevgeny/kmp/core/common/ui/theme/tokens/GeneratedDesignTokens.kt` |
| `generated/web/tokens.css` | **`web-platform-sdk`**<br>`packages/core-common/src/theme/tokens/tokens.css` |
| `generated/web/tokens.ts` | **`web-platform-sdk`**<br>`packages/core-common/src/theme/tokens/tokens.ts` |

---

## 5. Validation & Quality Assurance

- **JSON Validation**: Ensure all modified files in `tokens/` contain valid JSON.
- **Reference Integrity**: If a semantic token references a primitive token (e.g. `{color.primitive.charcoal.700}`), verify that the target primitive token exists.
- **Do Not Edit Generated Files Directly**: Never modify files inside `generated/` directly. All changes must originate from `tokens/*.json`.
