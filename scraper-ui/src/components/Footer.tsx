const Footer = () => (
  <footer className="relative z-10 border-t-2 border-border bg-card px-4 py-8 sm:px-6">
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <span className="font-mono text-sm font-medium text-foreground">PageGrab</span>
      <div className="flex gap-8 font-mono text-sm">
        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</a>
        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">GitHub</a>
      </div>
    </div>
  </footer>
);

export default Footer;
