"use client";


import { Navigation } from "@/components/Navigation";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, FileText, Filter } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getProjectSpecs, deleteProjectSpec, getProjectUserRole } from "@/lib/supabase/client-utils";

interface Spec {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: 'all', label: 'Toutes les catégories', icon: '📋' },
  { value: 'general', label: 'Général', icon: '📄' },
  { value: 'technical', label: 'Technique', icon: '⚙️' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'legal', label: 'Juridique', icon: '⚖️' },
  { value: 'other', label: 'Autre', icon: '📌' },
];

const getCategoryLabel = (category: string) => {
  return categories.find(c => c.value === category)?.label || category;
};

const getCategoryIcon = (category: string) => {
  return categories.find(c => c.value === category)?.icon || '📋';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-500/20 text-green-700 border-green-300';
    case 'archived':
      return 'bg-gray-500/20 text-gray-700 border-gray-300';
    default:
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'published':
      return 'Publié';
    case 'archived':
      return 'Archivé';
    default:
      return 'Brouillon';
  }
};

export default function SpecsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [permissions, setPermissions] = useState<any>(null);

  useEffect(() => {
    loadPermissions();
    loadSpecs();
  }, [projectId, selectedCategory]);

  const loadPermissions = async () => {
    try {
      const userPermissions = await getProjectUserRole(projectId);
      setPermissions(userPermissions);
    } catch (error) {
      console.error("Erreur lors du chargement des permissions:", error);
    }
  };

  const loadSpecs = async () => {
    setLoading(true);
    try {
      const specsData = await getProjectSpecs(projectId, selectedCategory === 'all' ? undefined : selectedCategory);
      setSpecs(specsData || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (specId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cahier des charges ?")) return;

    try {
      await deleteProjectSpec(projectId, specId);
      await loadSpecs();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la suppression");
    }
  };

  const filteredSpecs = selectedCategory === 'all' 
    ? specs 
    : specs.filter(s => s.category === selectedCategory);

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
                Cahiers des charges
              </h1>
              <p className="text-gray-600">Gérez tous les cahiers des charges de ce projet</p>
            </div>
            {permissions?.canCreateSpecs && (
              <Link
                href={`/dashboard/projects/${projectId}/specs/new`}
                className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau cahier des charges
              </Link>
            )}
          </div>

          {/* Filtres par catégorie */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Filtrer par catégorie:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === category.value
                      ? 'glass-button-accent text-white'
                      : 'glass-card text-gray-700 hover:shadow-lg'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : filteredSpecs.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  {selectedCategory === 'all' 
                    ? "Aucun cahier des charges pour ce projet"
                    : `Aucun cahier des charges dans la catégorie "${getCategoryLabel(selectedCategory)}"`
                  }
                </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecs.map((spec) => (
                <motion.div
                  key={spec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassCard className="hover:shadow-xl transition-shadow h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(spec.category)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{spec.title}</h3>
                          <span className="text-xs text-gray-500">{getCategoryLabel(spec.category)}</span>
                        </div>
                      </div>
                    </div>

                    {spec.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                        {spec.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(spec.status)}`}>
                        {getStatusLabel(spec.status)}
                      </span>
                      <span className="text-xs text-gray-500">v{spec.version}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {new Date(spec.updated_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/projects/${projectId}/specs/${spec.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/projects/${projectId}/specs/${spec.id}/edit`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(spec.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );

}
