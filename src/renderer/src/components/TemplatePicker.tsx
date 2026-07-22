import { FLOW_TEMPLATES, type FlowTemplate } from '../../../shared/templates'

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
  if (!open) return null
  return (
    <div
      className="gve-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="gve-template-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Starter templates"
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
      </section>
    </div>
  )
}

export default TemplatePicker
