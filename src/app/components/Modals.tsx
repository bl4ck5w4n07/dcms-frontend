"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";
import { RoleRedirect } from "./RoleRedirect";

export function useAuthModals() {
  const [open, setOpen] = useState<"none" | "signin" | "signup">("none");
  const openSignIn = () => setOpen("signin");
  const openSignUp = () => setOpen("signup");
  const close = () => setOpen("none");

  const Modals = () => (
    <>
      <RoleRedirect />
      <Dialog open={open === "signin"} onOpenChange={(v) => setOpen(v ? "signin" : "none")}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in</DialogTitle>
          </DialogHeader>
          <SignInForm onSuccess={close} />
        </DialogContent>
      </Dialog>

      <Dialog open={open === "signup"} onOpenChange={(v) => setOpen(v ? "signup" : "none")}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your account</DialogTitle>
          </DialogHeader>
          <SignUpForm onSuccess={close} />
        </DialogContent>
      </Dialog>
    </>
  );

  return { Modals, openSignIn, openSignUp };
}
