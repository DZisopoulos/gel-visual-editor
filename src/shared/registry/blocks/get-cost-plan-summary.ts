import { sqlPreset } from '../presets'

export const getCostPlanSummary = sqlPreset(
  'get-cost-plan-summary', 'Get Cost Plan Summary', 'costPlan',
  "-- Illustrative only: financial table names vary by Clarity PPM version\n-- and by which Financial Management features are licensed.\nSELECT plan_of_record, total_cost, total_benefit\nFROM   fin_plan_detail\nWHERE  investment_id = ${projectId}"
)
