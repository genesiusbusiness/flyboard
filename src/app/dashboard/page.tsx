"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { Plus, FolderKanban, FileText, Users, Clock, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { bootstrapFlyboardProfile } from "@/lib/supabase/client-utils";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  deadline: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Bootstrap le profil
    try {
      const profileData = await bootstrapFlyboardProfile();
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Erreur bootstrap:", error);
    }

    loadProjects();
  };

  const loadProjects = async () => {
    try {
      const profile = await bootstrapFlyboardProfile();
      if (!profile || !profile.id) {
        setLoading(false);
        return;
      }

      const profileId = profile.id;

      // Charger les projets où l'utilisateur est propriétaire
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('flyboard_projects')
        .select('*')
        .eq('owner_id', profileId)
        .order('created_at', { ascending: false });

      if (ownedError) {
        console.error("Erreur lors du chargement des projets:", ownedError);
      }

      // Charger les projets où l'utilisateur est membre
      const { data: permissions, error: permError } = await supabase
        .from('flyboard_project_permissions')
        .select('project_id')
        .eq('member_id', profileId);

      let memberProjectIds: string[] = [];
      if (!permError && permissions) {
        memberProjectIds = permissions.map(p => p.project_id);
      }

      // Charger les projets où l'utilisateur est membre
      let memberProjects: any[] = [];
      if (memberProjectIds.length > 0) {
        const { data: memberProjectsData, error: memberError } = await supabase
          .from('flyboard_projects')
          .select('*')
          .in('id', memberProjectIds)
          .order('created_at', { ascending: false });

        if (!memberError && memberProjectsData) {
          memberProjects = memberProjectsData;
        }
      }

      // Combiner et dédupliquer les projets
      const allProjects = [...(ownedProjects || []), ...memberProjects];
      const uniqueProjects = Array.from(
        new Map(allProjects.map(p => [p.id, p])).values()
      );

      setProjects(uniqueProjects);
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700 border-green-300";
      case "in_progress":
        return "bg-blue-500/20 text-blue-700 border-blue-300";
      case "proposed":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
      case "draft":
        return "bg-gray-500/20 text-gray-700 border-gray-300";
      case "cancelled":
        return "bg-red-500/20 text-red-700 border-red-300";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "in_progress":
        return "En cours";
      case "proposed":
        return "Proposé";
      case "draft":
        return "Brouillon";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header avec bienvenue */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 vibrant-accent-text">
              Bonjour{profile?.display_name ? ` ${profile.display_name}` : ""} 👋
            </h1>
            <p className="text-gray-600 text-lg">Gérez vos projets et idées en un seul endroit</p>
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Link
              href="/dashboard/projects/new"
              className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nouveau projet</h3>
                  <p className="text-sm text-gray-600">Créer un projet</p>
                </div>
              </div>
            </Link>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{projects.length}</h3>
                  <p className="text-sm text-gray-600">Projets</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {projects.filter(p => p.status === "in_progress").length}
                  </h3>
                  <p className="text-sm text-gray-600">En cours</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {projects.filter(p => p.status === "completed").length}
                  </h3>
                  <p className="text-sm text-gray-600">Terminés</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Projets - Style post-it premium */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold vibrant-accent-text">Mes projets</h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement...</p>
              </div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl p-12 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 vibrant-accent-text">Aucun projet</h3>
                <p className="text-gray-600 mb-8">
                  Commencez par créer votre premier projet
                </p>
                <Link
                  href="/dashboard/projects/new"
                  className="glass-button-accent px-8 py-3 text-sm font-semibold text-white rounded-full inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Créer mon premier projet
                </Link>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <div className="glass-card rounded-2xl p-6 h-full cursor-pointer group hover:shadow-2xl transition-all duration-300">
                        {/* Header avec priorité */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getPriorityDot(project.priority)}`} />
                        </div>

                        {/* Titre */}
                        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:vibrant-accent-text transition-colors">
                          {project.title}
                        </h3>

                        {/* Description */}
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          {project.deadline && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-4 h-4" />
                              {new Date(project.deadline).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <FileText className="w-4 h-4" />
                            Voir
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {/* Carte "Nouveau projet" */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/dashboard/projects/new">
                    <div className="glass-card rounded-2xl p-6 h-full cursor-pointer group hover:shadow-2xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-purple-400">
                      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 vibrant-accent-text">
                          Nouveau projet
                        </h3>
                        <p className="text-sm text-gray-600">
                          Créer un nouveau projet
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
