"use client";


import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, User, X, Shield, Edit, Eye, Trash2, Users, Search } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { getProjectMembers, bootstrapFlyboardProfile, addProjectMember, updateProjectMemberPermissions, removeProjectMember, searchUsers, getAllUsers, getProject, getProjectUserRole } from "@/lib/supabase/client-utils";

interface Member {
  id: string;
  project_id: string;
  member_id: string;
  project_role: string;
  permissions: {
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_manage_members: boolean;
    can_manage_specs: boolean;
    can_manage_proposals: boolean;
  };
  member: {
    id: string;
    display_name: string;
    avatar_url?: string;
    email?: string;
  };
}

interface User {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
}

export default function ProjectMembersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [canManage, setCanManage] = useState(false);
  const [permissions, setPermissions] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      // Charger les membres du projet
      // Tous les membres du projet (n'importe quel rôle) peuvent voir tous les autres membres
      const membersList = await getProjectMembers(projectId);
      setMembers(membersList || []);

      // Vérifier les permissions pour la gestion (ajout/modification/suppression)
      const userPermissions = await getProjectUserRole(projectId);
      setPermissions(userPermissions);
      setCanManage(userPermissions.canManageMembers);

      // Si super admin, charger tous les utilisateurs
      const profile = await bootstrapFlyboardProfile();
      if (profile?.global_role === 'super_admin') {
        const usersList = await getAllUsers();
        setAllUsers(usersList || []);
      }

      setLoading(false);
    } catch (error: any) {
      // Si l'utilisateur n'est pas membre, afficher un message clair
      if (error?.message?.includes('membre')) {
        alert(error.message);
        router.push(`/dashboard/projects/${projectId}`);
      }
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !selectedRole || !selectedUser) return;

    try {
      await addProjectMember(projectId, selectedUserId, selectedRole);

      await loadData();
      setShowAddModal(false);
      setSelectedUserId("");
      setSelectedRole("viewer");
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error: any) {
      alert(error.message || "Erreur lors de l'ajout du membre");
    }
  };

  const handleUpdateRole = async (permissionId: string, newRole: string) => {
    try {
      await updateProjectMemberPermissions(projectId, permissionId, { project_role: newRole });
      await loadData();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la mise à jour");
    }
  };

  const handleRemoveMember = async (permissionId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce membre ?")) return;

    try {
      await removeProjectMember(projectId, permissionId);
      await loadData();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la suppression");
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

  // Recherche intelligente d'utilisateurs
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await searchUsers(query);
      
      // Filtrer les utilisateurs déjà membres
      const filtered = (users || []).filter(
        (user: User) => !members.some(m => m.member.id === user.id)
      );
      
      setSearchResults(filtered);
    } catch (error) {
      alert("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSelectedUserId("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au projet
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 vibrant-accent-text">
                Membres du projet
              </h1>
              <p className="text-gray-600">Gérez les membres et leurs permissions</p>
            </div>
            {canManage && (
              <button
                onClick={() => setShowAddModal(true)}
                className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter un membre
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassCard>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center text-white font-semibold">
                          {member.member.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.member.display_name}</h3>
                          {member.member.email && (
                            <p className="text-sm text-gray-600">{member.member.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {canManage ? (
                          <select
                            value={member.project_role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            className="px-3 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                          >
                            <option value="owner">Propriétaire</option>
                            <option value="manager">Gestionnaire</option>
                            <option value="editor">Éditeur</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(member.project_role)}`}>
                            {getRoleLabel(member.project_role)}
                          </span>
                        )}
                        {canManage && member.project_role !== "owner" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Eye className={`w-4 h-4 ${member.permissions.can_view ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={member.permissions.can_view ? 'text-gray-700' : 'text-gray-400'}>Voir</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Edit className={`w-4 h-4 ${member.permissions.can_edit ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={member.permissions.can_edit ? 'text-gray-700' : 'text-gray-400'}>Éditer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trash2 className={`w-4 h-4 ${member.permissions.can_delete ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={member.permissions.can_delete ? 'text-gray-700' : 'text-gray-400'}>Supprimer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className={`w-4 h-4 ${member.permissions.can_manage_members ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={member.permissions.can_manage_members ? 'text-gray-700' : 'text-gray-400'}>Gérer membres</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className={`w-4 h-4 ${member.permissions.can_manage_specs ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={member.permissions.can_manage_specs ? 'text-gray-700' : 'text-gray-400'}>Cahier des charges</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className={`w-4 h-4 ${member.permissions.can_manage_proposals ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={member.permissions.can_manage_proposals ? 'text-gray-700' : 'text-gray-400'}>Propositions</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}

              {members.length === 0 && (
                <GlassCard>
                  <div className="text-center py-12">
                    <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Aucun membre assigné à ce projet</p>
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {/* Modal d'ajout */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl p-8 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold mb-6 vibrant-accent-text">Ajouter un membre</h2>
                
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rechercher un utilisateur
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 z-10" strokeWidth={2.5} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Rechercher par email, nom ou username..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur"
                      />
                      {isSearching && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Résultats de recherche */}
                    {searchQuery.length >= 2 && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto glass-card rounded-xl border border-white/50 shadow-xl">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            className="w-full px-4 py-3 text-left hover:bg-white/50 transition-colors flex items-center gap-3 border-b border-white/20 last:border-b-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {user.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{user.display_name}</p>
                              <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                      <div className="absolute z-10 w-full mt-2 glass-card rounded-xl border border-white/50 shadow-xl p-4 text-center text-gray-500 text-sm">
                        Aucun utilisateur trouvé
                      </div>
                    )}

                    {/* Utilisateur sélectionné */}
                    {selectedUser && (
                      <div className="mt-3 glass-card rounded-xl p-4 flex items-center justify-between border border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] flex items-center justify-center text-white font-semibold">
                            {selectedUser.display_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{selectedUser.display_name}</p>
                            <p className="text-sm text-gray-600">{selectedUser.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleClearSelection}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rôle dans le projet
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="owner">Propriétaire</option>
                      <option value="manager">Gestionnaire</option>
                      <option value="editor">Éditeur</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedRole === "owner" && "Tous les droits sur le projet"}
                      {selectedRole === "manager" && "Peut gérer le projet et les membres"}
                      {selectedRole === "editor" && "Peut éditer le projet et le cahier des charges"}
                      {selectedRole === "viewer" && "Lecture seule"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || !selectedUser}
                    className="flex-1 glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 glass-card px-6 py-3 text-sm font-semibold text-gray-900 rounded-full"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );

}
