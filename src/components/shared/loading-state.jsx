import { Spinner } from "@/components/ui/spinner";

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
