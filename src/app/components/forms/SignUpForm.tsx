"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "At least 6 characters"),
  role: z.enum(["patient", "staff", "admin", "dentist"]).default("patient"),
});

export type SignUpValues = z.infer<typeof schema>;

export function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const [pending, setPending] = useState(false);
  const form = useForm<SignUpValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "", role: "patient" } });

  const onSubmit = async (values: SignUpValues) => {
    try {
      setPending(true);
      const res = await fetch("/api/auth/sign-up", { method: "POST", body: JSON.stringify(values) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      toast.success("Account created (mock). You can sign in now.");
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to sign up");
    } finally { setPending(false); }
  };

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" placeholder="Jane Doe" {...form.register("name")} />
        {form.formState.errors.name && <p className="text-destructive">{form.formState.errors.name.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
        {form.formState.errors.email && <p className="text-destructive">{form.formState.errors.email.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
        {form.formState.errors.password && <p className="text-destructive">{form.formState.errors.password.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label>Role (dev-only)</Label>
        <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v as any)}>
          <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="patient">Patient</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="dentist">Dentist</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create account"}</Button>
    </form>
  );
}
