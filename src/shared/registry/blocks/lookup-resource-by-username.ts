import { sqlPreset } from '../presets'

export const lookupResourceByUsername = sqlPreset(
  'lookup-resource-by-username',
  'Lookup Resource by Username',
  'resource',
  "-- Adjust column/table names to match your Clarity PPM schema version.\nSELECT id, unique_name, full_name, email\nFROM   srm_resources\nWHERE  user_name = '${username}'"
)
