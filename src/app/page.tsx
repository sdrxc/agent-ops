"use client";

import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { HomePageFeature } from "@/features/HomePage/Homepage";
import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";

interface UserApiResponse {
  status: string;
  action: string;
  user: {
    userid: number;
    usertype: string;
    role: string;
    username: string;
    email: string;
    accessdetails: { permissions: string[] };
    createdon: string;
    lastupdated: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const env = process.env.NEXT_PUBLIC_APP_ENV;

    const loadUser = async () => {
      try {
        // 🚀 Local environment: use dummy user
        if (env === "local") {
          const dummyUser = {
            email: "local@example.com",
            username: "Local User",
            usertype: "internal",
            role: "developer",
          };

          sessionStorage.setItem("email", dummyUser.email);
          sessionStorage.setItem("user_name", dummyUser.username);
          sessionStorage.setItem("role", dummyUser.usertype);
          sessionStorage.setItem("role", dummyUser.role);
          return;
        }

        // 🌐 Call the real endpoint
        const response: AxiosResponse<UserApiResponse> = await axios.get("/api/me", {
          signal: controller.signal,
        });

        const api = response.data;
        const user = api?.user;

        if (user?.email) {
          sessionStorage.setItem("email", user.email);
          sessionStorage.setItem("user_name", user.username);
          sessionStorage.setItem("user_type", user.usertype);
          sessionStorage.setItem("role", user.role);
          sessionStorage.setItem("userid", String(user.userid));
        } else {
          console.warn("User details missing or invalid format", api);
        }
      } catch (error: any) {
        if (axios.isCancel(error)) {
          console.log("Request cancelled");
        } else {
          console.error("Error loading user:", error);
        }
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();

    return () => controller.abort();
  }, []);

  if (loadingUser) {
    return (
      <div className="loading-screen flex h-screen items-center justify-center">
        Loading user...
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <HomePageFeature />
      </div>
    </Layout>
  );
}
