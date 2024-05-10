export function replacePlaceholders(template: string, placeholders: any) {
    // Identify all placeholders that should be in the template
    const templatePlaceholders = (template.match(/{{\w+}}/g) || []).map(ph => ph.slice(2, -2));
  
    // Reduce the placeholders object to replace in the template and track used keys
    const result = Object.keys(placeholders).reduce((currentTemplate, key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      // Replace and return the updated template
      return currentTemplate.replace(regex, placeholders[key]);
    }, template);
  
    // Find any placeholders that are still in the template after attempting to replace
    const missingPlaceholders = (result.match(/{{\w+}}/g) || []).map(ph => ph.slice(2, -2));
  
    if (missingPlaceholders.length > 0) {
      throw new Error(`Missing values for placeholders: ${missingPlaceholders.join(', ')}`);
    }
  
    // Check for any keys in placeholders not used in the template
    const unusedPlaceholders = Object.keys(placeholders).filter(key => !templatePlaceholders.includes(key));
    if (unusedPlaceholders.length > 0) {
      console.warn(`Warning: Unused placeholders provided: ${unusedPlaceholders.join(', ')}`);
    }
  
    return result;
  }