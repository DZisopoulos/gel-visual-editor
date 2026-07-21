import type { FlowParameter } from '../../../shared/flow'
import { getNodeDef } from '../../../shared/registry'
import type { FieldDef } from '../../../shared/registry/types'
import { findBlock } from '../../../shared/tree'
import { useGve } from '../store'

function fieldClass(field: FieldDef, value: string): string {
  const classes = ['gve-field-control']
  if (field.kind === 'sql' || field.kind === 'xml' || field.kind === 'expression')
    classes.push('mono')
  if (field.required && !value.trim()) classes.push('gve-field-missing')
  return classes.join(' ')
}

function Inspector({
  onResizeStart
}: {
  onResizeStart?: (event: React.PointerEvent) => void
}): React.JSX.Element {
  const flow = useGve((s) => s.flow)
  const selectedId = useGve((s) => s.selectedId)
  const updateProps = useGve((s) => s.updateProps)
  const updateMeta = useGve((s) => s.updateMeta)
  const updateParameters = useGve((s) => s.updateParameters)
  const selected = selectedId ? findBlock(flow.blocks, selectedId) : null

  const updateParameter = (index: number, patch: Partial<FlowParameter>): void => {
    updateParameters(
      flow.parameters.map((parameter, i) => (i === index ? { ...parameter, ...patch } : parameter))
    )
  }

  if (!selected) {
    return (
      <aside className="gve-inspector" aria-label="Inspector">
        <div
          className="gve-panel-resize gve-panel-resize-left"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize inspector"
          onPointerDown={(event) => onResizeStart?.(event)}
        />
        <div className="gve-panel-title">Flow settings</div>
        <div className="gve-inspector-body">
          <label className="gve-field">
            <span>Name</span>
            <div
              className="gve-field-control gve-content-editable"
              role="textbox"
              aria-label="Flow settings name"
              contentEditable
              suppressContentEditableWarning
              onBlur={(event) => updateMeta({ name: event.currentTarget.textContent ?? '' })}
            >
              {flow.meta.name}
            </div>
          </label>
          <label className="gve-field">
            <span>Description</span>
            <textarea
              value={flow.meta.description}
              onChange={(event) => updateMeta({ description: event.target.value })}
            />
          </label>
          <label className="gve-field">
            <span>Script type</span>
            <select
              value={flow.meta.scriptType}
              onChange={(event) =>
                updateMeta({ scriptType: event.target.value as 'process-step' | 'standalone' })
              }
            >
              <option value="process-step">Process step</option>
              <option value="standalone">Standalone</option>
            </select>
          </label>

          <div className="gve-parameters-head">
            <span>Parameters</span>
            <button
              type="button"
              onClick={() =>
                updateParameters([...flow.parameters, { name: '', type: 'string', default: '' }])
              }
            >
              Add parameter
            </button>
          </div>
          <div className="gve-parameters">
            {flow.parameters.map((parameter, index) => (
              <div className="gve-parameter-row" key={index}>
                <input
                  aria-label={`Parameter ${index + 1} name`}
                  placeholder="Name"
                  value={parameter.name}
                  onChange={(event) => updateParameter(index, { name: event.target.value })}
                />
                <select
                  aria-label={`Parameter ${index + 1} type`}
                  value={parameter.type}
                  onChange={(event) =>
                    updateParameter(index, { type: event.target.value as FlowParameter['type'] })
                  }
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
                <input
                  aria-label={`Parameter ${index + 1} default`}
                  placeholder="Default"
                  value={parameter.default}
                  onChange={(event) => updateParameter(index, { default: event.target.value })}
                />
                <button
                  type="button"
                  aria-label={`Remove parameter ${index + 1}`}
                  onClick={() => updateParameters(flow.parameters.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  const def = getNodeDef(selected.type)
  return (
    <aside className="gve-inspector" aria-label="Inspector">
      <div
        className="gve-panel-resize gve-panel-resize-left"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize inspector"
        onPointerDown={(event) => onResizeStart?.(event)}
      />
      <div className="gve-panel-title">{def.name}</div>
      <div className="gve-inspector-body">
        <label className="gve-field">
          <span>Step name</span>
          <input
            value={selected.props.stepName}
            onChange={(event) => updateProps(selected.id, { stepName: event.target.value })}
          />
        </label>
        {def.fields.map((field) => {
          const value = selected.props[field.key] ?? ''
          const className = fieldClass(field, value)
          return (
            <label className="gve-field" key={field.key}>
              <span>{field.label}</span>
              {field.kind === 'select' ? (
                <select
                  className={className}
                  value={value}
                  onChange={(event) =>
                    updateProps(selected.id, { [field.key]: event.target.value })
                  }
                >
                  {field.options?.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.kind === 'textarea' || field.kind === 'sql' || field.kind === 'xml' ? (
                <textarea
                  className={className}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) =>
                    updateProps(selected.id, { [field.key]: event.target.value })
                  }
                />
              ) : (
                <input
                  className={className}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) =>
                    updateProps(selected.id, { [field.key]: event.target.value })
                  }
                />
              )}
            </label>
          )
        })}
      </div>
    </aside>
  )
}

export default Inspector
