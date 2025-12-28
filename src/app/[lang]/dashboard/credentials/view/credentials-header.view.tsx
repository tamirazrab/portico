"use client";

import { EntityHeader } from "@/components/entity-components";
import CredentialsHeaderVM from "../vm/credentials-header.vm";
import CredentialsHeaderIVM from "./credentials-header.i-vm";

export default function CredentialsHeaderView() {
  const vm = new CredentialsHeaderVM();
  const vmData = vm.useVM();

  return (
    <EntityHeader
      title={vmData.title}
      description={vmData.description}
      newButtonHref={vmData.createButtonHref}
      newButtonLabel={vmData.createButtonLabel}
      disabled={vmData.disabled}
    />
  );
}
