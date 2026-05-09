import { LayoutGrid, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { StatCard } from "../ui/StatCard";

interface ProjectStatsCardsProps {
  totalTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
  upcomingTasks: number;
}

export default function ProjectStatsCards({
  totalTasks,
  completedTasks,
  highPriorityTasks,
  upcomingTasks,
}: ProjectStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        label="Total Tasks"
        value={totalTasks}
        icon={LayoutGrid}
        color="blue"
      />
      <StatCard
        label="Completed"
        value={completedTasks}
        icon={CheckCircle2}
        color="green"
      />
      <StatCard
        label="High Priority"
        value={highPriorityTasks}
        icon={AlertCircle}
        color="red"
      />
      <StatCard
        label="Upcoming"
        value={upcomingTasks}
        icon={Clock}
        color="orange"
      />
    </div>
  );
}
