"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { BaseVM } from "reactvvm";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import { useTRPC } from "@/trpc/client";
import { invalidateWorkflow } from "@/trpc/helpers/query-invalidation";
import { editorAtom } from "../store/atoms";
import type EditorHeaderIVM from "../view/editor-header.i-vm";

interface EditorHeaderVMProps {
  workflowId: string;
  initialName: string;
}

export default class EditorHeaderVM extends BaseVM<EditorHeaderIVM> {
  private workflowId: string;

  private initialName: string;

  constructor({ workflowId, initialName }: EditorHeaderVMProps) {
    super();
    this.workflowId = workflowId;
    this.initialName = initialName;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): EditorHeaderIVM {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const editor = useAtomValue(editorAtom);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(this.initialName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setEditedName(this.initialName);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (isEditingName && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditingName]);

    const updateWorkflowName = useMutation(
      trpc.workflows.updateName.mutationOptions({
        onSuccess: () => {
          invalidateWorkflow(queryClient, this.workflowId);
        },
      }),
    );

    const updateWorkflow = useMutation(
      trpc.workflows.update.mutationOptions({
        onSuccess: () => {
          invalidateWorkflow(queryClient, this.workflowId);
        },
      }),
    );

    const handleSaveName = async () => {
      if (editedName === this.initialName) {
        setIsEditingName(false);
        return;
      }
      try {
        await updateWorkflowName.mutateAsync({
          id: this.workflowId,
          name: editedName,
        });
      } catch (error) {
        // Reset to original name on error
        setEditedName(this.initialName);
        // Error is already handled by mutation's onError handler
        console.error("Failed to update workflow name:", error);
      } finally {
        setIsEditingName(false);
      }
    };

    const handleSaveWorkflow = () => {
      if (!editor) {
        return;
      }

      const nodes = editor.getNodes();
      const edges = editor.getEdges();

      updateWorkflow.mutate({
        id: this.workflowId,
        nodes: nodes.map((n) => ({
          id: n.id,
          position: n.position,
          type:
            n.type !== undefined &&
            Object.values(NodeType).includes(n.type as NodeType)
              ? (n.type as NodeType)
              : undefined,
          data: n.data as Record<string, unknown> | undefined,
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        })),
      });
    };

    return {
      workflowName: this.initialName,
      isEditingName,
      editedName,
      inputRef,
      onNameChange: setEditedName,
      onStartEditing: () => setIsEditingName(true),
      onSaveName: handleSaveName,
      onCancelEditing: () => {
        setEditedName(this.initialName);
        setIsEditingName(false);
      },
      onSaveWorkflow: handleSaveWorkflow,
      isSavingName: updateWorkflowName.isPending,
      isSavingWorkflow: updateWorkflow.isPending,
    };
  }
}
