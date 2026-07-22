/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

type DialogKind = 'confirm' | 'alert' | 'prompt'
interface DialogRequest {
  kind: DialogKind
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  defaultValue?: string
  resolve: (value: boolean | string | null) => void
}

interface DialogContextValue {
  confirm: (
    title: string,
    message: string,
    options?: Pick<DialogRequest, 'confirmLabel' | 'cancelLabel'>
  ) => Promise<boolean>
  alert: (title: string, message: string) => Promise<void>
  prompt: (title: string, message: string, defaultValue?: string) => Promise<string | null>
}

const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialog(): DialogContextValue {
  return (
    useContext(DialogContext) ?? {
      confirm: async () => false,
      alert: async () => undefined,
      prompt: async () => null
    }
  )
}

export function DialogProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [request, setRequest] = useState<DialogRequest | null>(null)

  const finish = (value: boolean | string | null): void => {
    if (!request) return
    request.resolve(value)
    setRequest(null)
  }

  const enqueue = (next: Omit<DialogRequest, 'resolve'>): Promise<boolean | string | null> =>
    new Promise((resolve) => setRequest({ ...next, resolve }))

  const value: DialogContextValue = {
    confirm: async (title, message, options) =>
      Boolean(await enqueue({ kind: 'confirm', title, message, ...options })),
    alert: async (title, message) => {
      await enqueue({ kind: 'alert', title, message })
    },
    prompt: (title, message, defaultValue = '') =>
      enqueue({ kind: 'prompt', title, message, defaultValue }) as Promise<string | null>
  }

  return (
    <DialogContext.Provider value={value}>
      {children}
      {request && <DialogView request={request} onFinish={finish} />}
    </DialogContext.Provider>
  )
}

function DialogView({
  request,
  onFinish
}: {
  request: DialogRequest
  onFinish: (value: boolean | string | null) => void
}): React.JSX.Element {
  const [input, setInput] = useState(request.defaultValue ?? '')
  const isPrompt = request.kind === 'prompt'
  const isAlert = request.kind === 'alert'
  return (
    <div
      className="gve-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onFinish(isAlert ? true : isPrompt ? null : false)
      }}
    >
      <section
        className="gve-about-dialog gve-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gve-dialog-title"
        aria-describedby="gve-dialog-message"
      >
        <div className="gve-about-hero">
          <div className="gve-about-mark" aria-hidden="true">
            GVE
          </div>
          <div>
            <h2 id="gve-dialog-title">{request.title}</h2>
            <p>GEL Visual Editor</p>
          </div>
          <button
            type="button"
            className="gve-modal-close"
            aria-label="Close dialog"
            onClick={() => onFinish(isAlert ? true : isPrompt ? null : false)}
          >
            ×
          </button>
        </div>
        <div className="gve-about-body">
          <p id="gve-dialog-message">{request.message}</p>
          {isPrompt && (
            <input
              autoFocus
              className="gve-dialog-input"
              aria-label="Dialog value"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onFinish(input)
                if (event.key === 'Escape') onFinish(null)
              }}
            />
          )}
        </div>
        <div className="gve-about-actions">
          {!isAlert && (
            <button type="button" onClick={() => onFinish(isPrompt ? null : false)}>
              {request.cancelLabel ?? 'Cancel'}
            </button>
          )}
          <button
            type="button"
            autoFocus={!isPrompt}
            onClick={() => onFinish(isPrompt ? input : true)}
          >
            {isAlert ? 'Done' : isPrompt ? 'Save' : (request.confirmLabel ?? 'Confirm')}
          </button>
        </div>
      </section>
    </div>
  )
}

export default DialogProvider
