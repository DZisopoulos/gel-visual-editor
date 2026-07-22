/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'

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
  const [queue, setQueue] = useState<DialogRequest[]>([])
  const request = queue[0] ?? null

  const finish = (value: boolean | string | null): void => {
    setQueue((current) => {
      current[0]?.resolve(value)
      return current.slice(1)
    })
  }

  const enqueue = useCallback(
    (next: Omit<DialogRequest, 'resolve'>): Promise<boolean | string | null> =>
      new Promise((resolve) => setQueue((current) => [...current, { ...next, resolve }])),
    []
  )

  const confirm = useCallback(
    async (
      title: string,
      message: string,
      options?: Pick<DialogRequest, 'confirmLabel' | 'cancelLabel'>
    ) => Boolean(await enqueue({ kind: 'confirm', title, message, ...options })),
    [enqueue]
  )
  const alert = useCallback(
    async (title: string, message: string) => {
      await enqueue({ kind: 'alert', title, message })
    },
    [enqueue]
  )
  const prompt = useCallback(
    (title: string, message: string, defaultValue = '') =>
      enqueue({ kind: 'prompt', title, message, defaultValue }) as Promise<string | null>,
    [enqueue]
  )
  const value = useMemo<DialogContextValue>(
    () => ({ confirm, alert, prompt }),
    [confirm, alert, prompt]
  )

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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [input, setInput] = useState(request.defaultValue ?? '')
  const isPrompt = request.kind === 'prompt'
  const isAlert = request.kind === 'alert'

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const close = (value: boolean | string | null): void => {
    dialogRef.current?.close()
    onFinish(value)
  }

  return (
    <dialog
      ref={dialogRef}
      className="gve-about-dialog gve-confirm-dialog"
      aria-labelledby="gve-dialog-title"
      aria-describedby="gve-dialog-message"
      onCancel={(event) => {
        event.preventDefault()
        close(isAlert ? true : isPrompt ? null : false)
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) close(isAlert ? true : isPrompt ? null : false)
      }}
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
          onClick={() => close(isAlert ? true : isPrompt ? null : false)}
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
              // Escape is handled natively via the dialog's onCancel above.
              if (event.key === 'Enter') close(input)
            }}
          />
        )}
      </div>
      <div className="gve-about-actions">
        {!isAlert && (
          <button type="button" onClick={() => close(isPrompt ? null : false)}>
            {request.cancelLabel ?? 'Cancel'}
          </button>
        )}
        <button type="button" autoFocus={!isPrompt} onClick={() => close(isPrompt ? input : true)}>
          {isAlert ? 'Done' : isPrompt ? 'Save' : (request.confirmLabel ?? 'Confirm')}
        </button>
      </div>
    </dialog>
  )
}

export default DialogProvider
