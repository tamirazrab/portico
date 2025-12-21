"use client";

import { BaseVM } from "reactvvm";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import CredentialItemIVM from "../view/credential-item.i-vm";

// Using Prisma types for UI layer
type Credential = {
  id: string;
  name: string;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default class CredentialItemVM extends BaseVM<CredentialItemIVM> {
  private credential: Credential;

  constructor(credential: Credential) {
    super();
    this.credential = credential;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): CredentialItemIVM {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const removeCredential = useMutation(
      trpc.credentials.remove.mutationOptions({
        onSuccess: (data) => {
          toast.success(`Credential "${data.name}" removed successfully`);
          queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
          queryClient.invalidateQueries(
            trpc.credentials.getOne.queryFilter({ id: data.id }),
          );
        },
        onError: (error) => {
          toast.error(`Failed to remove credential: ${error.message}`);
        },
      }),
    );

    return {
      credential: this.credential,
      onRemove: () => {
        removeCredential.mutate({ id: this.credential.id });
      },
      isRemoving: removeCredential.isPending,
    };
  }
}

