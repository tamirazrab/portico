"use client";

import dynamic from "next/dynamic";

const EditorWrapperView = dynamic(() => import("./view/editor-wrapper.view"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-screen items-center justify-center">
      Loading editor...
    </div>
  ),
});

export function WorkflowEditorClient({ workflowId }: { workflowId: string }) {
  return (
    <div className="flex flex-col h-screen">
      <EditorWrapperView workflowId={workflowId} />
    </div>
  );
}
