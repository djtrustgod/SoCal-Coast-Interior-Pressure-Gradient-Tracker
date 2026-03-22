"use client";

import { useEffect, useState } from "react";

function ZuluClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(now.getUTCDate()).padStart(2, "0");
      setTime(
        `${mm}/${dd} ${now.toISOString().slice(11, 16)}Z`
      );
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return <span className="font-mono">{time}</span>;
}

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span className="font-semibold">Version 2.0.2</span>
            <span className="hidden md:inline">•</span>
            <span>Built March 21, 2026</span>
            <span className="hidden md:inline">•</span>
            <a
              href="https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Project GitHub
            </a>
            <span className="hidden md:inline">•</span>
            <a
              href="https://www.weather.gov/lox/LAXGRDNEW"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              LAX NWS Gradients
            </a>
            <span className="hidden md:inline">•</span>
            <ZuluClock />
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
