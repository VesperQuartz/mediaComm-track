import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner className="text-track-red size-8" />
    </div>
  );
}
