import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const ftpTransfer: NodeDefinition = {
  type: 'ftp-transfer', name: 'FTP Transfer', category: 'integration', color: '#60A5FA',
  namespaces: ['ftp'],
  fields: [
    { key: 'operation', label: 'Operation', kind: 'select', options: ['upload', 'download', 'delete'] },
    { key: 'host', label: 'Host', kind: 'text', required: true },
    { key: 'username', label: 'Username', kind: 'text' },
    { key: 'password', label: 'Password', kind: 'text' },
    { key: 'localPath', label: 'Local path', kind: 'text', required: true },
    { key: 'remotePath', label: 'Remote path', kind: 'text', required: true }
  ],
  introduces: () => [],
  toGel: block => [
    `<ftp:transfer operation="${escapeAttr(block.props.operation || 'upload')}" host="${escapeAttr(block.props.host || '')}" username="${escapeAttr(block.props.username || '')}" password="${escapeAttr(block.props.password || '')}" local="${escapeAttr(block.props.localPath || '')}" remote="${escapeAttr(block.props.remotePath || '')}"/>`
  ]
}
