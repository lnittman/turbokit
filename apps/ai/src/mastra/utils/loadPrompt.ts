import { readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * Loads a prompt template from an XML file
 * @param relativePath The path relative to src/mastra
 * @param fallback A fallback template if the file can't be loaded
 * @param variables Optional variables for template substitution in paths
 * @returns The prompt template as a string
 */
export function loadPrompt(relativePath: string, fallback: string = '', variables: Record<string, string> = {}): string {
  try {
    // Try multiple possible locations for the XML file
    // 1. First check direct path from repo root
    let xmlPath = path.join(process.cwd(), 'src/mastra', relativePath);
    
    // 2. If not found, try relative to app directory (for Next.js app)
    if (!existsSync(xmlPath)) {
      xmlPath = path.join(process.cwd(), '../../src/mastra', relativePath);
    }
    
    // 3. Try from current directory (for direct invocation)
    if (!existsSync(xmlPath)) {
      // In environments where __dirname is not defined, we'll use process.cwd()
      const dirPath = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
      xmlPath = path.join(dirPath, '..', relativePath);
    }
    
    // 4. Go up a level if needed (for deeply nested imports)
    if (!existsSync(xmlPath)) {
      const dirPath = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
      xmlPath = path.join(dirPath, '../..', relativePath);
    }
    
    // If we still can't find it, log detailed info to help debug
    if (!existsSync(xmlPath)) {
      console.error(`[loadPrompt] XML file not found at any location: ${relativePath}`);
      console.error(`[loadPrompt] - Tried: ${process.cwd()}/src/mastra/${relativePath}`);
      console.error(`[loadPrompt] - Tried: ${process.cwd()}/../../src/mastra/${relativePath}`);
      const dirPath = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
      console.error(`[loadPrompt] - Tried: ${dirPath}/../${relativePath}`);
      console.error(`[loadPrompt] - Tried: ${dirPath}/../../${relativePath}`);
      return fallback;
    }
    
    let template = readFileSync(xmlPath, 'utf-8');
    console.log(`Loaded template from: ${xmlPath} (${template.length} chars)`);
    
    // Process includes - look for <include path="..." /> tags
    template = processIncludes(template, variables);
    
    return template;
  } catch (error) {
    console.error(`Failed to load ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

/**
 * Process include directives in XML templates
 * @param template The template potentially containing includes
 * @param variables Variables for template substitution in include paths
 * @returns The processed template with includes expanded
 */
function processIncludes(template: string, variables: Record<string, string> = {}): string {
  const includeRegex = /<include\s+path="([^"]+)"\s*\/>/g;
  
  return template.replace(includeRegex, (match, includePath) => {
    try {
      // Apply variable substitution to the include path
      const processedPath = applyPathVariables(includePath, variables);
      
      // Try multiple possible locations for the included file
      const possiblePaths = [
        path.join(process.cwd(), 'src/mastra', processedPath),
        path.join(process.cwd(), '../../src/mastra', processedPath),
      ];
      
      // Handle case where __dirname is not defined
      const dirPath = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
      possiblePaths.push(path.join(dirPath, '..', processedPath));
      possiblePaths.push(path.join(dirPath, '../..', processedPath));
      
      for (const p of possiblePaths) {
        if (existsSync(p)) {
          const includedContent = readFileSync(p, 'utf-8');
          console.log(`Included content from: ${p} (${includedContent.length} chars)`);
          
          // Extract just the content inside the root element (e.g., inside <tool_instructions>...</tool_instructions>)
          const contentMatch = includedContent.match(/<[^>]+>([\s\S]*)<\/[^>]+>/);
          if (contentMatch && contentMatch[1]) {
            return contentMatch[1].trim();
          }
          return includedContent;
        }
      }
      
      console.error(`[processIncludes] Included file not found: ${processedPath} (original: ${includePath})`);
      console.error(`[processIncludes] - Tried: ${possiblePaths.join('\n  - ')}`);
      return `<!-- Include failed: File not found: ${processedPath} -->`;
    } catch (error) {
      console.error(`Failed to process include for ${includePath}: ${error instanceof Error ? error.message : String(error)}`);
      return `<!-- Include failed: ${error instanceof Error ? error.message : String(error)} -->`;
    }
  });
}

/**
 * Apply variable substitution to a path string using {{variable}} syntax
 * @param pathString Path string with potential {{variable}} placeholders
 * @param variables Variables to substitute
 * @returns Processed path with variables replaced
 */
function applyPathVariables(pathString: string, variables: Record<string, string> = {}): string {
  let result = pathString;
  
  // Replace {{variable}} with the corresponding value
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, value);
  }
  
  return result;
}

/**
 * Fills a template with values from a context object
 * @param template The template string with {{placeholders}}
 * @param context An object with keys matching the placeholders
 * @returns The filled template
 */
export function fillTemplate(template: string, context: Record<string, any>): string {
  let result = template;
  for (const key in context) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    const value = context[key] !== undefined ? String(context[key]) : '';
    result = result.replace(placeholder, value);
  }
  return result;
} 