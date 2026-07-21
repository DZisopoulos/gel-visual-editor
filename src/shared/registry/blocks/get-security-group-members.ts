import { sqlPreset } from '../presets'

export const getSecurityGroupMembers = sqlPreset(
  'get-security-group-members', 'Get Security Group Members', 'groupMembers',
  "-- Adjust join/table names to match your Clarity PPM schema version.\nSELECT r.unique_name, r.full_name\nFROM   srm_resources r\nJOIN   cmn_sec_group_members m ON m.user_id = r.id\nWHERE  m.group_id = ${groupId}"
)
