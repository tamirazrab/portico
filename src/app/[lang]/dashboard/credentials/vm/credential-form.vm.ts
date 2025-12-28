"use client";

import { BaseVM } from "reactvvm";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { CredentialType } from "@/generated/prisma/enums";
import CredentialFormIVM, {
  CredentialFormValues,
} from "../view/credential-form.i-vm";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(CredentialType),
  value: z.string().min(1, "Value is required"),
});

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/openai.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/anthropic.svg",
  },
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/gemini.svg",
  },
  {
    value: CredentialType.CRON,
    label: "Cron",
    logo: "/cron.svg",
  },
];

interface CredentialFormVMProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export default class CredentialFormVM extends BaseVM<CredentialFormIVM> {
  private initialData?: CredentialFormVMProps["initialData"];

  constructor(initialData?: CredentialFormVMProps["initialData"]) {
    super();
    this.initialData = initialData;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): CredentialFormIVM {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { handleError, modal } = useUpgradeModal();

    const isEdit = !!this.initialData?.id;

    const form = useForm<CredentialFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: this.initialData || {
        name: "",
        type: CredentialType.OPENAI,
        value: "",
      },
    });

    const createCredential = useMutation(
      trpc.credentials.create.mutationOptions({
        onSuccess: (data) => {
          toast.success(`Credential ${data.name} created successfully`);
          queryClient.invalidateQueries(
            trpc.credentials.getMany.queryOptions({}),
          );
          router.push(`/credentials/${data.id}`);
        },
        onError: (error) => {
          handleError(error);
        },
      }),
    );

    const updateCredential = useMutation(
      trpc.credentials.update.mutationOptions({
        onSuccess: (data) => {
          toast.success(`Credential ${data.name} saved successfully`);
          queryClient.invalidateQueries(
            trpc.credentials.getMany.queryOptions({}),
          );
          queryClient.invalidateQueries(
            trpc.credentials.getOne.queryFilter({ id: data.id }),
          );
        },
        onError: (error) => {
          handleError(error);
        },
      }),
    );

    const onSubmit = async (values: CredentialFormValues) => {
      if (isEdit && this.initialData?.id) {
        await updateCredential.mutateAsync({
          id: this.initialData.id,
          ...values,
        });
      } else {
        await createCredential.mutateAsync(values);
      }
    };

    return {
      form,
      isEdit,
      isSubmitting: createCredential.isPending || updateCredential.isPending,
      onSubmit,
      credentialTypeOptions,
      modal,
    };
  }
}
