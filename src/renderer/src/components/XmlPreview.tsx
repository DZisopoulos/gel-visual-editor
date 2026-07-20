import { lazy, Suspense, useMemo, useState } from 'react'
import { generateGel } from '../../../shared/generate'
import { useGve } from '../store'

const MonacoEditor = lazy(() => import('./MonacoXmlEditor'))

function PlainPreview({ xml }: { xml: string }): React.JSX.Element {
  return <pre className="gve-xml mono">{xml}</pre>
}

function XmlPreview(): React.JSX.Element {
  const flow = useGve(s => s.flow)
  const xml = useMemo(() => generateGel(flow), [flow])
  const [open, setOpen] = useState(true)
  const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)

  return (
    <section
      className={`gve-xmlpane${open ? '' : ' gve-xmlpane-collapsed'}`}
      aria-label="XML preview"
    >
      <div className="gve-xml-toolbar">
        <span>XML Preview</span>
        <div className="gve-xml-actions">
          <button type="button" onClick={() => void navigator.clipboard?.writeText(xml)}>Copy</button>
          <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>
            {open ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      {open && (
        <div className="gve-xml-content">
          {isJsdom ? (
            <PlainPreview xml={xml} />
          ) : (
            <Suspense fallback={<PlainPreview xml={xml} />}>
              <MonacoEditor
                xml={xml}
              />
            </Suspense>
          )}
        </div>
      )}
    </section>
  )
}

export default XmlPreview
