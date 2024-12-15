import { Tool } from '../types/agent';
import { toolDb } from '../db/database';

export async function selectOptimalTools(requiredCapabilities: string[]): Promise<Tool[]> {
  const allTools = await toolDb.getAllTools();
  
  // Filter tools based on required capabilities
  return allTools.filter(tool => 
    requiredCapabilities.some(capability => 
      tool.name.toLowerCase().includes(capability.toLowerCase()) ||
      tool.description.toLowerCase().includes(capability.toLowerCase())
    )
  );
}