"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type WorkloadFilter = "all" | "healthy" | "busy" | "overloaded";
type SortOption = "name" | "taskCount" | "capacity";

export function TeamContent() {
  const [workloadFilter, setWorkloadFilter] = useState<WorkloadFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // Fetch team members with workload data
  const { data: members = [], isLoading } = useQuery(
    trpc.team.getMembers.queryOptions()
  );

  // Fetch team stats
  const { data: stats } = useQuery(trpc.team.getWorkloadStats.queryOptions());

  // Filter and sort team members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members;

    // Apply workload filter
    if (workloadFilter !== "all") {
      filtered = members.filter((m) => m.workload.level === workloadFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "taskCount":
          return b.workload.taskCount - a.workload.taskCount;
        case "capacity":
          return b.workload.percentage - a.workload.percentage;
        default:
          return 0;
      }
    });

    return sorted;
  }, [members, workloadFilter, sortBy]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Team Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor team capacity and workload distribution
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Capacity is calculated based on a maximum of{" "}
            <strong>5 tasks per member</strong>. Members with 0-70% capacity are
            healthy, 71-90% are busy, and 91%+ are overloaded.
          </AlertDescription>
        </Alert>
      </div>

      {/* Team Statistics */}
      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Healthy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.healthyCount}
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                >
                  0-70%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Busy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.busyCount}
                </div>
                <Badge
                  variant="outline"
                  className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
                >
                  71-90%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overloaded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.overloadedCount}
                </div>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                >
                  91%+
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={workloadFilter}
          onValueChange={(value) => setWorkloadFilter(value as WorkloadFilter)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="healthy">Healthy</TabsTrigger>
            <TabsTrigger value="busy">Busy</TabsTrigger>
            <TabsTrigger value="overloaded">Overloaded</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="taskCount">Task Count</SelectItem>
              <SelectItem value="capacity">Capacity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team Members Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            workloadFilter === "all"
              ? "No team members yet"
              : `No ${workloadFilter} team members`
          }
          description={
            workloadFilter === "all"
              ? "Team members will appear here once they have been assigned tasks."
              : `There are no ${workloadFilter} team members at the moment. Try changing the filter.`
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              id={member.id}
              name={member.name}
              email={member.email}
              taskCount={member.workload.taskCount}
              maxCapacity={member.workload.maxCapacity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
