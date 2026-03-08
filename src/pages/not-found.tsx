import { Button } from "@/components/ui/button";
import { HardDrive } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="text-center relative z-10 px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <HardDrive className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">DriveX</span>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <p className="text-8xl font-bold tracking-tight text-primary/20 select-none">
            404
          </p>
        </div>

        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => window.history.back()} variant="outline">
            Go back
          </Button>
          <Button onClick={() => (window.location.href = "/")}>
            Go to Drive
          </Button>
        </div>
      </div>
    </div>
  );
}
