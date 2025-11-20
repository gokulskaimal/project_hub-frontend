import { useState } from "react";

export type InviteForm = {
  email: string;
  role: "Team Member" | "Admin" | "Manager";
  expiry: "7 Days" | "14 Days" | "30 Days";
};

export const useInvites = () => {
  const [invites, setInvites] = useState<InviteForm[]>([
    { email: "", role: "Team Member", expiry: "7 Days" },
  ]);

  const addInvite = () =>
    setInvites((i) => [
      ...i,
      { email: "", role: "Team Member", expiry: "7 Days" },
    ]);

  const removeInvite = (index: number) =>
    setInvites((i) => (i.length > 1 ? i.filter((_, k) => k !== index) : i));

  const updateInvite = (
    index: number,
    field: keyof InviteForm,
    value: InviteForm[keyof InviteForm],
  ) =>
    setInvites((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );

  const canSend = invites.every(
    (i) => i.email.trim().length > 3 && i.email.includes("@"),
  );

  return {
    invites,
    addInvite,
    removeInvite,
    updateInvite,
    canSend,
  };
};
