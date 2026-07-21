import { xogWritePreset } from '../presets'

export const xogWriteResource = xogWritePreset(
  'xog-write-resource',
  'XOG Write Resource',
  '<!-- Example envelope: verify element names against your Clarity PPM XOG schema/version -->\n<NikuDataBus>\n  <Header version="7.0" externalSource="NIKU" action="write" objectType="resource"/>\n  <Resources>\n    <Resource resourceId="jdoe" fullName="Jane Doe"/>\n  </Resources>\n</NikuDataBus>'
)
