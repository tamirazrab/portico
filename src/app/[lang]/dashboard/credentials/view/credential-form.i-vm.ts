import type { UseFormReturn } from "react-hook-form";
import type CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";

export type CredentialFormValues = {
  name: string;
  type: CredentialType;
  value: string;
};

export default interface CredentialFormIVM {
  form: UseFormReturn<CredentialFormValues>;
  isEdit: boolean;
  isSubmitting: boolean;
  onSubmit: (values: CredentialFormValues) => Promise<void>;
  credentialTypeOptions: Array<{
    value: CredentialType;
    label: string;
    logo: string;
  }>;
  modal: React.ReactNode;
}
