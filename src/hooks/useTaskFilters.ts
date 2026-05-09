import { useState, useMemo } from "react";
import { Task } from "@/types/project";
import { useDebounce } from "./useDebounce";

export function useTaskFilters(initialTasks: Task[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  const filteredTasks = useMemo(() => {
    return initialTasks.filter((task) => {
      if (!task) return false;
      const title = task.title || "";
      const desc = task.description || "";

      const matchesSearch =
        title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      // Assignee Filter Logic
      let matchesAssignee = true;
      if (assigneeFilter !== "ALL") {
        if (assigneeFilter === "UNASSIGNED") {
          matchesAssignee = !task.assignedTo;
        } else {
          matchesAssignee = task.assignedTo === assigneeFilter;
        }
      }

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;
      const matchesType = typeFilter === "ALL" || task.type === typeFilter;

      let matchesDate = true;
      if (dateFilter !== "ALL") {
        if (!task.dueDate) {
          matchesDate = false;
        } else {
          // Use UTC to match how dates are stored in the DB, avoiding off-by-one-day
          // bugs for users in non-UTC timezones (e.g. IST = UTC+5:30)
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          const dueDate = new Date(task.dueDate);
          dueDate.setUTCHours(0, 0, 0, 0);

          if (dateFilter === "OVERDUE") {
            matchesDate = dueDate < today && task.status !== "DONE";
          } else if (dateFilter === "TODAY") {
            matchesDate = dueDate.getTime() === today.getTime();
          } else if (dateFilter === "THIS_WEEK") {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            matchesDate = dueDate >= today && dueDate <= nextWeek;
          }
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAssignee &&
        matchesPriority &&
        matchesType &&
        matchesDate
      );
    });
  }, [
    initialTasks,
    debouncedSearchQuery,
    statusFilter,
    assigneeFilter,
    priorityFilter,
    typeFilter,
    dateFilter,
  ]);

  return {
    filteredTasks,
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
  };
}
