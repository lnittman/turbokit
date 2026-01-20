export interface PromptVar {
  name: string;
  required: boolean;
}

export interface PromptTemplate<T extends Record<string, string>> {
  id: string;
  title: string;
  vars: PromptVar[];
  toXML: (vars: T) => string;
}

export function compileXML(template: string, vars: Record<string, string>, expectedVars: PromptVar[]): string {
  let output = template;

  // Validate required variables
  for (const v of expectedVars) {
    if (v.required && !vars[v.name]) {
      throw new Error(`Missing required variable: ${v.name}`);
    }
  }

  // Replace all {{varName}} placeholders
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    output = output.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }

  // Check for any remaining placeholders (missing values)
  const remaining = output.match(/\{\{[^}]+\}\}/g);
  if (remaining) {
    throw new Error(`Unresolved template variables: ${remaining.join(', ')}`);
  }

  return output;
}
