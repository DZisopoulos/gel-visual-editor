import { lazy, Suspense, useMemo } from 'react'
import { generateGel } from '../../../shared/generate'
import { useGve } from '../store'
import { getTheme, type ThemeId } from '../theme'

const MonacoEditor = lazy(() => import('./MonacoXmlEditor'))

function PlainPreview({ xml }: { xml: string }): React.JSX.Element {
  return <pre className="gve-xml mono">{xml}</pre>
}

function XmlPreview({ theme = 'gve-dark' }: { theme?: ThemeId }): React.JSX.Element {
  const flow = useGve(s => s.flow)
  const xml = useMemo(() => generateGel(flow), [flow])
  const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)

  return (
    <section className="gve-xmlpane" aria-label="XML preview" data-xml-theme={theme} style={getTheme(theme).xmlVars as React.CSSProperties}>
      <div className="gve-xml-toolbar">
        <span>XML Preview</span>
        <div className="gve-xml-actions">
          <button type="button" onClick={() => void navigator.clipboard?.writeText(xml)}>Copy</button>
        </div>
      </div>
      <div className="gve-xml-content">
        {isJsdom ? (
          <PlainPreview xml={xml} />
        ) : (
          <Suspense fallback={<PlainPreview xml={xml} />}>
            <MonacoEditor xml={xml} theme={theme} />
          </Suspense>
        )}
      </div>
    </section>
  )
}

export default XmlPreview
