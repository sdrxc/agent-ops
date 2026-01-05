import { apiClient, apiRequest } from "@/lib/api/client"
import { Agent } from "@/types/api"

export const agentsApi = {
  async listAgents(projectID: string, userID: string): Promise<Agent[]> {
    return apiRequest(() =>
      apiClient.post("/api/listProjectAgents", {
        userID,
        projectID,
      })
    )
  },

  async getAgent(agentID: string): Promise<Agent> {
    return apiRequest(() =>
      apiClient.get(`/api/agents/${agentID}`)
    )
  },

  async registerAgent(data: {
    userID: string
    projectID: string
    name: string
    description?: string
    tags?: string[]
  }): Promise<Agent> {
    return apiRequest(() =>
      apiClient.post("/api/registerNewAgent", data)
    )
  },

  async updateAgent(agentID: string, data: Partial<Agent>): Promise<Agent> {
    return apiRequest(() =>
      apiClient.put(`/api/agents/${agentID}`, data)
    )
  },

  async deleteAgent(agentID: string): Promise<void> {
    return apiRequest(() =>
      apiClient.delete(`/api/agents/${agentID}`)
    )
  },
}




