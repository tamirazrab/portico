"use client";

import { EntityHeader } from "@/components/entity-components";
import ExecutionsHeaderVM from "../vm/executions-header.vm";
import ExecutionsHeaderIVM from "./executions-header.i-vm";

export default function ExecutionsHeaderView() {
  const vm = new ExecutionsHeaderVM();
  const vmData = vm.useVM();

  return <EntityHeader title={vmData.title} description={vmData.description} />;
}
