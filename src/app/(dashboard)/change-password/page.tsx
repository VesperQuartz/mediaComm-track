"use client";

import { ChevronLeft, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password updated successfully");
        router.push("/");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-2 text-track-soft hover:text-track-red hover:bg-track-pale-red"
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>

        <Card className="overflow-hidden rounded-2xl border-none shadow-xl">
          <div className="bg-track-deep-red p-6 text-white text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-track-red font-serif text-xl font-black mb-3 shadow-lg">
              <Lock className="size-5" />
            </div>
            <h1 className="font-serif text-xl font-bold leading-tight">
              Update Password
            </h1>
            <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest font-semibold">
              Secure your account
            </p>
          </div>

          <CardContent className="bg-white p-6">
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="text-[10px] font-bold text-track-mid uppercase tracking-wider"
                >
                  Current Password
                </Label>
                <div className="relative">
                  <KeyRound
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-track-soft"
                  />
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-11 pl-10 rounded-xl border-track-border focus:border-track-red focus:ring-track-red/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-[10px] font-bold text-track-mid uppercase tracking-wider"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-track-soft"
                  />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 pl-10 rounded-xl border-track-border focus:border-track-red focus:ring-track-red/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[10px] font-bold text-track-mid uppercase tracking-wider"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <ShieldCheck
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-track-soft"
                  />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
