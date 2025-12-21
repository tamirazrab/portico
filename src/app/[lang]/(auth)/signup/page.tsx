import RegisterFormView from "../view/register-form.view";
import { requireUnauth } from "@/bootstrap/helpers/auth/auth-utils";

export default async function SignupPage() {
  await requireUnauth();
  return <RegisterFormView />;
}

