"use client";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col h-full w-full">{children}</div>;
}
