const splitText = (text: string): string[] => text.split('')

const reassign = (group: string[], position: number, newMember: string): string[] => {
  group.splice(0, 1)
  return [newMember, ...group]
}

export const capitalize = (text: string): string =>
  reassign(splitText(text), 0, splitText(text)[0].toUpperCase()).join('')

export const makeStringFromTemplate = (template: string, params: string[]) => {
  let result = template

  params.forEach((param, key) => {
    result = result.replace(`%${key + 1}`, param)
  })

  return result
}
