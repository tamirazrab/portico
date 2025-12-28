"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/app/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { Input } from "postcss";
import CredentialFormVM from "../vm/credential-form.vm";

interface CredentialFormViewProps {
  initialData?: {
    id?: string;
    name: string;
    type: string;
    value: string;
  };
}

export default function CredentialFormView({
  initialData,
}: CredentialFormViewProps) {
  const vm = new CredentialFormVM(initialData);
  const vmData = vm.useVM();

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
                  <Link href="/credentials" prefetch>
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
