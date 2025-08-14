export function Footer() {
  return (
    <footer className="mt-12 border-t">
      <div className="mx-auto max-w-screen-xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground">© {new Date().getFullYear()} NextCare. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
