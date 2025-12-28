import { UseFormReturn } from "react-hook-form";

export type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default interface RegisterFormIVM {
  form: UseFormReturn<RegisterFormValues>;
  isPending: boolean;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
}
