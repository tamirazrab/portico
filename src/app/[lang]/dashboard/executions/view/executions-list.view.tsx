"use client";

import { EntityList, EmptyView } from "@/components/entity-components";
import { useExecutions } from "../hooks/use-executions-list";
import ExecutionItemView from "./execution-item.view";

export default function ExecutionsListView() {
  const { executions, isEmpty } = useExecutions();

  if (isEmpty) {
    return <EmptyView message="No Executions found." />;
  }

  return (
    <EntityList
      items={executions}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItemView execution={execution} />}
      emptyView={<EmptyView message="No Executions found." />}
    />
  );
}
