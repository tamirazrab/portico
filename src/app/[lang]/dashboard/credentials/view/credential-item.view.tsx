"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { EntityItem } from "@/components/entity-components";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { routes } from "@/lib/routes";
import { useTRPC } from "@/trpc/client";
import {
  invalidateCredential,
  invalidateCredentials,
} from "@/trpc/helpers/query-invalidation";
import type { Credential } from "../types";
import { credentialLogos } from "../utils/credential-logos";

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
      onSuccess: (_data) => {
        toast.success(`Credential "${credential.name}" removed successfully`);
        invalidateCredentials(queryClient);
        invalidateCredential(queryClient, credential.id);
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
      href={routes.credential(lang, credential.id)}
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
          <Image src={Logo} alt={credential.type} width={20} height={20} />
        </div>
      }
      onRemove={() => removeCredential.mutate({ id: credential.id })}
      isRemoving={removeCredential.isPending}
    />
  );
}
