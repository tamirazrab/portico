"use client";

import { EntityHeader } from "@/components/entity-components";
import { useParams } from "next/navigation";

export default function CredentialsHeaderView() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <EntityHeader
      title="Credentials"
      description="Create and Manage your Credentials"
      newButtonHref={`/${lang}/dashboard/credentials/new`}
      newButtonLabel="Create Credential"
    />
  );
}
