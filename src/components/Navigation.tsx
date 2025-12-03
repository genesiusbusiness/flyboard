"use client";

import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { bootstrapFlyboardProfile } from "@/lib/supabase/client-utils";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Vérifier si super admin
      try {
        const profile = await bootstrapFlyboardProfile();
        setIsSuperAdmin(profile?.global_role === 'super_admin');
      } catch (error) {
        console.error("Erreur vérification admin:", error);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Ne pas afficher la navigation sur les pages d'auth
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 blur-bg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/favicon.png" 
                alt="FlyBoard" 
                className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl shadow-lg object-cover border-2 border-white/30"
              />
            </div>
            <span className="text-lg md:text-xl font-semibold vibrant-accent-text">FlyBoard</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            {user && (
              <>
                {isSuperAdmin && (
                  <Link
                    href="/dashboard/admin"
                    className="text-sm md:text-base text-gray-700 font-medium glass-card px-4 py-2 md:px-5 md:py-2.5 rounded-full whitespace-nowrap flex items-center justify-center min-h-[44px] shadow-lg hover:shadow-xl transition-all duration-300 gap-2 border border-gray-300/50"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm md:text-base text-gray-700 font-medium glass-card px-4 py-2 md:px-5 md:py-2.5 rounded-full whitespace-nowrap flex items-center justify-center min-h-[44px] shadow-lg hover:shadow-xl transition-all duration-300 gap-2 border border-gray-300/50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Déconnexion</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

