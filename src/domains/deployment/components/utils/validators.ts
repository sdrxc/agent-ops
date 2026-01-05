export function validateAgentRegistry(data: any): string[] {
  const errors: string[] = [];
  if (!data.name || data.name.trim() === '') errors.push('Agent Name is required.');
  if (!data.description || data.description.trim() === '') errors.push('Description is required.');
  if (!data.version || data.version.trim() === '') errors.push('Version is required.');
  if (!data.url || data.url.trim() === '') errors.push('Base URL is required.');
  // Additional validations for version format, URLs, etc. can be added here.
  return errors;
}

export function validateProjectInfo(data: any): string[] {
  const errors: string[] = [];
  if (!data.projectName || data.projectName.trim() === '') errors.push('Project Name is required.');
  if (!data.description || data.description.trim() === '') errors.push('Project Description is required.');
  // Tags and memoryManagement optional - add validation if needed
  return errors;
}
