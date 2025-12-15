"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useGlobalContext } from "../app/GlobalContextProvider";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Implement when the SSO is active
  // const { data: session } = useSession();
  const { user, loading, refreshUser } = useGlobalContext();
  
  console.log("user detils in model", user)


  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/auth/login"
      });
      onClose();
      // Clear any other local storage or state if needed
      localStorage.clear();
      sessionStorage.clear();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50">
      <div
        ref={modalRef}
        className="bg-background border border-border rounded-lg shadow-lg p-4 w-72 animate-in slide-in-from-top-2 duration-200"
      >
        {/* User info section */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              <h3 className="text-sm font-semibold text-foreground">
                {user?.userName ? user.userName.charAt(0).toUpperCase() : ""}
              </h3>
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{user?.userName}</h3>
            <p className="text-xs text-muted-foreground">{user?.userEmail}</p>
            <p className="text-xs text-muted-foreground">{user?.userRole}</p>
            <p className="text-xs text-muted-foreground">{user?.userID}</p>
          </div>
        </div>

        {/* Actions section */}
        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start h-8"
          onClick={handleLogout}
        >
          <LogOut className="h-3 w-3 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
