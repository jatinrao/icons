import { definePlugin } from 'sanity'
import { iconRef } from './iconRef'

export const sanityIconPicker = definePlugin(() => ({
  name: 'sanity-icon-picker',
  schema: {
    types: [iconRef],
  },
}))

export { iconRef } from './iconRef'
export { IconPickerInput, matchesQuery } from './IconPickerInput'
