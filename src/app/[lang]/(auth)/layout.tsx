import AuthLayoutView from "./view/auth-layout.view";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AuthLayoutView lang={lang}>{children}</AuthLayoutView>;
}
