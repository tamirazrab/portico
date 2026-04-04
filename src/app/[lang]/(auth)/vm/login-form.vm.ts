"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { BaseVM } from "reactvvm";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/bootstrap/boundaries/auth/better-auth-client";
import { defaultLocale, isAppLocale, routes } from "@/lib/routes";
import type LoginFormIVM from "../view/login-form.i-vm";
import type { LoginFormValues } from "../view/login-form.i-vm";

const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export default class LoginFormVM extends BaseVM<LoginFormIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): LoginFormIVM {
    const router = useRouter();
    const params = useParams();
    const raw = params?.lang as string | undefined;
    const lang = raw && isAppLocale(raw) ? raw : defaultLocale();
    const home = routes.home(lang);

    const form = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    });

    const onSubmit = async (values: LoginFormValues) => {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: home,
        },
        {
          onSuccess: () => {
            toast.success("Logged in successfully");
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
