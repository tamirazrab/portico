import ExecutionDetailWrapperView from "../view/execution-detail-wrapper.view";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
}

export default async function ExecutionDetailPage({ params }: PageProps) {
  const { executionId } = await params;

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
        <ExecutionDetailWrapperView executionId={executionId} />
      </div>
    </div>
  );
}

