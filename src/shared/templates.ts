import type { Flow } from './flow'
import { createEmptyFlow } from './flow'
import { createBlock } from './registry'

export interface FlowTemplate {
  id: string
  name: string
  description: string
  create(): Flow
}

function starterFlow(name: string): Flow {
  return createEmptyFlow(name)
}

export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: 'query-loop-log',
    name: 'Query → loop → log',
    description: 'A practical starting point for processing query results.',
    create: () => {
      const flow = starterFlow('Query Results Processor')
      const query = createBlock('sql-query')
      query.props = {
        ...query.props,
        stepName: 'Load rows',
        datasource: 'Niku',
        sql: 'SELECT * FROM odf_ca_project',
        resultVar: 'rows'
      }
      const loop = createBlock('for-each')
      loop.props = {
        ...loop.props,
        stepName: 'Process each row',
        items: '${rows.rows}',
        varName: 'row'
      }
      const log = createBlock('log-message')
      log.props = { ...log.props, stepName: 'Log row', message: 'Processed ${row.id}' }
      loop.children = [log]
      flow.blocks = [query, loop]
      return flow
    }
  },
  {
    id: 'error-handling',
    name: 'Error handling',
    description: 'A try/catch shell for resilient process steps.',
    create: () => {
      const flow = starterFlow('Resilient Process Step')
      const attempt = createBlock('try')
      attempt.props.stepName = 'Attempt operation'
      const catchBlock = createBlock('catch')
      catchBlock.props.stepName = 'Handle failure'
      const log = createBlock('log-message')
      log.props = {
        ...log.props,
        stepName: 'Log failure',
        level: 'ERROR',
        message: 'The operation failed.'
      }
      catchBlock.children = [log]
      attempt.children = [catchBlock]
      flow.blocks = [attempt]
      return flow
    }
  },
  {
    id: 'http-notification',
    name: 'HTTP notification',
    description: 'Call an endpoint and record the response.',
    create: () => {
      const flow = starterFlow('HTTP Notification')
      const call = createBlock('http-call')
      call.props = {
        ...call.props,
        stepName: 'Notify service',
        method: 'POST',
        url: 'https://example.test/webhook',
        body: '{"event":"completed"}',
        resultVar: 'response'
      }
      const log = createBlock('log-message')
      log.props = { ...log.props, stepName: 'Record response', message: 'Notification sent.' }
      flow.blocks = [call, log]
      return flow
    }
  }
]
