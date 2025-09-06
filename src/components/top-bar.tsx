"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings } from "lucide-react";
import { 
  SignInButton, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from "@clerk/nextjs";

export function TopBar() {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Badge variant="outline" className="text-xs">
          Live Data
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
        
        <SignedOut>
          <SignInButton>
            <Button variant="outline">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        
        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />
        </SignedIn>
      </div>
    </div>
  );
}
