"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { BaseVM } from "reactvvm";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/bootstrap/boundaries/auth/better-auth-client";
import { defaultLocale, isAppLocale, routes } from "@/lib/routes";
import type RegisterFormIVM from "../view/register-form.i-vm";
import type { RegisterFormValues } from "../view/register-form.i-vm";

const registerSchema = z
  .object({
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
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
    const params = useParams();
    const raw = params?.lang as string | undefined;
    const lang = raw && isAppLocale(raw) ? raw : defaultLocale();
    const home = routes.home(lang);

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
          callbackURL: home,
        },
        {
          onSuccess: () => {
            toast.success("Account created successfully");
            router.push(home);
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
