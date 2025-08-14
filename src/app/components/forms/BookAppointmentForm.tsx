"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { useAuth } from "../auth/auth-context";
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  contactMethod: z.enum(["email", "phone"]),
  contact: z.string().min(1, "Contact information is required")
});

export type AppointmentFormValues = z.infer<typeof formSchema>;

export function BookAppointmentForm() {
  const [pending, setPending] = useState(false);
  const { user } = useAuth();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactMethod: "email",
      contact: ""
    }
  });

  const contactMethod = form.watch("contactMethod");

  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      setPending(true);
      
      // Validate contact based on method
      if (values.contactMethod === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values.contact)) {
          toast.error("Please enter a valid email address");
          return;
        }
      } else {
        const phoneRegex = /^[+0-9 ()-]+$/;
        if (!phoneRegex.test(values.contact) || values.contact.length < 8) {
          toast.error("Please enter a valid phone number");
          return;
        }
      }
      
      const appointmentData = {
        firstName: values.firstName,
        lastName: values.lastName,
        contact: values.contact,
        userId: user?.id || null
      };

      console.log('Booking appointment with data:', appointmentData);

      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-15d1e443/api/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      const data = await res.json();
      console.log('Booking response:', data);
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }
      
      toast.success(`Appointment requested for ${values.firstName} ${values.lastName}. Staff will contact you to confirm details.`);
      form.reset();
    } catch (e: any) {
      console.error("Appointment booking error:", e);
      toast.error(e.message || "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card id="book" className="border shadow-sm">
      <CardHeader>
        <CardTitle>Book an appointment</CardTitle>
        <p className="text-muted-foreground">
          Submit your details and our staff will contact you to confirm your appointment time and discuss your needs.
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input 
                id="firstName" 
                placeholder="Jane" 
                {...form.register("firstName")} 
              />
              {form.formState.errors.firstName && (
                <p className="text-destructive text-sm">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input 
                id="lastName" 
                placeholder="Doe" 
                {...form.register("lastName")} 
              />
              {form.formState.errors.lastName && (
                <p className="text-destructive text-sm">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Preferred contact method</Label>
            <RadioGroup
              className="grid grid-cols-2 gap-2 sm:max-w-xs"
              value={contactMethod}
              onValueChange={(val) => {
                form.setValue("contactMethod", val as "email" | "phone");
                form.setValue("contact", ""); // Clear contact when method changes
              }}
            >
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem id="email" value="email" />
                <Label htmlFor="email" className="cursor-pointer">Email</Label>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem id="phone" value="phone" />
                <Label htmlFor="phone" className="cursor-pointer">Phone</Label>
              </div>
            </RadioGroup>

            <div className="grid gap-2 sm:max-w-md">
              <Label htmlFor="contact">
                {contactMethod === "email" ? "Email address" : "Phone number"}
              </Label>
              <Input
                id="contact"
                placeholder={contactMethod === "email" ? "jane@example.com" : "+1 555 123 4567"}
                type={contactMethod === "email" ? "email" : "tel"}
                {...form.register("contact")}
              />
              {form.formState.errors.contact && (
                <p className="text-destructive text-sm">{form.formState.errors.contact.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Submitting..." : "Request appointment"}
            </Button>
            <p className="text-muted-foreground text-sm">
              Our staff will contact you within 24 hours to confirm your appointment details.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}