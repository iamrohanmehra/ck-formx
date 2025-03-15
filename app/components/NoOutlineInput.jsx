import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NoOutlineInput({ className, ...props }) {
  return (
    <Input
      className={cn(
        "focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  );
}
