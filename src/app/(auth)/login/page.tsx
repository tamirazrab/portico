import { requireUnauth } from "@/bootstrap/helpers/auth/auth-utils";
import LoginFormView from "@/app/[lang]/(auth)/view/login-form.view";

export default async function LoginPage() {
  await requireUnauth();
  return <LoginFormView />;
}

