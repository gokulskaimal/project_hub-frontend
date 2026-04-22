"use client";

import { usePathname, useRouter, useParams } from "next/navigation";
import { useGetProjectByIdQuery } from "@/store/api/projectApiSlice";
import {
  ArrowLeft,
  LayoutList,
  KanbanSquare,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col h-full w-full">{children}</div>;
}
