import CredentialFormView from "@/app/[lang]/dashboard/credentials/view/credential-form.view";

export default function CreateCredentialPage() {
  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
        <CredentialFormView />
      </div>
    </div>
  );
}

