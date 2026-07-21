import { useMemo } from 'react'
import { validateFlow, type ValidationIssue } from '../../../shared/validate'
import { findBlock } from '../../../shared/tree'
import { useGve } from '../store'

interface ValidationViewProps { onOpenFlow: () => void }

function ValidationView({ onOpenFlow }: ValidationViewProps): React.JSX.Element {
  const flow = useGve(s => s.flow)
  const select = useGve(s => s.select)
  const issues = useMemo(() => validateFlow(flow), [flow])
  const counts = { error: issues.filter(issue => issue.severity === 'error').length, warning: issues.filter(issue => issue.severity === 'warning').length, info: issues.filter(issue => issue.severity === 'info').length }
  const openIssue = (issue: ValidationIssue): void => {
    if (issue.blockId && findBlock(flow.blocks, issue.blockId)) { select(issue.blockId); onOpenFlow() }
  }

  return (
    <section className="gve-validation-view" aria-label="Validation view">
      <header className="gve-validation-header">
        <div><span className="gve-validation-eyebrow">FLOW HEALTH</span><h2>{issues.length === 0 ? 'Ready to export' : 'Review before export'}</h2></div>
        <div className="gve-validation-summary">
          <span className="gve-validation-pill gve-validation-error">{counts.error} errors</span>
          <span className="gve-validation-pill gve-validation-warning">{counts.warning} warnings</span>
          <span className="gve-validation-pill gve-validation-info">{counts.info} notes</span>
        </div>
      </header>
      {issues.length === 0 ? <div className="gve-validation-empty"><span aria-hidden="true">✓</span><h3>Everything looks good</h3><p>Your flow has no detected validation issues.</p></div> : (
        <div className="gve-validation-list">
          {issues.map(issue => <button type="button" className={`gve-validation-row gve-validation-${issue.severity}`} key={issue.id} onClick={() => openIssue(issue)}>
            <span className="gve-validation-icon" aria-hidden="true">{issue.severity === 'error' ? '!' : issue.severity === 'warning' ? '△' : 'i'}</span>
            <span className="gve-validation-copy"><strong>{issue.title}</strong><small>{issue.message}</small></span>
            {issue.blockId && <span className="gve-validation-link">Open block →</span>}
          </button>)}
        </div>
      )}
    </section>
  )
}

export default ValidationView
