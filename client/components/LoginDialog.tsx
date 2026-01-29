import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const body = isSignUp 
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isSignUp ? "Sign up failed" : "Login failed"));
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Check if admin account and set admin mode
      if (data.user.email === "admin@gmail.com") {
        localStorage.setItem("isAdmin", "true");
        window.location.href = "/admin";
      } else {
        // Redirect normal users to user page
        window.location.href = "/user";
      }

      toast({
        title: "Success",
        description: isSignUp 
          ? `Welcome, ${data.user.name}! Account created successfully.`
          : `Welcome back, ${data.user.name}!`,
      });

      onOpenChange(false);
      setName("");
      setEmail("");
      setPassword("");
      setIsSignUp(false);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.name === 'AbortError' 
          ? "Request timeout - server not responding"
          : error.message 
        : isSignUp ? "Sign up failed" : "Login failed";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create Account" : "Login"}</DialogTitle>
          <DialogDescription>
            {isSignUp 
              ? "Create a new account to book appointments and access your profile"
              : "Sign in to your account to access your bookings and profile"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                disabled={isLoading}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (isSignUp ? "Creating account..." : "Signing in...")
              : (isSignUp ? "Create Account" : "Sign In")}
          </Button>
        </form>
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="text-blue-600 hover:underline"
            disabled={isLoading}
          >
            {isSignUp 
              ? "Already have an account? Sign In"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
