import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Settings, Home } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <div>
            <h1 className="text-2xl font-bold">SoCal Pressure Gradient</h1>
            <p className="text-sm text-muted-foreground">
              Coast-Interior MSLP Tracker
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="icon">
              <Home className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          <Link href="/locations">
            <Button variant="outline" size="icon">
              <Settings className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Manage Locations</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
