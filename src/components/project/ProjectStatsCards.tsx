import { LayoutGrid, CheckCircle2 } from "lucide-react";
import { StatCard } from "../ui/StatCard";

interface ProjectStatsCardsProps {
  totalTasks: number;
  completedTasks: number;
}

export default function ProjectStatsCards({
  totalTasks,
  completedTasks,
}: ProjectStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    </div>
  );
}
