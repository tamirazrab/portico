import LoginFormView from "../view/login-form.view";
import { requireUnauth } from "@/bootstrap/helpers/auth/auth-utils";

export default async function LoginPage() {
  await requireUnauth();
  return <LoginFormView />;
}

