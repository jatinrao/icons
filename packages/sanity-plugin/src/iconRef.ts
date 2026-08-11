import { defineType } from 'sanity'
import { IconPickerInput } from './IconPickerInput'

export const iconRef = defineType({
  name: 'iconRef',
  title: 'Icon',
  type: 'string',
  components: {
    input: IconPickerInput,
  },
})
