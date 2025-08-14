"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useAuth } from "../auth/auth-context";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["patient", "staff", "admin", "dentist"]).default("patient"),
});

export type SignInValues = z.infer<typeof schema>;

export function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const [pending, setPending] = useState(false);
  const [needsOtp, setNeedsOtp] = useState<{ tempToken: string; email: string; role: string } | null>(null);
  const [otp, setOtp] = useState("");

  const form = useForm<SignInValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", role: "patient" } });

  const onSubmit = async (values: SignInValues) => {
    try {
      setPending(true);
      const res = await fetch("/api/auth/sign-in", { method: "POST", body: JSON.stringify(values) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");
      if (data.needsOtp) {
        setNeedsOtp({ tempToken: data.tempToken, email: values.email, role: values.role });
        toast.message("Enter the 6-digit OTP: 123456 (mock)");
      } else {
        login(data.user);
        toast.success("Signed in");
        onSuccess?.();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to sign in");
    } finally { setPending(false); }
  };

  const verifyOtp = async () => {
    try {
      if (!needsOtp) return;
      setPending(true);
      const res = await fetch("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ token: needsOtp.tempToken, otp, email: needsOtp.email, role: needsOtp.role }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP failed");
      login(data.user);
      toast.success("OTP verified. Signed in.");
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "OTP verification failed");
    } finally { setPending(false); }
  };

  const requestReset = async () => {
    try {
      const email = form.getValues("email");
      if (!email) return toast.error("Enter your email first");
      const res = await fetch("/api/auth/request-reset", { method: "POST", body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      toast.success("Password reset email sent (mock)");
    } catch (e: any) {
      toast.error(e.message || "Failed to request reset");
    }
  };

  if (needsOtp) {
    return (
      <div className="grid gap-4">
        <p>We sent a 6-digit OTP to {needsOtp.email}. Use 123456 for this mock.</p>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button onClick={verifyOtp} disabled={pending || otp.length !== 6}>{pending ? "Verifying..." : "Verify OTP"}</Button>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</Button>
        <button type="button" className="underline" onClick={requestReset}>Forgot password?</button>
        <span className="text-muted-foreground">Tip: use password 'skip-otp' to bypass OTP (mock)</span>
      </div>
    </form>
  );
}
