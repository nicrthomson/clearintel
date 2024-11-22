import type { ReportTemplate } from "./types"
import type { CaseWithRelations } from "../db/types"

interface ProcessTemplateOptions {
  template: ReportTemplate
  variables: Record<string, any>
  case: CaseWithRelations
}

export function processTemplate({ template, variables, case: caseData }: ProcessTemplateOptions) {
  const processedSections = template.sections.map(section => {
    // Skip optional sections if conditions aren't met
    if (section.isOptional && section.conditions) {
      const shouldInclude = section.conditions.every(condition => {
        const value = variables[condition.field] || 
          (condition.field in caseData ? caseData[condition.field as keyof CaseWithRelations] : undefined)
        switch (condition.operator) {
          case 'equals':
            return value === condition.value
          case 'contains':
            return value?.includes(condition.value)
          case 'exists':
            return value != null
          case 'notExists':
            return value == null
          default:
            return true
        }
      })
      if (!shouldInclude) return null
    }

    // Process variables in content
    let content = section.content
    section.variables.forEach(variable => {
      const value = variables[variable.key] ?? variable.defaultValue
      content = content.replace(`{{${variable.key}}}`, value?.toString() ?? '')
    })

    return {
      title: section.title,
      content
    }
  }).filter(Boolean)

  return {
    header: template.metadata.headerTemplate?.replace(/{{.*?}}/g, match => {
      const key = match.slice(2, -2)
      return variables[key] ?? 
        (key in caseData ? caseData[key as keyof CaseWithRelations]?.toString() : '') ?? ''
    }),
    sections: processedSections
  }
}
