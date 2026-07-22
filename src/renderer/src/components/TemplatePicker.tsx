import { FLOW_TEMPLATES, type FlowTemplate } from '../../../shared/templates'
import { ModalShell } from './ModalShell'

interface TemplatePickerProps {
  open: boolean
  onClose: () => void
  onChoose: (template: FlowTemplate) => void
}

function TemplatePicker({
  open,
  onClose,
  onChoose
}: TemplatePickerProps): React.JSX.Element | null {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      className="gve-template-dialog"
      ariaLabel="Starter templates"
    >
      <div className="gve-template-header">
        <div>
          <span className="gve-validation-eyebrow">STARTER LIBRARY</span>
          <h2>Start from a template</h2>
          <p>Use a proven GEL shape and customize it for your flow.</p>
        </div>
        <button type="button" aria-label="Close templates" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="gve-template-grid">
        {FLOW_TEMPLATES.map((template) => (
          <button
            type="button"
            className="gve-template-card"
            key={template.id}
            onClick={() => onChoose(template)}
          >
            <span className="gve-template-glyph" aria-hidden="true">
              ✦
            </span>
            <span>
              <strong>{template.name}</strong>
              <small>{template.description}</small>
            </span>
            <span className="gve-template-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </ModalShell>
  )
}

export default TemplatePicker
