import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";

const startSprintSchema = z
  .object({
    goal: z.string().trim().min(5, "A sprint goal (min 5 chars) is required"),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  );

interface StartSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    goal: string;
    startDate: string;
    endDate: string;
  }) => void;
  sprintName: string;
  taskCount: number;
}

export default function StartSprintModal({
  isOpen,
  onClose,
  onConfirm,
  sprintName,
  taskCount,
}: StartSprintModalProps) {
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskCount === 0) {
      alert("Cannot start a sprint with 0 tasks!");
      return;
    }

    const result = startSprintSchema.safeParse({ goal, startDate, endDate });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    onConfirm({ goal, startDate, endDate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            Start Sprint: {sprintName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
            This sprint contains <strong>{taskCount}</strong> tasks.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint Goal
            </label>
            <textarea
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="What do we want to achieve?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={taskCount === 0}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Start Sprint
          </button>
        </form>
      </div>
    </div>
  );
}
