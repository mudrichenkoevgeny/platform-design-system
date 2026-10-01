import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TOKENS_DIR = path.resolve(__dirname, '../tokens')
const OUTPUT_DIR = path.resolve(__dirname, '../generated')

const KMP_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'compose/GeneratedDesignTokens.kt')
const WEB_CSS_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'web/tokens.css')
const WEB_TS_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'web/tokens.ts')

function loadTokens() {
  const files = fs.readdirSync(TOKENS_DIR).filter(f => f.endsWith('.json'))
  let combined = {}
  for (const file of files) {
    const content = fs.readFileSync(path.join(TOKENS_DIR, file), 'utf-8')
    const parsed = JSON.parse(content)
    delete parsed.$schema
    combined = mergeDeep(combined, parsed)
  }
  return combined
}

function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} })
      mergeDeep(target[key], source[key])
    } else {
      Object.assign(target, { [key]: source[key] })
    }
  }
  return target
}

function lookupToken(tokens, pathStr) {
  const parts = pathStr.split('.')
  let current = tokens
  for (const part of parts) {
    if (current && current[part] !== undefined) {
      current = current[part]
    } else {
      return null
    }
  }
  return current
}

function resolveTokenValue(tokens, node) {
  if (!node || typeof node !== 'object') return node
  if ('$value' in node) {
    const val = node.$value
    if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
      const refPath = val.slice(1, -1)
      const targetNode = lookupToken(tokens, refPath)
      return resolveTokenValue(tokens, targetNode)
    }
    return val
  }
  return node
}

function hexToHsl(hex) {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('')
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / delta) + (g < b ? 6 : 0)
        break
      case g:
        h = ((b - r) / delta) + 2
        break
      case b:
        h = ((r - g) / delta) + 4
        break
    }
    h /= 6
  }

  const hDeg = Math.round(h * 360)
  const sPct = Math.round(s * 100)
  const lPct = Math.round(l * 100)

  return `${hDeg} ${sPct}% ${lPct}%`
}

function generateKotlinTokens(tokens) {
  const lightPrimary = resolveTokenValue(tokens, tokens.color.semantic.light.primary)
  const lightOnPrimary = resolveTokenValue(tokens, tokens.color.semantic.light.onPrimary)
  const lightPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.light.primaryContainer)
  const lightOnPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.light.onPrimaryContainer)
  const lightBackground = resolveTokenValue(tokens, tokens.color.semantic.light.background)
  const lightOnBackground = resolveTokenValue(tokens, tokens.color.semantic.light.onBackground)
  const lightSurface = resolveTokenValue(tokens, tokens.color.semantic.light.surface)
  const lightOnSurface = resolveTokenValue(tokens, tokens.color.semantic.light.onSurface)
  const lightError = resolveTokenValue(tokens, tokens.color.semantic.light.error)

  const darkPrimary = resolveTokenValue(tokens, tokens.color.semantic.dark.primary)
  const darkOnPrimary = resolveTokenValue(tokens, tokens.color.semantic.dark.onPrimary)
  const darkPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.dark.primaryContainer)
  const darkOnPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.dark.onPrimaryContainer)
  const darkBackground = resolveTokenValue(tokens, tokens.color.semantic.dark.background)
  const darkOnBackground = resolveTokenValue(tokens, tokens.color.semantic.dark.onBackground)
  const darkSurface = resolveTokenValue(tokens, tokens.color.semantic.dark.surface)
  const darkOnSurface = resolveTokenValue(tokens, tokens.color.semantic.dark.onSurface)
  const darkError = resolveTokenValue(tokens, tokens.color.semantic.dark.error)

  const toColorHex = (hex) => `Color(0xFF${hex.replace('#', '').toUpperCase()})`

  return `package io.github.mudrichenkoevgeny.kmp.core.common.ui.theme.tokens

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

object GeneratedDesignTokens {
    object Colors {
        object Light {
            val primary: Color = ${toColorHex(lightPrimary)}
            val onPrimary: Color = ${toColorHex(lightOnPrimary)}
            val primaryContainer: Color = ${toColorHex(lightPrimaryContainer)}
            val onPrimaryContainer: Color = ${toColorHex(lightOnPrimaryContainer)}
            val background: Color = ${toColorHex(lightBackground)}
            val onBackground: Color = ${toColorHex(lightOnBackground)}
            val surface: Color = ${toColorHex(lightSurface)}
            val onSurface: Color = ${toColorHex(lightOnSurface)}
            val error: Color = ${toColorHex(lightError)}
        }

        object Dark {
            val primary: Color = ${toColorHex(darkPrimary)}
            val onPrimary: Color = ${toColorHex(darkOnPrimary)}
            val primaryContainer: Color = ${toColorHex(darkPrimaryContainer)}
            val onPrimaryContainer: Color = ${toColorHex(darkOnPrimaryContainer)}
            val background: Color = ${toColorHex(darkBackground)}
            val onBackground: Color = ${toColorHex(darkOnBackground)}
            val surface: Color = ${toColorHex(darkSurface)}
            val onSurface: Color = ${toColorHex(darkOnSurface)}
            val error: Color = ${toColorHex(darkError)}
        }
    }

    object Spacing {
        val extraSmall: Dp = ${tokens.spacing.extraSmall.$value}.dp
        val small: Dp = ${tokens.spacing.small.$value}.dp
        val medium: Dp = ${tokens.spacing.medium.$value}.dp
        val large: Dp = ${tokens.spacing.large.$value}.dp
    }

    object Radius {
        val extraSmall: Dp = ${tokens.radius.extraSmall.$value}.dp
        val small: Dp = ${tokens.radius.small.$value}.dp
        val medium: Dp = ${tokens.radius.medium.$value}.dp
        val large: Dp = ${tokens.radius.large.$value}.dp
        val extraLarge: Dp = ${tokens.radius.extraLarge.$value}.dp
    }

    object Sizing {
        val headerHeight: Dp = ${tokens.sizing.headerHeight.$value}.dp
        val iconSizeHeader: Dp = ${tokens.sizing.iconSizeHeader.$value}.dp
        val iconButtonSize: Dp = ${tokens.sizing.iconButtonSize.$value}.dp
        val actionButtonHeight: Dp = ${tokens.sizing.actionButtonHeight.$value}.dp
        val actionButtonIconSize: Dp = ${tokens.sizing.actionButtonIconSize.$value}.dp
        val rowHeight: Dp = ${tokens.sizing.rowHeight.$value}.dp
        val progressIndicatorStrokeWidth: Dp = ${tokens.sizing.progressIndicatorStrokeWidth.$value}.dp
        val progressIndicatorStrokeWidthSmall: Dp = ${tokens.sizing.progressIndicatorStrokeWidthSmall.$value}.dp
        val progressIndicatorSizeSmall: Dp = ${tokens.sizing.progressIndicatorSizeSmall.$value}.dp
        val progressIndicatorSizeLarge: Dp = ${tokens.sizing.progressIndicatorSizeLarge.$value}.dp
        val qrCodeSize: Dp = ${tokens.sizing.qrCodeSize.$value}.dp
        val previewContainerHeight: Dp = ${tokens.sizing.previewContainerHeight.$value}.dp
        val dialogWidth: Dp = ${tokens.sizing.dialogWidth.$value}.dp
        val dialogHeight: Dp = ${tokens.sizing.dialogHeight.$value}.dp
        val maxFormWidth: Dp = ${tokens.sizing.maxFormWidth.$value}.dp
        val maxContentWidth: Dp = ${tokens.sizing.maxContentWidth.$value}.dp
        val maxButtonWidth: Dp = ${tokens.sizing.maxButtonWidth.$value}.dp
        val navigationRailWidth: Dp = ${tokens.sizing.navigationRailWidth.$value}.dp
    }

    object Elevation {
        val header: Dp = ${tokens.elevation.header.$value}.dp
        val shadow: Dp = ${tokens.elevation.shadow.$value}.dp
    }

    object Typography {
        val fontFamilyPrimary: String = "${tokens.typography.fontFamily.primary.$value}"
        val fontWeightRegular: Int = ${tokens.typography.fontWeight.regular.$value}
        val fontWeightBold: Int = ${tokens.typography.fontWeight.bold.$value}
        val fontStyleNormal: String = "${tokens.typography.fontStyle.normal.$value}"
        val fontStyleItalic: String = "${tokens.typography.fontStyle.italic.$value}"
    }
}
`
}

function generateWebCssTokens(tokens) {
  const lightPrimary = resolveTokenValue(tokens, tokens.color.semantic.light.primary)
  const lightOnPrimary = resolveTokenValue(tokens, tokens.color.semantic.light.onPrimary)
  const lightPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.light.primaryContainer)
  const lightOnPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.light.onPrimaryContainer)
  const lightBackground = resolveTokenValue(tokens, tokens.color.semantic.light.background)
  const lightOnBackground = resolveTokenValue(tokens, tokens.color.semantic.light.onBackground)
  const lightSurface = resolveTokenValue(tokens, tokens.color.semantic.light.surface)
  const lightOnSurface = resolveTokenValue(tokens, tokens.color.semantic.light.onSurface)
  const lightError = resolveTokenValue(tokens, tokens.color.semantic.light.error)

  const darkPrimary = resolveTokenValue(tokens, tokens.color.semantic.dark.primary)
  const darkOnPrimary = resolveTokenValue(tokens, tokens.color.semantic.dark.onPrimary)
  const darkPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.dark.primaryContainer)
  const darkOnPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.dark.onPrimaryContainer)
  const darkBackground = resolveTokenValue(tokens, tokens.color.semantic.dark.background)
  const darkOnBackground = resolveTokenValue(tokens, tokens.color.semantic.dark.onBackground)
  const darkSurface = resolveTokenValue(tokens, tokens.color.semantic.dark.surface)
  const darkOnSurface = resolveTokenValue(tokens, tokens.color.semantic.dark.onSurface)
  const darkError = resolveTokenValue(tokens, tokens.color.semantic.dark.error)

  const dpToRem = (dpVal) => `${dpVal / 16}rem`
  const dpToPx = (dpVal) => `${dpVal}px`

  return `:root {
  --color-primary: ${hexToHsl(lightPrimary)};
  --color-primary-hex: ${lightPrimary};
  --color-on-primary: ${hexToHsl(lightOnPrimary)};
  --color-on-primary-hex: ${lightOnPrimary};
  --color-primary-container: ${hexToHsl(lightPrimaryContainer)};
  --color-primary-container-hex: ${lightPrimaryContainer};
  --color-on-primary-container: ${hexToHsl(lightOnPrimaryContainer)};
  --color-on-primary-container-hex: ${lightOnPrimaryContainer};
  --color-background: ${hexToHsl(lightBackground)};
  --color-background-hex: ${lightBackground};
  --color-on-background: ${hexToHsl(lightOnBackground)};
  --color-on-background-hex: ${lightOnBackground};
  --color-surface: ${hexToHsl(lightSurface)};
  --color-surface-hex: ${lightSurface};
  --color-on-surface: ${hexToHsl(lightOnSurface)};
  --color-on-surface-hex: ${lightOnSurface};
  --color-error: ${hexToHsl(lightError)};
  --color-error-hex: ${lightError};

  --background: var(--color-background);
  --foreground: var(--color-on-background);
  --primary: var(--color-primary);
  --primary-foreground: var(--color-on-primary);
  --secondary: var(--color-primary-container);
  --secondary-foreground: var(--color-on-primary-container);
  --card: 0 0% 100%;
  --card-foreground: var(--color-on-background);
  --popover: 0 0% 100%;
  --popover-foreground: var(--color-on-background);
  --muted: 0 0% 94%;
  --muted-foreground: 215 16% 47%;
  --accent: var(--color-primary-container);
  --accent-foreground: var(--color-on-primary-container);
  --destructive: var(--color-error);
  --destructive-foreground: 0 0% 100%;
  --border: 214 15% 82%;
  --input: 214 15% 82%;
  --ring: var(--color-primary);

  --spacing-xs: ${dpToRem(tokens.spacing.extraSmall.$value)};
  --spacing-sm: ${dpToRem(tokens.spacing.small.$value)};
  --spacing-md: ${dpToRem(tokens.spacing.medium.$value)};
  --spacing-lg: ${dpToRem(tokens.spacing.large.$value)};

  --radius-xs: ${dpToRem(tokens.radius.extraSmall.$value)};
  --radius-sm: ${dpToRem(tokens.radius.small.$value)};
  --radius-md: ${dpToRem(tokens.radius.medium.$value)};
  --radius-lg: ${dpToRem(tokens.radius.large.$value)};
  --radius-xl: ${dpToRem(tokens.radius.extraLarge.$value)};
  --radius: var(--radius-sm);

  --dimen-header-height: ${dpToRem(tokens.sizing.headerHeight.$value)};
  --dimen-icon-size-header: ${dpToRem(tokens.sizing.iconSizeHeader.$value)};
  --dimen-icon-button-size: ${dpToRem(tokens.sizing.iconButtonSize.$value)};
  --dimen-action-button-height: ${dpToRem(tokens.sizing.actionButtonHeight.$value)};
  --dimen-action-button-icon-size: ${dpToRem(tokens.sizing.actionButtonIconSize.$value)};
  --dimen-row-height: ${dpToRem(tokens.sizing.rowHeight.$value)};
  --dimen-dialog-width: ${dpToRem(tokens.sizing.dialogWidth.$value)};
  --dimen-dialog-height: ${dpToRem(tokens.sizing.dialogHeight.$value)};
  --dimen-max-form-width: ${dpToRem(tokens.sizing.maxFormWidth.$value)};
  --dimen-max-content-width: ${dpToRem(tokens.sizing.maxContentWidth.$value)};
  --dimen-max-button-width: ${dpToRem(tokens.sizing.maxButtonWidth.$value)};
  --dimen-navigation-rail-width: ${dpToRem(tokens.sizing.navigationRailWidth.$value)};

  --elevation-header: ${dpToPx(tokens.elevation.header.$value)};
  --elevation-shadow: ${dpToPx(tokens.elevation.shadow.$value)};

  --font-family-primary: '${tokens.typography.fontFamily.primary.$value}', sans-serif;
  --font-weight-regular: ${tokens.typography.fontWeight.regular.$value};
  --font-weight-bold: ${tokens.typography.fontWeight.bold.$value};
}

.dark {
  --color-primary: ${hexToHsl(darkPrimary)};
  --color-primary-hex: ${darkPrimary};
  --color-on-primary: ${hexToHsl(darkOnPrimary)};
  --color-on-primary-hex: ${darkOnPrimary};
  --color-primary-container: ${hexToHsl(darkPrimaryContainer)};
  --color-primary-container-hex: ${darkPrimaryContainer};
  --color-on-primary-container: ${hexToHsl(darkOnPrimaryContainer)};
  --color-on-primary-container-hex: ${darkOnPrimaryContainer};
  --color-background: ${hexToHsl(darkBackground)};
  --color-background-hex: ${darkBackground};
  --color-on-background: ${hexToHsl(darkOnBackground)};
  --color-on-background-hex: ${darkOnBackground};
  --color-surface: ${hexToHsl(darkSurface)};
  --color-surface-hex: ${darkSurface};
  --color-on-surface: ${hexToHsl(darkOnSurface)};
  --color-on-surface-hex: ${darkOnSurface};
  --color-error: ${hexToHsl(darkError)};
  --color-error-hex: ${darkError};

  --background: var(--color-background);
  --foreground: var(--color-on-background);
  --primary: var(--color-primary);
  --primary-foreground: var(--color-on-primary);
  --secondary: var(--color-primary-container);
  --secondary-foreground: var(--color-on-primary-container);
  --card: 120 5% 10%;
  --card-foreground: var(--color-on-background);
  --popover: 120 5% 10%;
  --popover-foreground: var(--color-on-background);
  --muted: 120 5% 15%;
  --muted-foreground: 215 20% 65%;
  --accent: var(--color-primary-container);
  --accent-foreground: var(--color-on-primary-container);
  --destructive: var(--color-error);
  --destructive-foreground: 0 0% 100%;
  --border: 213 11% 25%;
  --input: 213 11% 25%;
  --ring: var(--color-primary);
}
`
}

function generateWebTsTokens(tokens) {
  const lightPrimary = resolveTokenValue(tokens, tokens.color.semantic.light.primary)
  const lightOnPrimary = resolveTokenValue(tokens, tokens.color.semantic.light.onPrimary)
  const lightPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.light.primaryContainer)
  const lightOnPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.light.onPrimaryContainer)
  const lightBackground = resolveTokenValue(tokens, tokens.color.semantic.light.background)
  const lightOnBackground = resolveTokenValue(tokens, tokens.color.semantic.light.onBackground)
  const lightSurface = resolveTokenValue(tokens, tokens.color.semantic.light.surface)
  const lightOnSurface = resolveTokenValue(tokens, tokens.color.semantic.light.onSurface)
  const lightError = resolveTokenValue(tokens, tokens.color.semantic.light.error)

  const darkPrimary = resolveTokenValue(tokens, tokens.color.semantic.dark.primary)
  const darkOnPrimary = resolveTokenValue(tokens, tokens.color.semantic.dark.onPrimary)
  const darkPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.dark.primaryContainer)
  const darkOnPrimaryContainer = resolveTokenValue(tokens, tokens.color.semantic.dark.onPrimaryContainer)
  const darkBackground = resolveTokenValue(tokens, tokens.color.semantic.dark.background)
  const darkOnBackground = resolveTokenValue(tokens, tokens.color.semantic.dark.onBackground)
  const darkSurface = resolveTokenValue(tokens, tokens.color.semantic.dark.surface)
  const darkOnSurface = resolveTokenValue(tokens, tokens.color.semantic.dark.onSurface)
  const darkError = resolveTokenValue(tokens, tokens.color.semantic.dark.error)

  return `export const GeneratedDesignTokens = {
  colors: {
    light: {
      primary: '${lightPrimary}',
      onPrimary: '${lightOnPrimary}',
      primaryContainer: '${lightPrimaryContainer}',
      onPrimaryContainer: '${lightOnPrimaryContainer}',
      background: '${lightBackground}',
      onBackground: '${lightOnBackground}',
      surface: '${lightSurface}',
      onSurface: '${lightOnSurface}',
      error: '${lightError}'
    },
    dark: {
      primary: '${darkPrimary}',
      onPrimary: '${darkOnPrimary}',
      primaryContainer: '${darkPrimaryContainer}',
      onPrimaryContainer: '${darkOnPrimaryContainer}',
      background: '${darkBackground}',
      onBackground: '${darkOnBackground}',
      surface: '${darkSurface}',
      onSurface: '${darkOnSurface}',
      error: '${darkError}'
    }
  },
  spacing: {
    extraSmall: ${tokens.spacing.extraSmall.$value},
    small: ${tokens.spacing.small.$value},
    medium: ${tokens.spacing.medium.$value},
    large: ${tokens.spacing.large.$value}
  },
  radius: {
    extraSmall: ${tokens.radius.extraSmall.$value},
    small: ${tokens.radius.small.$value},
    medium: ${tokens.radius.medium.$value},
    large: ${tokens.radius.large.$value},
    extraLarge: ${tokens.radius.extraLarge.$value}
  },
  sizing: {
    headerHeight: ${tokens.sizing.headerHeight.$value},
    iconSizeHeader: ${tokens.sizing.iconSizeHeader.$value},
    iconButtonSize: ${tokens.sizing.iconButtonSize.$value},
    actionButtonHeight: ${tokens.sizing.actionButtonHeight.$value},
    actionButtonIconSize: ${tokens.sizing.actionButtonIconSize.$value},
    rowHeight: ${tokens.sizing.rowHeight.$value},
    dialogWidth: ${tokens.sizing.dialogWidth.$value},
    dialogHeight: ${tokens.sizing.dialogHeight.$value},
    maxFormWidth: ${tokens.sizing.maxFormWidth.$value},
    maxContentWidth: ${tokens.sizing.maxContentWidth.$value},
    maxButtonWidth: ${tokens.sizing.maxButtonWidth.$value},
    navigationRailWidth: ${tokens.sizing.navigationRailWidth.$value}
  },
  elevation: {
    header: ${tokens.elevation.header.$value},
    shadow: ${tokens.elevation.shadow.$value}
  },
  typography: {
    fontFamily: {
      primary: '${tokens.typography.fontFamily.primary.$value}'
    },
    fontWeight: {
      regular: ${tokens.typography.fontWeight.regular.$value},
      bold: ${tokens.typography.fontWeight.bold.$value}
    },
    fontStyle: {
      normal: '${tokens.typography.fontStyle.normal.$value}',
      italic: '${tokens.typography.fontStyle.italic.$value}'
    }
  }
} as const
`
}

function writeTargetFile(targetPath, content) {
  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, content, 'utf-8')
    return true
  } catch (error) {
    console.warn(`Skipping generation for target: ${targetPath}. Error: ${error.message}`)
    return false
  }
}

function run() {
  const tokens = loadTokens()

  const kotlinCode = generateKotlinTokens(tokens)
  if (writeTargetFile(KMP_OUTPUT_PATH, kotlinCode)) {
    console.log(`Generated Kotlin tokens at: ${KMP_OUTPUT_PATH}`)
  }

  const cssCode = generateWebCssTokens(tokens)
  if (writeTargetFile(WEB_CSS_OUTPUT_PATH, cssCode)) {
    console.log(`Generated Web CSS tokens at: ${WEB_CSS_OUTPUT_PATH}`)
  }

  const tsCode = generateWebTsTokens(tokens)
  if (writeTargetFile(WEB_TS_OUTPUT_PATH, tsCode)) {
    console.log(`Generated Web TS tokens at: ${WEB_TS_OUTPUT_PATH}`)
  }
}

run()