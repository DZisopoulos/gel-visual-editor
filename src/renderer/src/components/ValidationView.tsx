import { useEffect, useMemo, useState } from 'react'
import { validateFlow, type ValidationIssue } from '../../../shared/validate'
import { findBlock } from '../../../shared/tree'
import { useGve } from '../store'
import { useToast } from './Toast'

interface ValidationViewProps {
  onOpenFlow: () => void
}

function ValidationView({ onOpenFlow }: ValidationViewProps): React.JSX.Element {
  const flow = useGve((s) => s.flow)
  const select = useGve((s) => s.select)
  const { push } = useToast()
  const issues = useMemo(() => validateFlow(flow), [flow])
  const [validatedFlow, setValidatedFlow] = useState<typeof flow | null>(null)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setValidatedFlow(flow)
      const errorCount = validateFlow(flow).filter((issue) => issue.severity === 'error').length
      push(
        errorCount === 0
          ? 'Validation complete: flow is ready to export.'
          : `Validation complete: ${errorCount} error${errorCount === 1 ? '' : 's'} found.`,
        errorCount === 0 ? 'success' : 'error'
      )
    }, 180)
    return () => window.clearTimeout(timer)
  }, [flow, push])
  const isValidating = validatedFlow !== flow
  const counts = {
    error: issues.filter((issue) => issue.severity === 'error').length,
    warning: issues.filter((issue) => issue.severity === 'warning').length,
    info: issues.filter((issue) => issue.severity === 'info').length
  }
  const openIssue = (issue: ValidationIssue): void => {
    if (issue.blockId && findBlock(flow.blocks, issue.blockId)) {
      select(issue.blockId)
      onOpenFlow()
    }
  }

  return (
    <section className="gve-validation-view" aria-label="Validation view">
      <header className="gve-validation-header">
        <div>
          <span className="gve-validation-eyebrow">FLOW HEALTH</span>
          <h2>{issues.length === 0 ? 'Ready to export' : 'Review before export'}</h2>
        </div>
        <div className="gve-validation-summary" aria-label="Validation summary">
          <span className="gve-validation-pill gve-validation-error">
            <span className="gve-validation-pill-icon" aria-hidden="true">
              !
            </span>
            {counts.error} errors
          </span>
          <span className="gve-validation-pill gve-validation-warning">
            <span className="gve-validation-pill-icon" aria-hidden="true">
              △
            </span>
            {counts.warning} warnings
          </span>
          <span className="gve-validation-pill gve-validation-info">
            <span className="gve-validation-pill-icon" aria-hidden="true">
              i
            </span>
            {counts.info} notes
          </span>
        </div>
      </header>
      {isValidating ? (
        <div className="gve-validation-skeleton" aria-label="Validating flow" aria-busy="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : issues.length === 0 ? (
        <div className="gve-validation-empty">
          <span aria-hidden="true">✓</span>
          <h3>Everything looks good</h3>
          <p>Your flow has no detected validation issues.</p>
        </div>
      ) : (
        <div className="gve-validation-list">
          {issues.map((issue) => (
            <button
              type="button"
              className={`gve-validation-row gve-validation-${issue.severity}`}
              key={issue.id}
              onClick={() => openIssue(issue)}
            >
              <span className="gve-validation-icon" aria-hidden="true">
                {issue.severity === 'error' ? '!' : issue.severity === 'warning' ? '△' : 'i'}
              </span>
              <span className="gve-validation-copy">
                <strong>{issue.title}</strong>
                <small>{issue.message}</small>
              </span>
              {issue.blockId && <span className="gve-validation-link">Open block →</span>}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default ValidationView
