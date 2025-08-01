import { PageLoader } from "@/components/common/PageLoader";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <PageLoader />
    </div>
  );
}
