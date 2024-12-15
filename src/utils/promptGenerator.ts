import { Tool } from '../types/agent';

export async function generateSystemPrompt(
  basePrompt: string,
  specialization: string,
  tools: Tool[]
): Promise<string> {
  const toolDescriptions = tools
    .map(tool => `- ${tool.name}: ${tool.description}`)
    .join('\n');

  return `${basePrompt}

Specialization: ${specialization}

Available Tools:
${toolDescriptions}

Instructions:
1. Analyze each task carefully before selecting tools
2. Use the most appropriate tool for each subtask
3. Validate inputs before using tools
4. Handle errors gracefully
5. Report results in a clear, structured format

Remember: Focus on ${specialization} related tasks and maintain high accuracy in your outputs.`;
}