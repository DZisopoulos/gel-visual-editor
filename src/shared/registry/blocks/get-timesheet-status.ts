import { sqlPreset } from '../presets'

export const getTimesheetStatus = sqlPreset(
  'get-timesheet-status', 'Get Timesheet Status', 'timesheets',
  "-- Illustrative only: verify table/column names against your Clarity PPM\n-- version, since timesheet schema varies more than most core tables.\nSELECT id, status, start_date, end_date\nFROM   timesheets\nWHERE  resource_id = ${resourceId}\nORDER  BY start_date DESC"
)
