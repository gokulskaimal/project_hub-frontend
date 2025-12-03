export type NavItem = {
  name: string;
  href: string;
  icon?: string;
  active?: boolean;
  borderTop?: boolean;
};

export const MANAGER_LINKS: NavItem[] = [
  { name: "Dashboard", href: "/manager/dashboard", active: true },
  { name: "Projects", href: "/manager/projects" },
  { name: "Team Management", href: "/manager/team" },
  { name: "Billing", href: "/manager/billing", borderTop: true },
];

export const MEMBER_LINKS: NavItem[] = [
  { name: "My Work", href: "/member/dashboard", active: true },
  { name: "Tasks", href: "/member/tasks" },
  { name: "Activity", href: "/member/activity" },
];

export const ADMIN_LINKS: NavItem[] = [
  { name: "Overview", href: "/admin/dashboard", active: true },
  { name: "Organizations", href: "/admin/organizations" },
  { name: "Users", href: "/admin/users" },
  { name: "Plans", href: "/admin/plans" },
];
