"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RocketIcon,
  ServerIcon,
  CloudIcon,
  ShieldIcon,
  SparklesIcon,
  BellIcon
} from "lucide-react";

export const AgentHosting = () => {
  const features = [
    {
      icon: ServerIcon,
      title: "Scalable Infrastructure",
      description: "Deploy your agents with automatic scaling based on demand"
    },
    {
      icon: CloudIcon,
      title: "Multi-Region Support",
      description: "Host your agents in multiple regions for optimal latency"
    },
    {
      icon: ShieldIcon,
      title: "Enterprise Security",
      description: "Advanced security features with end-to-end encryption"
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            Coming Soon
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Agent Hosting Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Host, manage, and scale your AI agents with enterprise-grade reliability and performance
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="gap-2">
              <BellIcon className="h-4 w-4" />
              Get Notified
            </Button>
            <Button className="gap-2 bg-linear-to-r from-orange-500 to-amber-500" disabled>
              <SparklesIcon className="h-4 w-4" />
              Join Waitlist
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 border-dashed">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

 
      </div>
    </Layout>
  );
};
