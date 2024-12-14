import { UniqueKeyValue } from './container'

const applyTemplate = (template: string, inputValue: string, templateValue: string): string =>
  inputValue.replace(new RegExp(`{{\\s*${template}\\s*}}`), templateValue)

const applyTemplatesOnInput = (input: UniqueKeyValue, templates: Record<string, string>) => {
  Object.entries(templates).forEach(entry => {
    const [template, templateValue] = entry
    if (!templateValue) {
      return
    }

    input.value = applyTemplate(template, input.value, templateValue)
  })
}

/**
 * @param inputs
 * @param templates JSON object of replacable property names with the actual values. Example: { 'imageName': 'alpine', 'imageTag': 'latest', 'label:debug': 'true' }
 */
export const applyUniqueKeyValueTemplate = (inputs: UniqueKeyValue[], templates: Record<string, string>) => {
  inputs.forEach(it => applyTemplatesOnInput(it, templates))
}

export const applyStringTemplate = (input: string, templates: Record<string, string>): string => {
  Object.entries(templates).forEach(entry => {
    const [template, templateValue] = entry
    if (!templateValue) {
      return
    }

    input = applyTemplate(template, input, templateValue)
  })

  return input
}
