"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";

const contactSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("email"), value: z.string().email("Invalid email") }),
  z.object({ method: z.literal("phone"), value: z.string().min(8, "Phone is too short").regex(/^[+0-9 ()-]+$/, "Only numbers and +()- ") })
]);

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  contact: contactSchema
});

export type AppointmentFormValues = z.infer<typeof formSchema>;

export function BookAppointmentForm() {
  const [pending, setPending] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");

  const defaultValues: AppointmentFormValues = useMemo(() => ({
    firstName: "",
    lastName: "",
    contact: { method: "email", value: "" }
  }), []);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      setPending(true);
      const res = await fetch("/api/appointments/book", { method: "POST", body: JSON.stringify(values) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book");
      toast.success(`Appointment requested for ${values.firstName} ${values.lastName}`);
      form.reset(defaultValues);
      setMethod("email");
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card id="book" className="border shadow-sm">
      <CardHeader>
        <CardTitle>Book an appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" placeholder="Jane" {...form.register("firstName")}/>
              {form.formState.errors.firstName && (
                <p className="text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="Doe" {...form.register("lastName")}/>
              {form.formState.errors.lastName && (
                <p className="text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Preferred contact</Label>
            <RadioGroup
              className="grid grid-cols-2 gap-2 sm:max-w-xs"
              value={method}
              onValueChange={(val) => {
                const m = val as "email" | "phone";
                setMethod(m);
                form.setValue("contact", { method: m, value: "" }, { shouldValidate: true });
              }}
            >
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem id="email" value="email" />
                <Label htmlFor="email" className="cursor-pointer">Email</Label>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem id="phone" value="phone" />
                <Label htmlFor="phone" className="cursor-pointer">Mobile</Label>
              </div>
            </RadioGroup>

            <div className="grid gap-2 sm:max-w-md">
              <Label htmlFor="contactValue">{method === "email" ? "Email address" : "Mobile number"}</Label>
              <Input
                id="contactValue"
                placeholder={method === "email" ? "jane@acme.com" : "+1 555 123 4567"}
                type={method === "email" ? "email" : "tel"}
                value={form.getValues("contact").method === method ? form.getValues("contact").value : ""}
                onChange={(e) => form.setValue("contact", { method, value: e.target.value }, { shouldValidate: true })}
              />
              {form.formState.errors.contact && (
                <p className="text-destructive">{(form.formState.errors.contact as any)?.value?.message || (form.formState.errors.contact as any)?.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>{pending ? "Submitting..." : "Request booking"}</Button>
            <p className="text-muted-foreground">We’ll confirm via your selected contact method.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
