"use client";
import React, { createContext, useReducer, ReactNode, Dispatch } from 'react';
import { agentDeploymentReducer, initialAgentDeploymentState } from './agentDeploymentReducer';
import { AgentDeploymentAction, AgentDeploymentState } from '../../types';


interface AgentDeploymentContextProps {
  state: AgentDeploymentState;
  dispatch: Dispatch<AgentDeploymentAction>;
}

export const AgentDeploymentContext = createContext<AgentDeploymentContextProps>({
  state: initialAgentDeploymentState,
  dispatch: () => null,
});

interface ProviderProps {
  children: ReactNode;
}

export const AgentDeploymentProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(agentDeploymentReducer, initialAgentDeploymentState);

  return (
    <AgentDeploymentContext.Provider value={{ state, dispatch }}>
      {children}
    </AgentDeploymentContext.Provider>
  );
};
