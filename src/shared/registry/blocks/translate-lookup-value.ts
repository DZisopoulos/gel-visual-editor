import { sqlPreset } from '../presets'

export const translateLookupValue = sqlPreset(
  'translate-lookup-value',
  'Translate Lookup Value',
  'lookupLabel',
  "SELECT lookup_code, description\nFROM   cmn_lookups_v\nWHERE  lookup_type = '${lookupType}'\nAND    language_code = 'en'"
)
