"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "next-auth/react";

export function SessionDebug() {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const { toast } = useToast();

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/debug/session");
      const data = await response.json();
      console.log("Session data:", data);
      setDetails(data);
      
      if (!data.session?.user?.organization_id) {
        toast({
          title: "No Organization",
          description: "User has no organization. Click 'Fix User' to resolve.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Session Check",
          description: `Organization ID: ${data.session.user.organization_id}`,
        });
      }
    } catch (error) {
      console.error("Session check error:", error);
      toast({
        title: "Error",
        description: "Failed to check session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fixUser = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/debug/fix-user", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fix user");
      }

      const data = await response.json();
      console.log("Fix result:", data);

      toast({
        title: "Success",
        description: "User fixed successfully. Signing out to refresh session...",
      });

      // Sign out to force a complete session refresh
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1500);
    } catch (error) {
      console.error("Fix user error:", error);
      toast({
        title: "Error",
        description: "Failed to fix user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={checkSession}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Session"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={fixUser}
          disabled={loading}
        >
          {loading ? "Fixing..." : "Fix User"}
        </Button>
      </div>
      
      {details && (
        <div className="bg-background border rounded-lg p-4 max-w-md max-h-96 overflow-auto">
          <pre className="text-xs">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
