import { sqlPreset } from '../presets'

export const getProjectTasks = sqlPreset(
  'get-project-tasks', 'Get Project Tasks', 'tasks',
  "-- Adjust column/table names to match your Clarity PPM schema version.\nSELECT id, name, start_date, finish_date, percent_complete\nFROM   prtask\nWHERE  prprojectid = ${projectId}\nORDER  BY start_date"
)
