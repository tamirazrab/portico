"use client";

import { BaseVM } from "reactvvm";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { authClient } from "@/bootstrap/boundaries/auth/better-auth-client";
import LoginFormIVM, { LoginFormValues } from "../view/login-form.i-vm";

const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export default class LoginFormVM extends BaseVM<LoginFormIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): LoginFormIVM {
    const router = useRouter();

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
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            toast.success("Logged in successfully");
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

