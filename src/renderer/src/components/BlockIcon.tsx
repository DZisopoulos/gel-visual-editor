import type { NodeDefinition } from '../../../shared/registry/types'

type IconKind = 'variable' | 'database' | 'loop' | 'log' | 'code' | 'branch' | 'case' | 'try' | 'comment' | 'mail' | 'sync' | 'soap' | 'http' | 'file' | 'ftp' | 'script'

const iconByType: Record<string, IconKind> = {
  'set-variable': 'variable', 'sql-query': 'database', 'for-each': 'loop', 'log-message': 'log', 'raw-gel': 'code',
  choose: 'branch', when: 'branch', otherwise: 'branch', switch: 'branch', case: 'case', default: 'case', try: 'try', catch: 'try', comment: 'comment',
  email: 'mail', 'xog-read': 'sync', 'xog-write': 'sync', 'soap-invoke': 'soap', 'http-call': 'http', 'file-read': 'file', 'file-write': 'file', 'ftp-transfer': 'ftp', 'include-script': 'script'
}

const paths: Record<IconKind, React.JSX.Element> = {
  variable: <><path d="M5 7h14M5 12h9M5 17h14" /><circle cx="16" cy="12" r="2" /></>,
  database: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 2 14 2 14 0V6M5 12v6c0 2 14 2 14 0v-6" /></>,
  loop: <><path d="M5 8a7 7 0 0 1 12-2l2 2M19 16a7 7 0 0 1-12 2l-2-2" /><path d="M19 4v4h-4M5 20v-4h4" /></>,
  log: <><path d="M5 5h14v14H5zM8 9h8M8 13h6M8 17h4" /></>,
  code: <><path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 4l-2 16" /></>,
  branch: <><path d="M6 5v5c0 2 2 3 6 3s6 1 6 3v3M6 13v3c0 2 2 3 6 3" /><circle cx="6" cy="5" r="2" /><circle cx="18" cy="19" r="2" /></>,
  case: <><path d="M6 5h12v14H6zM9 9h6M9 13h6" /></>,
  try: <><path d="M7 4h10v6c0 4-2 6-5 10-3-4-5-6-5-10z" /><path d="M9 12h6" /></>,
  comment: <><path d="M5 5h14v11H9l-4 3z" /><path d="M8 9h8M8 12h5" /></>,
  mail: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m5 8 7 5 7-5" /></>,
  sync: <><path d="M5 8a7 7 0 0 1 12-2l2 2M19 16a7 7 0 0 1-12 2l-2-2" /><path d="M19 4v4h-4M5 20v-4h4" /></>,
  soap: <><path d="M7 5h10v14H7zM10 3h4M10 9h4M10 13h4" /></>,
  http: <><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16" /></>,
  file: <><path d="M6 3h8l4 4v14H6zM14 3v5h5" /><path d="M9 13h6M9 17h6" /></>,
  ftp: <><path d="M5 7h14M5 12h14M5 17h14" /><path d="m8 5-3 2 3 2M16 15l3 2-3 2" /></>,
  script: <><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" /></>
}

export function BlockIcon({ type, definition, className = '' }: { type: string; definition?: NodeDefinition; className?: string }): React.JSX.Element {
  const kind = iconByType[type] ?? (definition?.category === 'integration' ? 'sync' : 'code')
  return <svg className={`gve-block-svg-icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">{paths[kind]}</svg>
}
