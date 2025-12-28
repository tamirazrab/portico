"use client";

import { BaseVM } from "reactvvm";
import { useEffect, useRef, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atoms";
import EditorHeaderIVM from "../view/editor-header.i-vm";

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
    }, [this.initialName]);

    useEffect(() => {
      if (isEditingName && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditingName]);

    const updateWorkflowName = useMutation(
      trpc.workflows.updateName.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(
            trpc.workflows.getOne.queryFilter({ id: this.workflowId }),
          );
        },
      }),
    );

    const updateWorkflow = useMutation(
      trpc.workflows.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(
            trpc.workflows.getOne.queryFilter({ id: this.workflowId }),
          );
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
      } catch {
        setEditedName(this.initialName);
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
        nodes,
        edges,
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSaveName();
      } else if (e.key === "Escape") {
        setEditedName(this.initialName);
        setIsEditingName(false);
      }
    };

    return {
      workflowName: this.initialName,
      isEditingName,
      editedName,
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
