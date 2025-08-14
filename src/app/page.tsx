"use client";

import { useAuthModals } from "@components/Modals";
import { Header } from "@components/Header";
import { Hero } from "@components/Hero";
import { BookAppointmentForm } from "@components/forms/BookAppointmentForm";
import { Features } from "@components/sections/Features";
import { Footer } from "@components/Footer";
import { Toaster } from "@components/ui/sonner";


export default function Page() {
  const { Modals, openSignIn, openSignUp } = useAuthModals();

  return (
    <div className="min-h-dvh bg-background">
      <Header onOpenSignIn={openSignIn} onOpenSignUp={openSignUp} />
      <main className="mx-auto max-w-screen-xl px-4">
        <Hero />
        <section className="pb-12">
          <BookAppointmentForm />
        </section>
        <Features />
      </main>
      <Footer />
      <Modals />
      <Toaster richColors />
    </div>
  );
}