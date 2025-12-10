"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Users, Plus, Edit, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProject, bootstrapFlyboardProfile, getProjectSpecs, getProjectMembers, getProjectProposals, deleteProject, getProjectUserRole } from "@/lib/supabase/client-utils";

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "proposals" | "notes">("overview");
  const [canEdit, setCanEdit] = useState(false);
  const [permissions, setPermissions] = useState<{
    role: 'owner' | 'manager' | 'editor' | 'viewer' | null;
    isOwner: boolean;
    isManager: boolean;
    isEditor: boolean;
    isViewer: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreateProposals: boolean;
    canCreateNotes: boolean;
    canManageMembers: boolean;
    canCreateSpecs: boolean;
    canEditSpecs: boolean;
  } | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [specs, setSpecs] = useState<any[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      loadMembers();
    }
  }, [project, projectId]);

  useEffect(() => {
    if (activeTab === "proposals") {
      loadProposals();
    } else if (activeTab === "specs") {
      loadSpecs();
    }
  }, [activeTab, projectId]);

  const loadProject = async () => {
    try {
      const projectData = await getProject(projectId);
      setProject(projectData);
      
      // Charger les permissions de l'utilisateur
      const userPermissions = await getProjectUserRole(projectId);
      setPermissions(userPermissions);
      setCanEdit(userPermissions.canEdit);
      
      const profile = await bootstrapFlyboardProfile();
      if (profile?.id) {
        setCurrentUserId(profile.id);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    setLoadingProposals(true);
    try {
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('flyboard_project_proposals')
        .select(`
          *,
          proposer:flyboard_profiles!proposer_id(display_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(6); // Limiter à 6 pour la vue rapide

      if (proposalsError) {
        console.error("Erreur lors du chargement des propositions:", proposalsError);
        return;
      }

      setProposals(proposalsData || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingProposals(false);
    }
  };

  const loadSpecs = async () => {
    setLoadingSpecs(true);
    try {
      const specsData = await getProjectSpecs(projectId);
      setSpecs(specsData || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingSpecs(false);
    }
  };

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      // Charger les membres depuis Supabase
      let membersList: any[] = await getProjectMembers(projectId);

      // Récupérer le propriétaire du projet et l'ajouter s'il n'est pas déjà dans la liste
      if (project?.owner_id) {
        const ownerInList = membersList.find((m: any) => m.member?.id === project.owner_id);
        
        if (!ownerInList) {
          // Récupérer le profil du propriétaire
          const { data: ownerProfile, error: ownerError } = await supabase
            .from('flyboard_profiles')
            .select('id, display_name, avatar_url, flyid')
            .eq('id', project.owner_id)
            .single();

          if (ownerProfile && !ownerError) {
            // Récupérer l'email du propriétaire
            let ownerEmail = null;
            if (ownerProfile.flyid) {
              const { data: flyAccount } = await supabase
                .from('fly_accounts')
                .select('email')
                .eq('id', ownerProfile.flyid)
                .single();
              ownerEmail = flyAccount?.email || null;
            }

            // Ajouter le propriétaire en premier dans la liste
            const ownerMember = {
              id: `owner-${project.owner_id}`,
              project_id: projectId,
              member_id: ownerProfile.id,
              project_role: 'owner',
              member: {
                id: ownerProfile.id,
                display_name: ownerProfile.display_name,
                avatar_url: ownerProfile.avatar_url,
                email: ownerEmail,
              }
            };
            
            membersList = [ownerMember, ...membersList];
          }
        }
      }

      setMembers(membersList);
    } catch (error) {
      console.error("Erreur lors du chargement des membres:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/20 text-green-700 border-green-300";
      case "rejected":
        return "bg-red-500/20 text-red-700 border-red-300";
      case "withdrawn":
        return "bg-gray-500/20 text-gray-700 border-gray-300";
      default:
        return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
    }
  };

  const getProposalStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Rejetée";
      case "withdrawn":
        return "Retirée";
      default:
        return "En attente";
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

  const getPriorityColor = (priority: string) => {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/20 text-purple-700 border-purple-300";
      case "manager":
        return "bg-blue-500/20 text-blue-700 border-blue-300";
      case "editor":
        return "bg-green-500/20 text-green-700 border-green-300";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "manager":
        return "Gestionnaire";
      case "editor":
        return "Éditeur";
      default:
        return "Viewer";
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.title}" ? Cette action est irréversible et supprimera toutes les données associées (propositions, spécifications, notes, membres).`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteProject(projectId);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du projet: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen light-blue-bg">
        <Navigation />
        <main className="pt-20 md:pt-24 px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold vibrant-accent-text">
                  {project.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              {project.description && (
                <p className="text-gray-600">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {permissions?.canEdit && (
                <Link
                  href={`/dashboard/projects/${projectId}/edit`}
                  className="glass-card px-4 py-2 text-sm font-semibold text-gray-900 rounded-full flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>
              )}
              {permissions?.canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="glass-card px-4 py-2 text-sm font-semibold text-red-600 rounded-full flex items-center gap-2 hover:shadow-lg transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
              <Link
                href={`/dashboard/projects/${projectId}/specs`}
                className="glass-card px-4 py-2 text-sm font-semibold text-gray-900 rounded-full flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <FileText className="w-4 h-4" />
                Cahiers des charges
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Vue d&apos;ensemble
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "specs"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Cahier des charges
            </button>
            <button
              onClick={() => setActiveTab("proposals")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "proposals"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Propositions
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "notes"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Notes & Idées
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard>
                <h3 className="text-lg font-semibold mb-4">Informations</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Priorité:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`} />
                      <span className="font-medium capitalize">{project.priority}</span>
                    </div>
                  </div>
                  {project.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Catégorie:</span>
                      <span className="font-medium capitalize">{project.category}</span>
                    </div>
                  )}
                  {project.deadline && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {new Date(project.deadline).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Membres
                  </h3>
                  {permissions?.canManageMembers && (
                    <Link
                      href={`/dashboard/projects/${projectId}/members`}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Gérer →
                    </Link>
                  )}
                </div>
                
                {loadingMembers ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">Aucun membre assigné</p>
                    {permissions?.canManageMembers && (
                      <Link
                        href={`/dashboard/projects/${projectId}/members`}
                        className="glass-button-accent px-4 py-2 text-xs font-semibold text-white rounded-full inline-flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        Ajouter un membre
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.slice(0, 5).map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {member.member?.display_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.member?.display_name || "Utilisateur"}
                            </p>
                            {member.member?.email && (
                              <p className="text-xs text-gray-500 truncate">
                                {member.member.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getRoleColor(member.project_role)}`}>
                          {getRoleLabel(member.project_role)}
                        </span>
                      </div>
                    ))}
                    {members.length > 5 && (
                      <div className="pt-2 border-t border-gray-200">
                        <Link
                          href={`/dashboard/projects/${projectId}/members`}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Voir tous les membres ({members.length}) →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>

              {(permissions?.canEdit || permissions?.canDelete) && (
                <GlassCard>
                  <h3 className="text-lg font-semibold mb-4">Actions</h3>
                  <div className="space-y-2">
                    {permissions?.canEdit && (
                      <Link
                        href={`/dashboard/projects/${projectId}/edit`}
                        className="w-full glass-card px-4 py-2 text-sm font-semibold text-gray-900 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier le projet
                      </Link>
                    )}
                    {permissions?.canDelete && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting}
                        className="w-full glass-card px-4 py-2 text-sm font-semibold text-red-600 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? 'Suppression...' : 'Supprimer le projet'}
                      </button>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Cahiers des charges</h2>
                {permissions?.canCreateSpecs && (
                  <Link
                    href={`/dashboard/projects/${projectId}/specs/new`}
                    className="glass-button-accent px-4 py-2 text-sm font-semibold text-white rounded-full flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nouveau cahier des charges
                  </Link>
                )}
              </div>

              {loadingSpecs ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : !specs || specs.length === 0 ? (
                <GlassCard>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Aucun cahier des charges créé pour ce projet.</p>
                    {permissions?.canCreateSpecs && (
                      <Link
                        href={`/dashboard/projects/${projectId}/specs/new`}
                        className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full inline-flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Créer le premier cahier des charges
                      </Link>
                    )}
                  </div>
                </GlassCard>
              ) : (
                <div>
                  <div className="mb-4">
                    <Link
                      href={`/dashboard/projects/${projectId}/specs`}
                      className="glass-card px-4 py-2 text-sm font-semibold text-gray-900 rounded-full inline-flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                      Voir tous les cahiers des charges ({specs.length})
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specs.slice(0, 6).map((spec: any) => (
                      <GlassCard key={spec.id} className="hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{spec.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">{spec.category === 'general' ? '📄' : spec.category === 'technical' ? '⚙️' : spec.category === 'design' ? '🎨' : spec.category === 'marketing' ? '📢' : spec.category === 'business' ? '💼' : spec.category === 'legal' ? '⚖️' : '📌'}</span>
                              <span className="text-xs text-gray-500 capitalize">{spec.category}</span>
                            </div>
                          </div>
                        </div>
                        {spec.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{spec.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">v{spec.version}</span>
                          <Link
                            href={`/dashboard/projects/${projectId}/specs/${spec.id}`}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Voir →
                          </Link>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "proposals" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Propositions</h2>
                {permissions?.canCreateProposals && (
                  <Link
                    href={`/dashboard/projects/${projectId}/proposals/new`}
                    className="glass-button-accent px-4 py-2 text-sm font-semibold text-white rounded-full flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle proposition
                  </Link>
                )}
              </div>

              {loadingProposals ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement des propositions...</p>
                </div>
              ) : proposals.length === 0 ? (
                <GlassCard>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Aucune proposition pour ce projet</p>
                    {permissions?.canCreateProposals && (
                      <Link
                        href={`/dashboard/projects/${projectId}/proposals/new`}
                        className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full inline-flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Créer la première proposition
                      </Link>
                    )}
                  </div>
                </GlassCard>
              ) : (
                <div className="space-y-6">
                  {/* Statistiques rapides */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {proposals.filter(p => p.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600">En attente</div>
                      </div>
                    </GlassCard>
                    <GlassCard>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {proposals.filter(p => p.status === 'accepted').length}
                        </div>
                        <div className="text-sm text-gray-600">Acceptées</div>
                      </div>
                    </GlassCard>
                    <GlassCard>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {proposals.filter(p => p.status === 'rejected').length}
                        </div>
                        <div className="text-sm text-gray-600">Rejetées</div>
                      </div>
                    </GlassCard>
                    <GlassCard>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {proposals.length}
                        </div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Liste des propositions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Dernières propositions</h3>
                      <Link
                        href={`/dashboard/projects/${projectId}/proposals`}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Voir toutes →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {proposals.map((proposal) => (
                        <GlassCard key={proposal.id} className="hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {proposal.title}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getProposalStatusColor(proposal.status)}`}>
                                  {getProposalStatusLabel(proposal.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {proposal.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {proposal.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center text-white text-xs font-semibold">
                                {proposal.proposer?.display_name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span>{proposal.proposer?.display_name || "Utilisateur"}</span>
                            </div>
                            <span>
                              {new Date(proposal.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short"
                              })}
                            </span>
                          </div>

                          {(proposal.estimated_duration || proposal.estimated_cost) && (
                            <div className="flex items-center gap-4 text-xs text-gray-600 pt-3 border-t border-gray-200">
                              {proposal.estimated_duration && (
                                <div>
                                  <span className="text-gray-500">Durée:</span>{" "}
                                  <span className="font-medium">{proposal.estimated_duration}</span>
                                </div>
                              )}
                              {proposal.estimated_cost && (
                                <div>
                                  <span className="text-gray-500">Coût:</span>{" "}
                                  <span className="font-medium">
                                    {proposal.estimated_cost.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Notes & Idées</h2>
                <Link
                  href={`/dashboard/projects/${projectId}/notes`}
                  className="glass-button-accent px-4 py-2 text-sm font-semibold text-white rounded-full flex items-center gap-2"
                >
                  Voir toutes les notes
                </Link>
              </div>
              <GlassCard>
                <p className="text-gray-600 mb-4">
                  {permissions?.canCreateNotes 
                    ? "Partagez vos notes, idées et rappels pour ce projet."
                    : "Consultez les notes, idées et rappels de ce projet. Vous n'avez pas la permission de créer des notes."}
                </p>
                {permissions?.canCreateNotes && (
                  <Link
                    href={`/dashboard/projects/${projectId}/notes`}
                    className="glass-button-accent px-4 py-2 text-sm font-semibold text-white rounded-full inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Créer une note
                  </Link>
                )}
              </GlassCard>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2 text-gray-900">Supprimer le projet ?</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>"{project.title}"</strong> ?
              <br /><br />
              Cette action est <strong className="text-red-600">irréversible</strong> et supprimera :
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Toutes les propositions</li>
                <li>Tous les cahiers des charges</li>
                <li>Toutes les notes</li>
                <li>Tous les membres</li>
                <li>Le projet lui-même</li>
              </ul>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 glass-card px-4 py-2 text-sm font-semibold text-gray-900 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="flex-1 glass-card px-4 py-2 text-sm font-semibold text-red-600 rounded-lg hover:shadow-lg transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}