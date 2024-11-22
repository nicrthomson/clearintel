import type { ReportTemplate, ReportVariable } from "./types";

export function validateTemplate(template: ReportTemplate) {
  const errors: string[] = [];

  if (!template.name) {
    errors.push("Template must have a name");
  }

  if (!template.sections || !Array.isArray(template.sections)) {
    errors.push("Template must have sections array");
  }

  template.sections.forEach((section, index) => {
    if (!section.title) {
      errors.push(`Section ${index} must have a title`);
    }
    if (!section.content) {
      errors.push(`Section ${index} must have content`);
    }
    if (typeof section.order !== 'number') {
      errors.push(`Section ${index} must have a numeric order`);
    }
    if (!Array.isArray(section.variables)) {
      errors.push(`Section ${index} must have variables array`);
    }
  });

  if (template.type !== 'word' && template.type !== 'pdf') {
    errors.push("Template type must be 'word' or 'pdf'");
  }

  if (errors.length > 0) {
    throw new Error(`Template validation errors:\n${errors.join('\n')}`);
  }
}

export function validateVariables(
  template: ReportTemplate,
  variables: Record<string, any>
) {
  const errors: string[] = [];

  template.sections.forEach(section => {
    section.variables.forEach(variable => {
      if (variable.required && !variables[variable.key]) {
        errors.push(`Missing required variable: ${variable.key}`);
      }

      const value = variables[variable.key];
      if (value && variable.validation) {
        if (variable.validation.pattern) {
          const regex = new RegExp(variable.validation.pattern);
          if (!regex.test(value.toString())) {
            errors.push(`Invalid format for ${variable.key}`);
          }
        }

        if (typeof value === 'number') {
          if (variable.validation.min != null && value < variable.validation.min) {
            errors.push(`${variable.key} must be at least ${variable.validation.min}`);
          }
          if (variable.validation.max != null && value > variable.validation.max) {
            errors.push(`${variable.key} must be at most ${variable.validation.max}`);
          }
        }

        if (variable.validation.allowedValues && !variable.validation.allowedValues.includes(value)) {
          errors.push(`Invalid value for ${variable.key}`);
        }
      }
    });
  });

  if (errors.length > 0) {
    throw new Error(`Validation errors:\n${errors.join('\n')}`);
  }
}
