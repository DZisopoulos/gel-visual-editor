export type ViewId = 'flow' | 'xml' | 'validate'

export const VIEWS: { id: ViewId; label: string; menuLabel: string }[] = [
  { id: 'flow', label: 'Flow', menuLabel: 'Flow canvas' },
  { id: 'xml', label: 'XML Preview', menuLabel: 'XML preview' },
  { id: 'validate', label: 'Validate', menuLabel: 'Validate flow' }
]
