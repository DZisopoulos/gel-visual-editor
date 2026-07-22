import { sqlPreset } from '../presets'

export const lookupProjectByCode = sqlPreset(
  'lookup-project-by-code',
  'Lookup Project by Code',
  'project',
  "-- Adjust column/table names to match your Clarity PPM schema version.\nSELECT id, code, name, budget_cost, actual_cost\nFROM   inv_investments\nWHERE  code = '${projectCode}'\nAND    investment_type = 'project'"
)
