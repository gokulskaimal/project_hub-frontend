import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { User } from "@/types/auth";

interface ProjectFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  teamMembers: User[];
}

export default function ProjectFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  assigneeFilter,
  setAssigneeFilter,
  priorityFilter,
  setPriorityFilter,
  typeFilter,
  setTypeFilter,
  dateFilter,
  setDateFilter,
  teamMembers,
}: ProjectFiltersProps) {
  return (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-6 flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full font-bold text-foreground bg-secondary/30 border-border/50 focus:ring-primary/20"
          />
        </div>

        {/* Filters Wrapper */}
        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory lg:flex-wrap items-center gap-3 pb-1 lg:pb-0 shrink-0 max-w-full">
          {/* Assignee Filter */}
          <div className="relative shrink-0 snap-start">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-secondary/30 border border-border rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <option value="ALL" className="bg-card">
                All Assignees
              </option>
              <option value="UNASSIGNED" className="bg-card">
                Unassigned
              </option>
              {teamMembers.map((user) => (
                <option key={user.id} value={user.id} className="bg-card">
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative shrink-0 snap-start">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-secondary/30 border border-border rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <option value="ALL" className="bg-card">
                All Status
              </option>
              <option value="TODO" className="bg-card">
                To Do
              </option>
              <option value="IN_PROGRESS" className="bg-card">
                In Progress
              </option>
              <option value="REVIEW" className="bg-card">
                Review
              </option>
              <option value="DONE" className="bg-card">
                Done
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="relative shrink-0 snap-start">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-secondary/30 border border-border rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <option value="ALL" className="bg-card">
                All Priorities
              </option>
              <option value="LOW" className="bg-card">
                Low
              </option>
              <option value="MEDIUM" className="bg-card">
                Medium
              </option>
              <option value="HIGH" className="bg-card">
                High
              </option>
              <option value="CRITICAL" className="bg-card">
                Critical
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Type Filter */}
          <div className="relative shrink-0 snap-start">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-secondary/30 border border-border rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <option value="ALL" className="bg-card">
                All Types
              </option>
              <option value="BUG" className="bg-card">
                Bug
              </option>
              <option value="STORY" className="bg-card">
                Story
              </option>
              <option value="TASK" className="bg-card">
                Task
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative shrink-0 snap-start">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-secondary/30 border border-border rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <option value="ALL" className="bg-card">
                Any Date
              </option>
              <option value="OVERDUE" className="bg-card">
                Overdue
              </option>
              <option value="TODAY" className="bg-card">
                Due Today
              </option>
              <option value="THIS_WEEK" className="bg-card">
                Due This Week
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
