"use client";

import { EntityItem } from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { invalidateCredentials, invalidateCredential } from "@/trpc/helpers/query-invalidation";
import { credentialLogos } from "../utils/credential-logos";
import type { Credential } from "../types";

interface CredentialItemViewProps {
  credential: Credential;
}

export default function CredentialItemView({
  credential,
}: CredentialItemViewProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { handleError } = useUpgradeModal();

  const removeCredential = useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" removed successfully`);
        invalidateCredentials(queryClient);
        invalidateCredential(queryClient, data.id);
      },
      onError: (error) => {
        const handled = handleError(error);
        if (!handled) {
          toast.error(`Failed to remove credential: ${error.message}`);
        }
      },
    }),
  );

  const Logo =
    credentialLogos[credential.type as keyof typeof credentialLogos] || "🔑";

  return (
    <EntityItem
      href={`/${lang}/dashboard/credentials/${credential.id}`}
      title={credential.name}
      subtitle={
        <>
          Updated{" "}
          {formatDistanceToNow(credential.updatedAt, {
            addSuffix: true,
          })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(credential.createdAt, {
            addSuffix: true,
          })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image
            src={Logo}
            alt={credential.type}
            width={20}
            height={20}
          />
        </div>
      }
      onRemove={() => removeCredential.mutate({ id: credential.id })}
      isRemoving={removeCredential.isPending}
    />
  );
}
