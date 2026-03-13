const Footer = () => (
  <footer className="relative z-10 bg-background px-6 pt-16 pb-10">
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <span className="font-bold text-sm text-[var(--text-main)]">PageGrab</span>
      <div className="flex gap-8 font-medium text-sm">
        <a href="#" className="text-[var(--text-main)] opacity-80 hover:opacity-100 transition-opacity">Twitter</a>
        <a href="#" className="text-[var(--text-main)] opacity-80 hover:opacity-100 transition-opacity">GitHub</a>
      </div>
    </div>
  </footer>
);

export default Footer;
