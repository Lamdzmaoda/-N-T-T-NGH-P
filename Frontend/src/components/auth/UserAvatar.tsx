import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses: Record<"xs" | "sm" | "md" | "lg" | "xl", string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-28 w-28 text-2xl",
};

export function UserAvatar({
  src,
  name,
  className,
  fallbackClassName,
  size = "md",
}: UserAvatarProps) {
  const initials = name?.trim() ? name.trim().charAt(0).toUpperCase() : "U";

  return (
    <Avatar className={cn(sizeClasses[size], "border border-border", className)}>
      <AvatarImage src={src || undefined} alt={name || "User Avatar"} className="object-cover" />
      <AvatarFallback className={cn("font-semibold bg-muted text-foreground", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}