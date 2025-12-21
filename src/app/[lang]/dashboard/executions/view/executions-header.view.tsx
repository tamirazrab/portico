"use client";

import { EntityHeader } from "@/components/entity-components";
import ExecutionsHeaderIVM from "./executions-header.i-vm";
import ExecutionsHeaderVM from "../vm/executions-header.vm";

export default function ExecutionsHeaderView() {
  const vm = new ExecutionsHeaderVM();
  const vmData = vm.useVM();

  return (
    <EntityHeader
      title={vmData.title}
      description={vmData.description}
    />
  );
}

