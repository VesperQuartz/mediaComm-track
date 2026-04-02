"use client";

import { format } from "date-fns";
import { Lock, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export const TopBar = ({ user }: { user: any }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between bg-track-deep-red px-6 text-white shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-track-red font-serif text-xl font-black">
          C
        </div>
        <div>
          <h1 className="font-serif text-lg leading-tight font-bold">
            Medicaid Group MediaComm Track
          </h1>
          <p className="text-[10px] text-white/60">
            Medicaid Group · Communications Team
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden text-right md:block">
          <div className="text-xs font-medium text-white/70">
            {mounted ? format(new Date(), "EEE, d MMMM yyyy") : "..."}
          </div>
        </div>

        {session.data?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-lg px-2 text-white hover:bg-white/10 hover:text-white"
                  {...props}
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-track-red text-xs font-bold shadow-inner">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-[10px] leading-none font-bold">
                      {user?.name || "User"}
                    </p>
                    <p className="mt-1 text-[9px] leading-none text-white/60">
                      {user?.email}
                    </p>
                  </div>
                </Button>
              )}
            />
            <DropdownMenuContent
              align="end"
              className="mt-2 w-56 rounded-xl border-track-border shadow-xl"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-serif text-track-dark-red">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/change-password")}
                  className="cursor-pointer rounded-lg py-2.5 text-xs transition-colors focus:bg-track-pale-red focus:text-track-red"
                >
                  <Lock className="mr-2 size-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer rounded-lg py-2.5 text-xs text-red-600 transition-colors focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => router.push("/login")}>Login</Button>
        )}
      </div>
    </div>
  );
};
