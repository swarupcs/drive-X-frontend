import { useState } from "react";
import { useLocation } from "wouter";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, HardDrive, Cloud, Shield, Zap, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRule {
  label: string;
  test: (p: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p) => /[0-9]/.test(p) },
];

const features = [
  { icon: Cloud, text: "Store and access files from anywhere" },
  { icon: Shield, text: "Enterprise-grade security for your data" },
  { icon: Zap, text: "Lightning-fast uploads and downloads" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [, navigate] = useLocation();

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!passwordValid) {
      setPasswordTouched(true);
      toast.error("Weak password", { description: "Please meet all password requirements." });
      return;
    }
    setLoading(true);
    try {
      const result = await authService.register({ name, email, password });
      dispatch(setCredentials({ user: result.user, token: result.token }));
      navigate("/drive");
    } catch (err: unknown) {
      toast.error("Registration failed", {
        description: err instanceof Error ? err.message : "Failed to create account",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <HardDrive className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Drive-X</span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Get started<br />for free today.
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Join thousands of users who trust Drive-X to store and share their most important files.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">© 2026 Drive-X. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <HardDrive className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Drive-X</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Create an account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                required
                autoComplete="new-password"
                className="h-10"
                data-testid="input-password"
              />
              {/* Password requirements — shown once user starts typing */}
              {passwordTouched && (
                <ul className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(password);
                    return (
                      <li key={rule.label} className={cn("flex items-center gap-1.5 text-[11px]", ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                        {ok
                          ? <Check className="h-3 w-3 flex-shrink-0" />
                          : <X className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
                        }
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
