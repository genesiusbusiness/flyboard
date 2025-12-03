"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Utilisateur connecté → rediriger vers le dashboard
      router.push("/dashboard");
    } else {
      // Utilisateur non connecté → rediriger vers la connexion
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen light-blue-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
