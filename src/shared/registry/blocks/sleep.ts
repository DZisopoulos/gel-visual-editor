import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

// Built from the same invokeStatic/arg primitives as the generic blocks
// rather than a dedicated tag, since Thread.sleep is a plain static call.
export const sleep: NodeDefinition = {
  type: 'sleep',
  name: 'Sleep',
  category: 'clarity',
  color: '#2DD4BF',
  namespaces: ['core'],
  fields: [
    {
      key: 'millis',
      label: 'Milliseconds',
      kind: 'expression',
      required: true,
      placeholder: '5000'
    }
  ],
  introduces: () => [],
  toGel: (block) => [
    '<core:invokeStatic className="java.lang.Thread" method="sleep">',
    `  <core:arg type="long" value="${escapeAttr(block.props.millis)}"/>`,
    '</core:invokeStatic>'
  ]
}
