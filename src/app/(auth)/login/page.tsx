"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Invalid credentials");
      } else {
        toast.success("Login successful");
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-track-bg px-4">
      <Card className="w-full max-w-md overflow-hidden rounded-2xl border-none shadow-xl">
        <div className="bg-track-deep-red p-8 text-white text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-track-red font-serif text-2xl font-black mb-4 shadow-lg">
            C
          </div>
          <h1 className="font-serif text-2xl font-bold leading-tight">
            MediaComm Track
          </h1>
          <p className="text-xs text-white/60 mt-1 uppercase tracking-widest font-semibold">
            Medicaid Group Portal
          </p>
        </div>

        <CardContent className="bg-white p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-track-mid uppercase tracking-wider">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-track-soft" />
                <Input
                  type="email"
                  placeholder="name@medicaid.group"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10 rounded-xl border-track-border focus:border-track-red focus:ring-track-red/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold text-track-mid uppercase tracking-wider">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-track-soft" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 rounded-xl border-track-border focus:border-track-red focus:ring-track-red/20"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-track-red text-white font-bold text-sm shadow-md hover:bg-track-deep-red transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In to Track"
              )}
            </Button>
          </form>
        </CardContent>

        <div className="bg-track-pale-red py-4 text-center border-t border-track-border/30">
          <p className="text-[10px] text-track-soft font-medium">
            Authorized Personnel Only
          </p>
        </div>
      </Card>
    </div>
  );
}
