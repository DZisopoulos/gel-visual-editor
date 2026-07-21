/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type ToastTone = 'success' | 'info' | 'error'
interface ToastItem { id: number; message: string; tone: ToastTone }
interface ToastContextValue { push: (message: string, tone?: ToastTone) => void }
const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  return useContext(ToastContext) ?? { push: () => undefined }
}

export function ToastProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = useCallback((message: string, tone: ToastTone = 'info'): void => {
    const id = Date.now() + Math.random()
    setItems(current => [...current.slice(-2), { id, message, tone }])
    window.setTimeout(() => setItems(current => current.filter(item => item.id !== id)), 3200)
  }, [])
  const contextValue = useMemo(() => ({ push }), [push])
  return <ToastContext.Provider value={contextValue}>
    {children}
    <div className="gve-toast-region" aria-live="polite" aria-atomic="true">
      {items.map(item => <div className={`gve-toast gve-toast-${item.tone}`} role="status" key={item.id}><span aria-hidden="true">{item.tone === 'success' ? '✓' : item.tone === 'error' ? '!' : 'i'}</span>{item.message}</div>)}
    </div>
  </ToastContext.Provider>
}

export default ToastProvider
