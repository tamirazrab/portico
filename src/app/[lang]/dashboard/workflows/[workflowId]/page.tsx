import { requireAuth } from "@/bootstrap/helpers/auth/auth-utils";
import EditorWrapperView from "./view/editor-wrapper.view";

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowEditorPage({ params }: PageProps) {
  await requireAuth();
  const { workflowId } = await params;

  return (
    <div className="flex flex-col h-screen">
      <EditorWrapperView workflowId={workflowId} />
    </div>
  );
}
