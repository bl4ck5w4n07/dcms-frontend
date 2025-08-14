export function Features() {
  const items = [
    { id: "booking", title: "Fast booking", desc: "Schedule in seconds with instant confirmation." },
    { id: "secure", title: "Secure", desc: "Your data is encrypted at rest and in transit." },
    { id: "reminders", title: "Smart reminders", desc: "Email or SMS confirmations and reminders." },
  ];
  return (
    <section id="features" className="border-t">
      <div className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((it) => (
            <div key={it.id} className="rounded-lg border p-5">
              <h3>{it.title}</h3>
              <p className="text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
