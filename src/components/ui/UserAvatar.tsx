import Image from "next/image";
import { cn } from "@/utils/cn"; // Assuming utils/cn exists, if not I will use simple string concatenation or clsx

interface UserAvatarProps {
  user?: {
    avatar?: string | null;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    profileImage?: string | null; // handle both naming conventions
  } | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function UserAvatar({
  user,
  size = "md",
  className,
}: UserAvatarProps) {
  const avatarUrl = user?.avatar || user?.profileImage;
  const name =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || user?.email || "?";

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return (user?.email?.[0] || "?").toUpperCase();
  };

  const initials = getInitials();

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  return (
    <div
      title={name}
      className={cn(
        "relative rounded-full flex items-center justify-center overflow-hidden border border-gray-200 shrink-0",
        sizeClasses[size],
        !avatarUrl && "bg-blue-100 text-blue-700 font-bold", // Fallback style
        className,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
