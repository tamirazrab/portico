import { requireUnauth } from "@/bootstrap/helpers/auth/auth-utils";
import RegisterFormView from "@/app/[lang]/(auth)/view/register-form.view";

export default async function SignupPage() {
  await requireUnauth();
  return <RegisterFormView />;
}

