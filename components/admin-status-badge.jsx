import { Badge } from "@/components/ui";

export function AdminStatusBadge({ children, className }) {
  return <Badge tone={children} className={className}>{children}</Badge>;
}
