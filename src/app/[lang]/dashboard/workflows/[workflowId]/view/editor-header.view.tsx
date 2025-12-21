"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRef, useEffect } from "react";
import EditorHeaderIVM from "./editor-header.i-vm";
import EditorHeaderVM from "../vm/editor-header.vm";

interface EditorHeaderViewProps {
  workflowId: string;
  workflowName: string;
}

export default function EditorHeaderView({
  workflowId,
  workflowName,
}: EditorHeaderViewProps) {
  const vm = new EditorHeaderVM({ workflowId, initialName: workflowName });
  const vmData = vm.useVM();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vmData.isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [vmData.isEditingName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      vmData.onSaveName();
    } else if (e.key === "Escape") {
      vmData.onCancelEditing();
    }
  };

  return (
    <header className="flex h-14 shrink-4 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between gap-x-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/workflows" prefetch>
                  workflows
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {vmData.isEditingName ? (
              <BreadcrumbItem>
                <Input
                  disabled={vmData.isSavingName}
                  ref={inputRef}
                  value={vmData.editedName}
                  onChange={(e) => vmData.onNameChange(e.target.value)}
                  onBlur={vmData.onSaveName}
                  onKeyDown={handleKeyDown}
                  className="h-7 w-auto min-w-[180px] px-2"
                />
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem
                onClick={vmData.onStartEditing}
                className="cursor-pointer hover:text-foreground transition-colors"
              >
                {vmData.workflowName}
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button
            size="sm"
            onClick={vmData.onSaveWorkflow}
            disabled={vmData.isSavingWorkflow}
          >
            <SaveIcon className="size-4" />
            Save
          </Button>
        </div>
      </div>
    </header>
  );
}

