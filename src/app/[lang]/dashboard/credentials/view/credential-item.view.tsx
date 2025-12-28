"use client";

import { EntityItem } from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import CredentialItemVM from "../vm/credential-item.vm";
import { credentialLogos } from "../utils/credential-logos";
import CredentialItemIVM from "./credential-item.i-vm";

// Using Prisma types for UI layer
type Credential = {
  id: string;
  name: string;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

interface CredentialItemViewProps {
  credential: Credential;
}

export default function CredentialItemView({
  credential,
}: CredentialItemViewProps) {
  const vm = new CredentialItemVM(credential);
  const vmData = vm.useVM();
  const Logo =
    credentialLogos[credential.type as keyof typeof credentialLogos] || "🔑";

  return (
    <EntityItem
      href={`/credentials/${vmData.credential.id}`}
      title={vmData.credential.name}
      subtitle={
        <>
          Updated{" "}
          {formatDistanceToNow(vmData.credential.updatedAt, {
            addSuffix: true,
          })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(vmData.credential.createdAt, {
            addSuffix: true,
          })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image
            src={Logo}
            alt={vmData.credential.type}
            width={20}
            height={20}
          />
        </div>
      }
      onRemove={vmData.onRemove}
      isRemoving={vmData.isRemoving}
    />
  );
}
