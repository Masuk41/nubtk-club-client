import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserAvatar({ name, src, size = "default" }) {
  const sizeClass =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-16 w-16" : "h-10 w-10";
  const textClass = size === "lg" ? "text-lg" : "text-xs";

  return (
    <Avatar className={sizeClass}>
      {src && <AvatarImage src={src} alt={name || "User avatar"} />}
      <AvatarFallback
        className={`bg-primary text-primary-foreground font-semibold ${textClass}`}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
