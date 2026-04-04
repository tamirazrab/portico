import dynamic from "next/dynamic";

const EditorWrapperView = dynamic(() => import("./view/editor-wrapper.view"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-screen items-center justify-center">
      Loading editor...
    </div>
  ),
});

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowEditorPage({ params }: PageProps) {
  const { workflowId } = await params;

  return (
    <div className="flex flex-col h-screen">
      <EditorWrapperView workflowId={workflowId} />
    </div>
  );
}
