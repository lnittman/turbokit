'use client';

import { useState } from 'react';
import type React from 'react';
import { useQuery } from 'convex/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@repo/design/components/ui/card';
import { Button } from '@repo/design/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design/components/ui/tabs';
import { Progress } from '@repo/design/components/ui/progress';
import { Badge } from '@repo/design/components/ui/badge';
import {
  Pulse as Activity,
  UsersThree as Users,
  CurrencyDollar as DollarSign,
  TrendUp as TrendingUp,
  Calendar,
  FileText,
  GearSix as Settings,
  CaretRight as ChevronRight,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';

// Placeholder for real-time counter using Convex
function RealtimeCounter() {
  const [localCount, setLocalCount] = useState(0);
  // TODO: Replace with actual Convex query
  // const count = useQuery(api.functions.queries.counter.get);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={() => setLocalCount(localCount + 1)}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Live Interactions
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{localCount}</div>
          <p className="text-xs text-muted-foreground">
            Click to increment (real-time sync pending)
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Stats card component
function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: any;
}) {
  const isPositive = change.startsWith('+');
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}

// Activity feed item
function ActivityItem({ 
  action, 
  user, 
  time, 
  type 
}: { 
  action: string; 
  user: string; 
  time: string; 
  type: 'success' | 'warning' | 'info';
}) {
  const typeColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <div className="flex items-start space-x-3 py-3">
      <Badge className={typeColors[type]} variant="secondary">
        {type}
      </Badge>
      <div className="flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">{user}</span> {action}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

export default function DashboardPage(): React.ReactElement {
  // Mock data - replace with Convex queries
  const stats = {
    totalUsers: '2,350',
    revenue: '$45,231',
    activeProjects: '12',
    growthRate: '23%'
  };
  
  const activities = [
    { action: 'deployed to production', user: 'Sarah Chen', time: '2 minutes ago', type: 'success' as const },
    { action: 'updated billing settings', user: 'Mike Johnson', time: '15 minutes ago', type: 'info' as const },
    { action: 'triggered a workflow', user: 'System', time: '1 hour ago', type: 'warning' as const },
    { action: 'invited team members', user: 'Emma Wilson', time: '3 hours ago', type: 'info' as const },
  ];
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Users" 
          value={stats.totalUsers} 
          change="+20.1%" 
          icon={Users} 
        />
        <StatsCard 
          title="Revenue" 
          value={stats.revenue} 
          change="+15.3%" 
          icon={DollarSign} 
        />
        <StatsCard 
          title="Active Projects" 
          value={stats.activeProjects} 
          change="+2" 
          icon={Activity} 
        />
        <StatsCard 
          title="Growth Rate" 
          value={stats.growthRate} 
          change="+4.5%" 
          icon={TrendingUp} 
        />
      </div>
      
      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart/Analytics Section */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>
              Your performance metrics for the current period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-4">
                  {/* Progress bars as placeholder for charts */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Usage</span>
                      <span className="text-sm text-muted-foreground">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Storage</span>
                      <span className="text-sm text-muted-foreground">54%</span>
                    </div>
                    <Progress value={54} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bandwidth</span>
                      <span className="text-sm text-muted-foreground">31%</span>
                    </div>
                    <Progress value={31} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="analytics">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Detailed analytics coming soon
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="reports">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Custom reports will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Activity Feed */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Real-time updates from your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View all activity
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions & Convex Demo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RealtimeCounter />
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Configure Settings
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              All systems operational
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CDN</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
