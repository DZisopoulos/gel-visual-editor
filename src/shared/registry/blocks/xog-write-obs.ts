import { xogWritePreset } from '../presets'

export const xogWriteObs = xogWritePreset(
  'xog-write-obs',
  'XOG Write OBS',
  '<!-- Example envelope: verify element names against your Clarity PPM XOG schema/version -->\n<NikuDataBus>\n  <Header version="7.0" externalSource="NIKU" action="write" objectType="obs"/>\n  <OBS>\n    <Unit code="DEPT_FIN" name="Finance"/>\n  </OBS>\n</NikuDataBus>'
)
