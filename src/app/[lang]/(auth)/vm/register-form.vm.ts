"use client";

import { BaseVM } from "reactvvm";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { authClient } from "@/bootstrap/boundaries/auth/better-auth-client";
import RegisterFormIVM, { RegisterFormValues } from "../view/register-form.i-vm";

const registerSchema = z
  .object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default class RegisterFormVM extends BaseVM<RegisterFormIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): RegisterFormIVM {
    const router = useRouter();

    const form = useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        email: "",
        password: "",
        confirmPassword: "",
      },
    });

    const onSubmit = async (values: RegisterFormValues) => {
      await authClient.signUp.email(
        {
          name: values.email,
          email: values.email,
          password: values.password,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            toast.success("Account created successfully");
            router.push("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      );
    };

    return {
      form,
      isPending: form.formState.isSubmitting,
      onSubmit,
    };
  }
}

