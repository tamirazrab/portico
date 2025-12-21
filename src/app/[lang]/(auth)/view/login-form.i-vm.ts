import { UseFormReturn } from "react-hook-form";

export type LoginFormValues = {
  email: string;
  password: string;
};

export default interface LoginFormIVM {
  form: UseFormReturn<LoginFormValues>;
  isPending: boolean;
  onSubmit: (values: LoginFormValues) => Promise<void>;
}

