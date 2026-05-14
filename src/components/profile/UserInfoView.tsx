import React from "react";

type Props = {
  email: string;
  name: string;
  role: string;
  status?: string;
  organizationName?: string;
};

export default function UserInfoView({
  email,
  name,
  role,
  status = "ACTIVE",
  organizationName,
}: Props) {
  return (
    <div className="bg-secondary/10 rounded-3xl p-8 mb-6 border border-border/50 shadow-inner">
      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">
        Profile Details
      </h4>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-border/10">
          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
            Email
          </span>
          <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
            {email || "-"}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/10">
          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
            Name
          </span>
          <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
            {name}
          </span>
        </div>
        {organizationName && (
          <div className="flex justify-between items-center py-2 border-b border-border/10">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
              Organization
            </span>
            <span className="text-[11px] font-black text-primary uppercase tracking-tight">
              {organizationName}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center py-2 border-b border-border/10">
          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
            Role
          </span>
          <span className="text-[11px] font-black text-primary uppercase tracking-tight">
            {(role || "").toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
            Status
          </span>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[9px] font-black uppercase tracking-widest">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
