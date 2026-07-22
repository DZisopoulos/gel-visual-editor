import type { editor } from 'monaco-editor'

export type ThemeId =
  | 'auto'
  | 'gve-aurora'
  | 'gve-dark'
  | 'dracula'
  | 'github-light'
  | 'github-dark'
  | 'material'
  | 'nord'

export interface ThemeDefinition {
  id: ThemeId
  name: string
  appVars: Record<string, string>
  xmlVars: Record<string, string>
  monacoName: string
  monaco: editor.IStandaloneThemeData
}

const darkRules = (
  foreground: string,
  tag: string,
  attribute: string,
  stringColor: string,
  comment: string
): editor.ITokenThemeRule[] => [
  { token: 'tag', foreground: tag },
  { token: 'delimiter', foreground: tag },
  { token: 'attribute.name', foreground: attribute },
  { token: 'attribute.value', foreground: stringColor },
  { token: 'string', foreground: stringColor },
  { token: 'comment', foreground: comment },
  { token: 'text', foreground }
]

function monacoTheme(
  base: editor.IStandaloneThemeData['base'],
  colors: {
    background: string
    foreground: string
    border: string
    accent: string
    muted: string
    tag: string
    attribute: string
    stringColor: string
    comment: string
  }
): editor.IStandaloneThemeData {
  return {
    base,
    inherit: true,
    rules: darkRules(
      colors.foreground,
      colors.tag,
      colors.attribute,
      colors.stringColor,
      colors.comment
    ),
    colors: {
      'editor.background': colors.background,
      'editor.foreground': colors.foreground,
      'editorLineNumber.foreground': colors.muted,
      'editorLineNumber.activeForeground': colors.foreground,
      'editorCursor.foreground': colors.accent,
      'editor.selectionBackground': `${colors.accent}55`,
      'editor.lineHighlightBackground': `${colors.border}55`,
      'editorIndentGuide.background': colors.border,
      'editorIndentGuide.activeBackground': colors.accent,
      'editorWidget.background': colors.background,
      'editorWidget.border': colors.border,
      'scrollbarSlider.background': `${colors.border}aa`,
      'scrollbarSlider.hoverBackground': `${colors.muted}aa`
    }
  }
}

const themes: ThemeDefinition[] = [
  {
    id: 'gve-aurora',
    name: 'GVE Aurora',
    appVars: {
      '--bg': '#0B1020',
      '--panel': '#121A2E',
      '--panel-2': '#17233B',
      '--border': '#2D4164',
      '--accent': '#6EE7F5',
      '--warn': '#FBBF77',
      '--error': '#FB7185',
      '--ok': '#86EFAC',
      '--text': '#EDF7FF',
      '--text-muted': '#91A8C4'
    },
    xmlVars: {
      '--xml-bg': '#0A1020',
      '--xml-panel': '#121A2E',
      '--xml-panel-2': '#17233B',
      '--xml-border': '#2D4164',
      '--xml-accent': '#6EE7F5',
      '--xml-text': '#EDF7FF',
      '--xml-muted': '#91A8C4'
    },
    monacoName: 'gve-aurora-xml',
    monaco: monacoTheme('vs-dark', {
      background: '#0A1020',
      foreground: '#EDF7FF',
      border: '#2D4164',
      accent: '#6EE7F5',
      muted: '#91A8C4',
      tag: '#6EE7F5',
      attribute: '#C4B5FD',
      stringColor: '#FBBF77',
      comment: '#64748B'
    })
  },
  {
    id: 'gve-dark',
    name: 'GVE Dark',
    appVars: {
      '--bg': '#0F1218',
      '--panel': '#171C26',
      '--panel-2': '#131822',
      '--border': '#2A3140',
      '--accent': '#2DD4BF',
      '--warn': '#F5B84D',
      '--error': '#F26D6D',
      '--ok': '#4ADE80',
      '--text': '#E1E2EB',
      '--text-muted': '#8A93A6'
    },
    xmlVars: {
      '--xml-bg': '#0D1117',
      '--xml-panel': '#171C26',
      '--xml-panel-2': '#131822',
      '--xml-border': '#2A3140',
      '--xml-accent': '#2DD4BF',
      '--xml-text': '#E1E2EB',
      '--xml-muted': '#8A93A6'
    },
    monacoName: 'gve-dark-xml',
    monaco: monacoTheme('vs-dark', {
      background: '#0D1117',
      foreground: '#E1E2EB',
      border: '#2A3140',
      accent: '#2DD4BF',
      muted: '#8A93A6',
      tag: '#2DD4BF',
      attribute: '#C792EA',
      stringColor: '#F5B84D',
      comment: '#6B7280'
    })
  },
  {
    id: 'dracula',
    name: 'Dracula',
    appVars: {
      '--bg': '#282A36',
      '--panel': '#21222C',
      '--panel-2': '#191A21',
      '--border': '#44475A',
      '--accent': '#BD93F9',
      '--warn': '#FFB86C',
      '--error': '#FF5555',
      '--ok': '#50FA7B',
      '--text': '#F8F8F2',
      '--text-muted': '#A6A0C8'
    },
    xmlVars: {
      '--xml-bg': '#282A36',
      '--xml-panel': '#21222C',
      '--xml-panel-2': '#191A21',
      '--xml-border': '#44475A',
      '--xml-accent': '#BD93F9',
      '--xml-text': '#F8F8F2',
      '--xml-muted': '#A6A0C8'
    },
    monacoName: 'dracula-xml',
    monaco: monacoTheme('vs-dark', {
      background: '#282A36',
      foreground: '#F8F8F2',
      border: '#44475A',
      accent: '#BD93F9',
      muted: '#A6A0C8',
      tag: '#FF79C6',
      attribute: '#50FA7B',
      stringColor: '#F1FA8C',
      comment: '#6272A4'
    })
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    appVars: {
      '--bg': '#F6F8FA',
      '--panel': '#FFFFFF',
      '--panel-2': '#F6F8FA',
      '--border': '#D0D7DE',
      '--accent': '#0969DA',
      '--warn': '#9A6700',
      '--error': '#CF222E',
      '--ok': '#1A7F37',
      '--text': '#1F2328',
      '--text-muted': '#656D76'
    },
    xmlVars: {
      '--xml-bg': '#FFFFFF',
      '--xml-panel': '#F6F8FA',
      '--xml-panel-2': '#FFFFFF',
      '--xml-border': '#D0D7DE',
      '--xml-accent': '#0969DA',
      '--xml-text': '#1F2328',
      '--xml-muted': '#656D76'
    },
    monacoName: 'github-light-xml',
    monaco: monacoTheme('vs', {
      background: '#FFFFFF',
      foreground: '#1F2328',
      border: '#D0D7DE',
      accent: '#0969DA',
      muted: '#656D76',
      tag: '#8250DF',
      attribute: '#0550AE',
      stringColor: '#0A3069',
      comment: '#6E7781'
    })
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    appVars: {
      '--bg': '#0D1117',
      '--panel': '#161B22',
      '--panel-2': '#21262D',
      '--border': '#30363D',
      '--accent': '#58A6FF',
      '--warn': '#D29922',
      '--error': '#F85149',
      '--ok': '#3FB950',
      '--text': '#E6EDF3',
      '--text-muted': '#8B949E'
    },
    xmlVars: {
      '--xml-bg': '#0D1117',
      '--xml-panel': '#161B22',
      '--xml-panel-2': '#21262D',
      '--xml-border': '#30363D',
      '--xml-accent': '#58A6FF',
      '--xml-text': '#E6EDF3',
      '--xml-muted': '#8B949E'
    },
    monacoName: 'github-dark-xml',
    monaco: monacoTheme('vs-dark', {
      background: '#0D1117',
      foreground: '#E6EDF3',
      border: '#30363D',
      accent: '#58A6FF',
      muted: '#8B949E',
      tag: '#7EE787',
      attribute: '#79C0FF',
      stringColor: '#A5D6FF',
      comment: '#8B949E'
    })
  },
  {
    id: 'material',
    name: 'Material',
    appVars: {
      '--bg': '#121212',
      '--panel': '#1E1E1E',
      '--panel-2': '#2A2A2A',
      '--border': '#454545',
      '--accent': '#82AAFF',
      '--warn': '#FFCB6B',
      '--error': '#FF5370',
      '--ok': '#C3E88D',
      '--text': '#EEFFFF',
      '--text-muted': '#9E9E9E'
    },
    xmlVars: {
      '--xml-bg': '#121212',
      '--xml-panel': '#1E1E1E',
      '--xml-panel-2': '#2A2A2A',
      '--xml-border': '#454545',
      '--xml-accent': '#82AAFF',
      '--xml-text': '#EEFFFF',
      '--xml-muted': '#9E9E9E'
    },
    monacoName: 'material-xml',
    monaco: monacoTheme('vs-dark', {
      background: '#121212',
      foreground: '#EEFFFF',
      border: '#454545',
      accent: '#82AAFF',
      muted: '#9E9E9E',
      tag: '#F07178',
      attribute: '#C792EA',
      stringColor: '#C3E88D',
      comment: '#676E95'
    })
  },
  {
    id: 'nord',
    name: 'Nord',
    appVars: {
      '--bg': '#2E3440',
      '--panel': '#3B4252',
      '--panel-2': '#434C5E',
      '--border': '#4C566A',
      '--accent': '#88C0D0',
      '--warn': '#EBCB8B',
      '--error': '#BF616A',
      '--ok': '#A3BE8C',
      '--text': '#ECEFF4',
      '--text-muted': '#D8DEE9'
    },
    xmlVars: {
      '--xml-bg': '#2E3440',
      '--xml-panel': '#3B4252',
      '--xml-panel-2': '#434C5E',
      '--xml-border': '#4C566A',
      '--xml-accent': '#88C0D0',
      '--xml-text': '#ECEFF4',
      '--xml-muted': '#D8DEE9'
    },
    monacoName: 'nord-xml',
    monaco: monacoTheme('vs-dark', {
      background: '#2E3440',
      foreground: '#ECEFF4',
      border: '#4C566A',
      accent: '#88C0D0',
      muted: '#D8DEE9',
      tag: '#81A1C1',
      attribute: '#8FBCBB',
      stringColor: '#A3BE8C',
      comment: '#616E88'
    })
  }
]

export const THEME_OPTIONS: Array<{ id: ThemeId; name: string }> = [
  { id: 'auto', name: 'Auto (System)' },
  ...themes
]
export const THEME_STORAGE_KEY = 'gve-theme-preferences'

export interface ThemePreferences {
  app: ThemeId
  xml: ThemeId
}

export function getSystemThemeId(): Exclude<ThemeId, 'auto'> {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'gve-dark'
    : 'github-light'
}

export function getTheme(id: ThemeId): ThemeDefinition {
  return themes.find((theme) => theme.id === (id === 'auto' ? getSystemThemeId() : id)) ?? themes[0]
}

function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && themes.some((theme) => theme.id === value)
}

export function loadThemePreferences(): ThemePreferences {
  const fallback: ThemePreferences = { app: 'gve-aurora', xml: 'gve-aurora' }
  if (typeof window === 'undefined') return fallback
  try {
    const parsed = JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? '{}') as Record<
      string,
      unknown
    >
    return {
      app: isThemeId(parsed.app) ? parsed.app : fallback.app,
      xml: isThemeId(parsed.xml) ? parsed.xml : fallback.xml
    }
  } catch {
    return fallback
  }
}

export function saveThemePreferences(preferences: ThemePreferences): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    /* storage may be unavailable */
  }
}
