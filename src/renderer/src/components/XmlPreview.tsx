import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { generateGel } from '../../../shared/generate'
import { useGve } from '../store'
import { getSystemThemeId, getTheme, type ThemeId } from '../theme'
import { useToast } from './Toast'
/* eslint-disable react/no-unknown-property */

const MonacoEditor = lazy(() => import('./MonacoXmlEditor'))

function PlainPreview({ xml }: { xml: string }): React.JSX.Element {
  return <pre className="gve-xml mono">{xml}</pre>
}

function XmlPreview({ theme = 'gve-dark' }: { theme?: ThemeId }): React.JSX.Element {
  const flow = useGve((s) => s.flow)
  const xml = useMemo(() => generateGel(flow), [flow])
  const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)
  const [systemTheme, setSystemTheme] = useState(() => getSystemThemeId())
  const { push } = useToast()
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return
    const update = (): void => setSystemTheme(getSystemThemeId())
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])
  const resolvedTheme = theme === 'auto' ? systemTheme : theme
  const definition = getTheme(resolvedTheme)
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard?.writeText(xml)
      push('XML copied to clipboard.', 'success')
    } catch {
      push('Could not copy XML to the clipboard.', 'error')
    }
  }

  return (
    <section
      className="gve-xmlpane"
      aria-label="XML preview"
      data-xml-theme={theme}
      data-effective-xml-theme={resolvedTheme}
      style={definition.xmlVars as React.CSSProperties}
    >
      <div className="gve-xml-toolbar">
        <span>XML Preview</span>
        <div className="gve-xml-actions">
          <button type="button" onClick={() => void copy()}>
            Copy
          </button>
        </div>
      </div>
      <div className="gve-xml-content">
        {isJsdom ? (
          <PlainPreview xml={xml} />
        ) : (
          <Suspense fallback={<PlainPreview xml={xml} />}>
            <MonacoEditor xml={xml} theme={resolvedTheme} />
          </Suspense>
        )}
      </div>
    </section>
  )
}

export default XmlPreview
