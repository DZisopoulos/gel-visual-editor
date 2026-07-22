import type { Block, Flow, FlowParameter } from '../../../shared/flow'
import { newId } from '../../../shared/flow'
import { getNodeDef } from '../../../shared/registry'
import type { FieldDef } from '../../../shared/registry/types'
import { findBlock } from '../../../shared/tree'
import { useGve, type GveState } from '../store'
import { variablesInScope } from '../../../shared/validate'

function fieldClass(field: FieldDef, value: string): string {
  const classes = ['gve-field-control']
  if (field.kind === 'sql' || field.kind === 'xml' || field.kind === 'expression')
    classes.push('mono')
  if (field.required && !value.trim()) classes.push('gve-field-missing')
  return classes.join(' ')
}

function FlowSettingsFields({
  flow,
  updateMeta,
  updateDatasources,
  updateParameters
}: {
  flow: Flow
  updateMeta: GveState['updateMeta']
  updateDatasources: GveState['updateDatasources']
  updateParameters: GveState['updateParameters']
}): React.JSX.Element {
  const updateParameter = (id: string, patch: Partial<FlowParameter>): void => {
    updateParameters(
      flow.parameters.map((parameter) =>
        parameter.id === id ? { ...parameter, ...patch } : parameter
      ),
      `parameter:${id}:${Object.keys(patch).join(',')}`
    )
  }

  return (
    <>
      <div className="gve-panel-title">Flow settings</div>
      <div className="gve-inspector-body">
        <label className="gve-field">
          <span>Name</span>
          <input
            className="gve-field-control"
            aria-label="Flow settings name"
            value={flow.meta.name}
            onChange={(event) => updateMeta({ name: event.target.value })}
          />
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
          <span className="gve-field-hint">
            {flow.meta.scriptType === 'standalone'
              ? 'Declares its own datasources and parameters.'
              : 'Clarity supplies the datasource and parameter values.'}
          </span>
        </label>

        <div className="gve-parameters-head">
          <span>Datasources</span>
          <button
            type="button"
            onClick={() => updateDatasources([...flow.datasources, { id: newId(), value: '' }])}
          >
            Add datasource
          </button>
        </div>
        <div className="gve-parameters">
          {flow.datasources.map((datasource, index) => (
            <div className="gve-datasource-row" key={datasource.id}>
              <input
                aria-label={`Datasource ${index + 1}`}
                placeholder="Niku"
                value={datasource.value}
                onChange={(event) =>
                  updateDatasources(
                    flow.datasources.map((entry) =>
                      entry.id === datasource.id ? { ...entry, value: event.target.value } : entry
                    ),
                    `datasource:${datasource.id}`
                  )
                }
              />
              <button
                type="button"
                aria-label={`Remove datasource ${index + 1}`}
                onClick={() =>
                  updateDatasources(flow.datasources.filter((entry) => entry.id !== datasource.id))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="gve-parameters-head">
          <span>Parameters</span>
          <button
            type="button"
            onClick={() =>
              updateParameters([
                ...flow.parameters,
                { id: newId(), name: '', type: 'string', default: '' }
              ])
            }
          >
            Add parameter
          </button>
        </div>
        <div className="gve-parameters">
          {flow.parameters.map((parameter, index) => (
            <div className="gve-parameter-row" key={parameter.id}>
              <input
                aria-label={`Parameter ${index + 1} name`}
                placeholder="Name"
                value={parameter.name}
                onChange={(event) => updateParameter(parameter.id, { name: event.target.value })}
              />
              <select
                aria-label={`Parameter ${index + 1} type`}
                value={parameter.type}
                onChange={(event) =>
                  updateParameter(parameter.id, {
                    type: event.target.value as FlowParameter['type']
                  })
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
                onChange={(event) => updateParameter(parameter.id, { default: event.target.value })}
              />
              <button
                type="button"
                aria-label={`Remove parameter ${index + 1}`}
                onClick={() =>
                  updateParameters(flow.parameters.filter((entry) => entry.id !== parameter.id))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function SelectedBlockFields({
  selected,
  flow,
  updateProps
}: {
  selected: Block
  flow: Flow
  updateProps: GveState['updateProps']
}): React.JSX.Element {
  const def = getNodeDef(selected.type)
  const variables = variablesInScope(flow, selected.id)

  return (
    <>
      <div className="gve-panel-title">{def.name}</div>
      <div className="gve-inspector-body">
        <label className="gve-field">
          <span>Step name</span>
          <input
            value={selected.props.stepName}
            onChange={(event) => updateProps(selected.id, { stepName: event.target.value })}
          />
        </label>
        <div className="gve-scope-panel">
          <div className="gve-scope-title">Variables in scope</div>
          {variables.length === 0 ? (
            <span className="gve-scope-empty">No variables introduced yet</span>
          ) : (
            <div className="gve-scope-chips">
              {variables.map((variable) => (
                <span className="gve-scope-chip mono" key={variable}>
                  {variable}
                </span>
              ))}
            </div>
          )}
        </div>
        {def.fields.map((field) => {
          const value = selected.props[field.key] ?? ''
          const className = fieldClass(field, value)
          return (
            <label className="gve-field" key={field.key}>
              <span>{field.label}</span>
              {field.kind === 'datasource' ? (
                // Options come from the flow, plus whatever the block already
                // holds so a value from an imported flow is never silently lost.
                <select
                  className={className}
                  value={value}
                  onChange={(event) =>
                    updateProps(selected.id, { [field.key]: event.target.value })
                  }
                >
                  <option value="">Select a datasource…</option>
                  {[...new Set([...flow.datasources.map((d) => d.value), value])]
                    .filter(Boolean)
                    .map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                </select>
              ) : field.kind === 'select' ? (
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
    </>
  )
}

function Inspector({
  onResizeStart,
  onResizeKey,
  compact = false,
  collapsed = false,
  onToggleCollapsed
}: {
  onResizeStart?: (event: React.PointerEvent) => void
  onResizeKey?: (delta: number) => void
  compact?: boolean
  collapsed?: boolean
  onToggleCollapsed?: () => void
}): React.JSX.Element {
  const flow = useGve((s) => s.flow)
  const selectedId = useGve((s) => s.selectedId)
  const updateProps = useGve((s) => s.updateProps)
  const updateMeta = useGve((s) => s.updateMeta)
  const updateParameters = useGve((s) => s.updateParameters)
  const updateDatasources = useGve((s) => s.updateDatasources)
  const selected = selectedId ? findBlock(flow.blocks, selectedId) : null

  return (
    <aside className={`gve-inspector${collapsed ? ' gve-panel-rail' : ''}`} aria-label="Inspector">
      {compact && (
        <button
          type="button"
          className="gve-panel-rail-toggle"
          aria-label={collapsed ? 'Expand inspector' : 'Collapse inspector'}
          title={collapsed ? 'Expand inspector' : 'Collapse inspector'}
          onClick={onToggleCollapsed}
        >
          {collapsed ? '‹' : '›'}
        </button>
      )}
      <div
        className="gve-panel-resize gve-panel-resize-left"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize inspector"
        tabIndex={0}
        onPointerDown={(event) => onResizeStart?.(event)}
        onKeyDown={(event) => {
          const STEP = 16
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            onResizeKey?.(-STEP)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            onResizeKey?.(STEP)
          }
        }}
      />
      {selected ? (
        <SelectedBlockFields selected={selected} flow={flow} updateProps={updateProps} />
      ) : (
        <FlowSettingsFields
          flow={flow}
          updateMeta={updateMeta}
          updateDatasources={updateDatasources}
          updateParameters={updateParameters}
        />
      )}
    </aside>
  )
}

export default Inspector
