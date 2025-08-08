/**
 * Process template variables in content
 * Replaces {{variable}} patterns with actual values from context
 */

export function processTemplateVariables(content: string, context: any): string {
  if (!content || typeof content !== 'string') return content;
  
  // Regular expression to match {{variable}} or {{object.property}} patterns
  const variablePattern = /\{\{([^}]+)\}\}/g;
  
  return content.replace(variablePattern, (match, variable) => {
    const trimmedVar = variable.trim();
    
    try {
      // Split the variable path (e.g., "product.images[0].url" -> ["product", "images[0]", "url"])
      const parts = trimmedVar.split('.');
      let value = context;
      
      for (const part of parts) {
        if (!value) return match; // Return original if value is null/undefined
        
        // Handle array access like "images[0]"
        const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
          const [, propName, index] = arrayMatch;
          value = value[propName]?.[parseInt(index)];
        } else {
          value = value[part];
        }
      }
      
      // Return the value or the original match if not found
      return value !== undefined && value !== null ? String(value) : match;
    } catch (error) {
      console.warn('Error processing template variable:', trimmedVar, error);
      return match;
    }
  });
}

/**
 * Process template variables in nested objects/arrays
 * Recursively processes all string values
 */
export function processTemplateVariablesDeep(obj: any, context: any): any {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return processTemplateVariables(obj, context);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => processTemplateVariablesDeep(item, context));
  }
  
  if (typeof obj === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = processTemplateVariablesDeep(value, context);
    }
    return processed;
  }
  
  return obj;
}

/**
 * Extract variables from template content
 * Returns an array of variable names found in the content
 */
export function extractTemplateVariables(content: string): string[] {
  if (!content || typeof content !== 'string') return [];
  
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variablePattern.exec(content)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
}