import { useState, useMemo } from "react";
import { z } from "zod";

export type InviteForm = {
  email: string;
  role: "Team Member" | "Manager";
  expiry: "7 Days" | "14 Days" | "30 Days";
};

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["Team Member", "Manager"]),
  expiry: z.enum(["7 Days", "14 Days", "30 Days"]),
});

export const useInvites = () => {
  const [invites, setInvites] = useState<InviteForm[]>([
    { email: "", role: "Team Member", expiry: "7 Days" },
  ]);

  const [touched, setTouched] = useState<Set<number>>(new Set());

  const addInvite = () =>
    setInvites((i) => [
      ...i,
      { email: "", role: "Team Member", expiry: "7 Days" },
    ]);

  const removeInvite = (index: number) => {
    setInvites((i) => (i.length > 1 ? i.filter((_, k) => k !== index) : i));
    setTouched((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const updateInvite = (
    index: number,
    field: keyof InviteForm,
    value: InviteForm[keyof InviteForm],
  ) => {
    setInvites((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
    if (!touched.has(index)) {
      setTouched((prev) => new Set(prev).add(index));
    }
  };

  const validationResult = useMemo(() => {
    const errors: Record<number, string> = {};
    const isValid = invites.every((invite, index) => {
      const result = inviteSchema.safeParse(invite);
      if (!result.success) {
        if (touched.has(index) && invite.email !== "") {
           errors[index] = result.error.errors[0].message;
        }
        return false;
      }
      return true;
    });
    return { isValid, errors };
  }, [invites, touched]);

  return {
    invites,
    addInvite,
    removeInvite,
    updateInvite,
    canSend: validationResult.isValid,
    errors: validationResult.errors,
  };
};
