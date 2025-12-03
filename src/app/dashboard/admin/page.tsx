"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { Users, Shield, Search, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { bootstrapFlyboardProfile, getAllUsers, updateUserGlobalRole } from "@/lib/supabase/client-utils";

interface User {
  id: string;
  flyid: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  global_role: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Vérifier le profil
      const profile = await bootstrapFlyboardProfile();
      
      if (profile?.global_role !== 'super_admin') {
        router.push("/dashboard");
        return;
      }

      setIsSuperAdmin(true);
      loadUsers();
    } catch (error) {
      console.error("Erreur:", error);
      router.push("/dashboard");
    }
  };

  const loadUsers = async () => {
    try {
      const usersList = await getAllUsers();
      setUsers(usersList || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await updateUserGlobalRole(userId, newRole);

      await loadUsers();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la mise à jour du rôle");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-500/20 text-purple-700 border-purple-300";
      case "admin":
        return "bg-blue-500/20 text-blue-700 border-blue-300";
      case "member":
        return "bg-green-500/20 text-green-700 border-green-300";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-300";
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen light-blue-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold vibrant-accent-text">
                  Administration
                </h1>
                <p className="text-gray-600">Gérez les rôles et permissions des utilisateurs</p>
              </div>
            </div>
          </motion.div>

          {/* Recherche */}
          <GlassCard className="mb-6">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
          </GlassCard>

          {/* Liste des utilisateurs */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassCard>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center text-white font-semibold">
                          {user.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.display_name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.global_role)}`}>
                          {user.global_role === "super_admin" && "Super Admin"}
                          {user.global_role === "admin" && "Admin"}
                          {user.global_role === "member" && "Membre"}
                          {user.global_role === "viewer" && "Viewer"}
                        </span>
                        <select
                          value={user.global_role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          className="px-3 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="member">Membre</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

