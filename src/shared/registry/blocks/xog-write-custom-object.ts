import { xogWritePreset } from '../presets'

export const xogWriteCustomObject = xogWritePreset(
  'xog-write-custom-object',
  'XOG Write Custom Object',
  '<!-- Example envelope: verify element names against your Clarity PPM XOG schema/version -->\n<NikuDataBus>\n  <Header version="7.0" externalSource="NIKU" action="write" objectType="customObject"/>\n  <CustomObjects>\n    <Instance objectCode="custom_object" instanceCode="INST0001"/>\n  </CustomObjects>\n</NikuDataBus>'
)
