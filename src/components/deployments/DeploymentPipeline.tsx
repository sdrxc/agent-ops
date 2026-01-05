"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, MoreHorizontal, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, Globe, GitCommit, BrainCircuit, Bot, User, Users } from 'lucide-react';
import { DeploymentEnvironment, Deployment } from '@/types/deployments';
import { useGlobalContext } from '@/app/GlobalContextProvider';
import { PageHeader } from '@/components/PageHeader';
import axios from 'axios';

interface DeploymentPipelineProps {
  deployments?: Deployment[];
}

const EnvironmentCard = ({ env }: { env: DeploymentEnvironment }) => {
  const isDeploying = env.status === 'Deploying';
  const isWarning = env.status === 'Warning';
  
  return (
    <div className={`p-4 rounded-lg border relative group
      ${isDeploying ? 'bg-primary/10 border-primary/30' : 
        isWarning ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-card border hover:border-primary/50'}`}
    >
      <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-1.5">
           <Globe size={14} className="text-muted-foreground" />
           <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">{env.name}</span>
         </div>
         {isDeploying ? (
           <RefreshCw size={14} className="text-primary animate-spin" />
         ) : isWarning ? (
           <AlertTriangle size={14} className="text-amber-500" />
         ) : (
           <CheckCircle2 size={14} className="text-green-500" />
         )}
      </div>
      
      <div className="mb-3">
         <div className="text-lg font-bold text-foreground">{env.version}</div>
         <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5">
           <GitCommit size={12} />
           {env.commit}
         </div>
      </div>

      {env.warning && (
        <div className="mb-3 p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
           <AlertTriangle size={10} /> {env.warning}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
         <span>{env.lastUpdated}</span>
         <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center font-bold text-muted-foreground">
              {env.author.charAt(0)}
            </div>
            <span>{env.author.split(' ')[0]}</span>
         </div>
      </div>
      
      <div className="absolute inset-x-0 bottom-0 p-2 bg-card/90 backdrop-blur-sm border-t border-border opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2 rounded-b-lg">
         <button className="px-3 py-1 bg-background border border-border rounded text-xs font-medium hover:bg-muted">Logs</button>
         {env.name !== 'Production' && (
           <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 flex items-center gap-1">
             Promote <ArrowRight size={10} />
           </button>
         )}
      </div>
    </div>
  );
};

export const DeploymentPipeline: React.FC<DeploymentPipelineProps> = ({ deployments: propDeployments }) => {
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [deployments, setDeployments] = useState<Deployment[]>(propDeployments || []);
  const [loading, setLoading] = useState(!propDeployments);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useGlobalContext();

  const fetchDeployments = useCallback(async () => {
    if (userLoading || !user?.userID) return;

    const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    const isLocalEnv = runtimeEnv === "local";

    const url = isLocalEnv
      ? `${baseURL}/api/listDeployments`
      : `/api/listDeployments`;

    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(url, {
        userID: user.userID,
      });

      if (res.status === 200 || res.status === 201) {
        const data = res.data?.data?.deployments || res.data?.deployments || [];
        setDeployments(Array.isArray(data) ? data : []);
      } else {
        setDeployments([]);
      }
    } catch (err) {
      console.error("Failed to fetch deployments:", err);
      setError("Failed to load deployments");
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  }, [userLoading, user?.userID]);

  useEffect(() => {
    if (!propDeployments) {
      fetchDeployments();
    }
  }, [propDeployments, fetchDeployments]);

  const currentUser = user?.userName || 'Dev User';

  const filteredDeployments = deployments.filter(deploy => {
    if (activeTab === 'all') return true;
    // Check if the current user authored the latest update in any environment
    return deploy.environments.some(env => env.author === currentUser || env.author === 'You');
  });

  if (loading && !propDeployments) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading deployments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <PageHeader
         title="Deployment Pipelines"
         description="Monitor active services and manage rollout strategies."
         actions={
           <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center gap-2 shadow-sm">
             <Rocket size={18} /> New Deployment
           </button>
         }
       />
       
       <div className="border-b border-border">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('my')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'my' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <User size={16} /> My Deployments
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Users size={16} /> All Deployments
          </button>
        </div>
      </div>
       
       <div className="space-y-6">
         {filteredDeployments.length > 0 ? (
            filteredDeployments.map(deploy => (
            <div key={deploy.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/50">
                    <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${deploy.type === 'Swarm' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-muted text-muted-foreground'}`}>
                        {deploy.type === 'Swarm' ? <BrainCircuit size={20} /> : <Bot size={20} />}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            {deploy.name}
                            <span className="text-xs font-normal text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-full font-mono">{deploy.repo}</span>
                        </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${deploy.type === 'Swarm' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-muted text-muted-foreground border-border'}`}>
                                {deploy.type}
                            </span>
                            {deploy.type === 'Swarm' && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    • Orchestrated Multi-Agent System
                                </span>
                            )}
                        </div>
                    </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 text-muted-foreground/30 hidden md:block z-0">
                        <ArrowRight size={24} />
                        </div>
                        <div className="absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 text-muted-foreground/30 hidden md:block z-0">
                        <ArrowRight size={24} />
                        </div>

                        {deploy.environments.map((env, index) => (
                        <div key={index} className="relative z-10">
                            <EnvironmentCard env={env} />
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            ))
         ) : (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl">
               <User size={32} className="mb-3 opacity-20" />
               <p>You haven&apos;t deployed any services yet.</p>
            </div>
         )}
       </div>
    </div>
  );
};

