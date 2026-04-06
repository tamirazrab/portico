import { WorkflowEditorClient } from "./workflow-editor-client";

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowEditorPage({ params }: PageProps) {
  const { workflowId } = await params;

  return <WorkflowEditorClient workflowId={workflowId} />;
}
