"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Shield } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import axios from "axios";

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const isLocal = process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase() === "local";
  console.log('isLocal ', isLocal);

  const handleSSOLogin = async () => {
    // setIsLoading(true);
    // signIn(); // 👈 NextAuth SSO flow
    
    router.push("/");

  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/api/locallogin", {
        userEmail: email,
        userPassword: password,
      });

      if (res.status === 200) {
        router.push("/");
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating bg elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-xs rounded-2xl mb-4">
            <Bot className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Agentrix</h1>
          <p className="text-white/80 text-lg">AI Agent Management Platform</p>
        </div>

        {/* Login card */}
        <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isLocal
                ? "Sign in with your local account"
                : "Sign in to access your agent dashboard"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isLocal ? (
              // FORM-BASED LOGIN
              <form onSubmit={handleLocalLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-medium bg-linear-to-r from-[#30B7B5] to-[#EC7200] hover:from-[#2a9f9d] hover:to-[#d4630a] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </form>
            ) : (
              // SSO LOGIN
              <Button
                onClick={handleSSOLogin}
                disabled={isLoading}
                className="w-full h-12 text-lg font-medium bg-linear-to-r from-[#30B7B5] to-[#EC7200] hover:from-[#2a9f9d] hover:to-[#d4630a] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Continue with SSO</span>
                  </div>
                )}
              </Button>
            )}

            {/* Divider */}
            {!isLocal && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Secure Enterprise Login
                  </span>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="text-center text-sm text-gray-500 space-y-1">
              {isLocal ? (
                <p>Local login mode (testing only)</p>
              ) : (
                <>
                  <p>Protected by enterprise-grade security</p>
                  <p>Single Sign-On authentication required</p>
                </>
              )}
            </div>

            {/* Back to dashboard link */}
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-white/80 text-sm">
            Agentrix | Copyright Bayer © {currentYear}
          </p>
        </footer>
      </div>
    </div>
  );
};
