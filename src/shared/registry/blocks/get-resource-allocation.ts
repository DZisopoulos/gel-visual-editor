import { sqlPreset } from '../presets'

export const getResourceAllocation = sqlPreset(
  'get-resource-allocation',
  'Get Resource Allocation',
  'allocations',
  '-- Adjust column/table names to match your Clarity PPM schema version.\nSELECT prresourceid, prtaskid, allocation_pct\nFROM   prassignment\nWHERE  prresourceid = ${resourceId}'
)
