export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span className="font-semibold">Version 1.1.0</span>
            <span className="hidden md:inline">•</span>
            <span>Built December 13, 2025</span>
            <span className="hidden md:inline">•</span>
            <a
              href="https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Project GitHub
            </a>
          </div>
          <div className="text-center md:text-right">
            <p>
              Released under{" "}
              <a
                href="https://creativecommons.org/publicdomain/zero/1.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                CC0-1.0 License
              </a>
              {" "}- Public Domain
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
