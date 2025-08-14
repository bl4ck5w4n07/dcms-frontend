export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 pt-14 pb-10 sm:pt-20 sm:pb-14">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <h1>Healthcare, simplified.</h1>
            <p>Book appointments in seconds and manage your health securely. No phone calls, no waiting rooms—just care.</p>
            <div className="flex flex-wrap gap-2">
              <a href="#book" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:opacity-95">Book an appointment</a>
              <a href="#features" className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent">Learn more</a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-accent to-background">
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-md bg-muted" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
