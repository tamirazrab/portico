"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";
import { routes } from "@/lib/routes";
import CredentialFormVM from "../vm/credential-form.vm";

interface CredentialFormViewProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export default function CredentialFormView({
  initialData,
}: CredentialFormViewProps) {
  const vm = new CredentialFormVM(initialData);
  const vmData = vm.useVM();
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <>
      {vmData.modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {vmData.isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>
          <CardDescription>
            {vmData.isEdit
              ? "Update your credential details"
              : "Add a new credential"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...vmData.form}>
            <form
              onSubmit={vmData.form.handleSubmit(vmData.onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={vmData.form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="My API" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vmData.form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vmData.credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                              />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vmData.form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="****..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={vmData.isSubmitting}>
                  {vmData.isEdit ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={routes.credentials(lang)} prefetch>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
