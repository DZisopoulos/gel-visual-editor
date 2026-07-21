import { xogWritePreset } from '../presets'

export const xogWriteProject = xogWritePreset(
  'xog-write-project',
  'XOG Write Project',
  '<NikuDataBus>\n  <Header version="7.0" externalSource="NIKU" action="write" objectType="project"/>\n  <Projects>\n    <Project code="PROJ0001" name="Sample Project"/>\n  </Projects>\n</NikuDataBus>'
)
