import AuthLayoutView from "./view/auth-layout.view";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutView>{children}</AuthLayoutView>;
}

