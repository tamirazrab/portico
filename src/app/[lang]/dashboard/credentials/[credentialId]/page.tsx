import CredentialDetailView from "../view/credential-detail.view";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

export default async function CredentialDetailPage({ params }: PageProps) {
  const { credentialId } = await params;

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
        <CredentialDetailView credentialId={credentialId} />
      </div>
    </div>
  );
}
