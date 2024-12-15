import { db } from './schema';
import { Agent, Tool, Connection } from '../types/agent';

export const agentDb = {
  createAgent: (agent: Agent) => {
    const stmt = db.prepare(`
      INSERT INTO agents (
        id, name, description, model, systemPrompt, context,
        temperature, maxTokens, role, capabilities, parentId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const toolStmt = db.prepare(`
      INSERT INTO tools (id, agentId, name, description, parameters)
      VALUES (?, ?, ?, ?, ?)
    `);

    const connectionStmt = db.prepare(`
      INSERT INTO connections (id, agentId, type, name, config)
      VALUES (?, ?, ?, ?, ?)
    `);

    const relationshipStmt = db.prepare(`
      INSERT INTO agent_relationships (parentId, childId)
      VALUES (?, ?)
    `);

    db.transaction(() => {
      stmt.run(
        agent.id,
        agent.name,
        agent.description,
        agent.model,
        agent.systemPrompt,
        agent.context,
        agent.temperature,
        agent.maxTokens,
        agent.role,
        JSON.stringify(agent.capabilities),
        agent.parentId || null
      );

      agent.tools.forEach(tool => {
        toolStmt.run(
          tool.id,
          agent.id,
          tool.name,
          tool.description,
          JSON.stringify(tool.parameters)
        );
      });

      agent.connections.forEach(conn => {
        connectionStmt.run(
          conn.id,
          agent.id,
          conn.type,
          conn.name,
          JSON.stringify(conn.config)
        );
      });

      agent.subAgents.forEach(subAgentId => {
        relationshipStmt.run(agent.id, subAgentId);
      });
    })();

    return agent;
  },

  updateAgent: (agent: Agent) => {
    const stmt = db.prepare(`
      UPDATE agents SET
        name = ?, description = ?, model = ?, systemPrompt = ?,
        context = ?, temperature = ?, maxTokens = ?, role = ?,
        capabilities = ?, parentId = ?
      WHERE id = ?
    `);

    db.transaction(() => {
      stmt.run(
        agent.name,
        agent.description,
        agent.model,
        agent.systemPrompt,
        agent.context,
        agent.temperature,
        agent.maxTokens,
        agent.role,
        JSON.stringify(agent.capabilities),
        agent.parentId || null,
        agent.id
      );

      // Update relationships
      db.prepare('DELETE FROM agent_relationships WHERE parentId = ?').run(agent.id);
      const relationshipStmt = db.prepare(
        'INSERT INTO agent_relationships (parentId, childId) VALUES (?, ?)'
      );
      agent.subAgents.forEach(subAgentId => {
        relationshipStmt.run(agent.id, subAgentId);
      });
    })();

    return agent;
  },

  deleteAgent: (id: string) => {
    const stmt = db.prepare('DELETE FROM agents WHERE id = ?');
    stmt.run(id);
  },

  getAllAgents: (): Agent[] => {
    const agents = db.prepare(`
      SELECT a.*, GROUP_CONCAT(ar.childId) as subAgentIds
      FROM agents a
      LEFT JOIN agent_relationships ar ON a.id = ar.parentId
      GROUP BY a.id
    `).all();

    return agents.map(row => ({
      ...row,
      capabilities: JSON.parse(row.capabilities),
      subAgents: row.subAgentIds ? row.subAgentIds.split(',') : [],
      tools: db.prepare('SELECT * FROM tools WHERE agentId = ?')
        .all(row.id)
        .map(tool => ({
          ...tool,
          parameters: JSON.parse(tool.parameters)
        })),
      connections: db.prepare('SELECT * FROM connections WHERE agentId = ?')
        .all(row.id)
        .map(conn => ({
          ...conn,
          config: JSON.parse(conn.config)
        }))
    }));
  }
};