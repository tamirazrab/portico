"use client";

import { BaseVM } from "reactvvm";
import CredentialsHeaderIVM from "../view/credentials-header.i-vm";

export default class CredentialsHeaderVM extends BaseVM<CredentialsHeaderIVM> {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- useVM is a hook method
  useVM(): CredentialsHeaderIVM {
    return {
      title: "Credentials",
      description: "Create and Manage your Credentials",
      createButtonLabel: "Create Credential",
      createButtonHref: "/credentials/new",
      disabled: false,
    };
  }
}
