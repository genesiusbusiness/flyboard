"use client";


import { Navigation } from "@/components/Navigation";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProjectSpec, deleteProjectSpec } from "@/lib/supabase/client-utils";

export default function ViewSpec() {
  const params = useParams();
  const projectId = params.id as string;
  const specId = params.specId as string;
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSpec();
  }, [projectId, specId]);

  const loadSpec = async () => {
    try {
      const specData = await getProjectSpec(projectId, specId);
      setSpec(specData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cahier des charges ? Cette action est irréversible.")) {
      return;
    }

    try {
      await deleteProjectSpec(projectId, specId);
      // Rediriger vers la liste des cahiers des charges
      router.push(`/dashboard/projects/${projectId}/specs`);
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.message || "Erreur lors de la suppression du cahier des charges");
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      general: 'Général',
      technical: 'Technique',
      design: 'Design',
      marketing: 'Marketing',
      business: 'Business',
      legal: 'Juridique',
      other: 'Autre',
    };
    return categories[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      general: '📄',
      technical: '⚙️',
      design: '🎨',
      marketing: '📢',
      business: '💼',
      legal: '⚖️',
      other: '📌',
    };
    return icons[category] || '📋';
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

  if (loading) {
    return (
      <div className="min-h-screen light-blue-bg">
        <Navigation />
        <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen light-blue-bg">
        <Navigation />
        <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600">Cahier des charges non trouvé</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/dashboard/projects/${projectId}/specs`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux cahiers des charges
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getCategoryIcon(spec.category)}</span>
                <h1 className="text-3xl md:text-4xl font-bold vibrant-accent-text">
                  {spec.title}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{getCategoryLabel(spec.category)}</span>
                <span className="text-gray-400">•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(spec.status)}`}>
                  {getStatusLabel(spec.status)}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">Version {spec.version}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/projects/${projectId}/specs/${specId}/edit`}
                className="glass-card px-4 py-2 text-sm font-semibold text-gray-900 rounded-full flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
              <button
                onClick={handleDelete}
                className="glass-card px-4 py-2 text-sm font-semibold text-red-600 rounded-full flex items-center gap-2 hover:shadow-lg transition-all border border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>

          {spec.description && (
            <GlassCard className="mb-6">
              <p className="text-gray-700">{spec.description}</p>
            </GlassCard>
          )}

          <div className="space-y-6">
            {spec.objectives && spec.objectives.length > 0 && (
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4">Objectifs</h2>
                <ul className="space-y-3">
                  {spec.objectives.map((obj: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1 text-lg">•</span>
                      <span className="text-gray-700 flex-1">{obj}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {spec.requirements && spec.requirements.length > 0 && (
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4">Exigences</h2>
                <ul className="space-y-3">
                  {spec.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1 text-lg">•</span>
                      <span className="text-gray-700 flex-1">{req}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {spec.deliverables && spec.deliverables.length > 0 && (
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4">Livrables</h2>
                <ul className="space-y-3">
                  {spec.deliverables.map((del: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1 text-lg">•</span>
                      <span className="text-gray-700 flex-1">{del}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {spec.constraints && spec.constraints.length > 0 && (
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4">Contraintes</h2>
                <ul className="space-y-3">
                  {spec.constraints.map((constraint: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1 text-lg">•</span>
                      <span className="text-gray-700 flex-1">{constraint}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {spec.timeline && (spec.timeline.start || spec.timeline.end) && (
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4">Planning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {spec.timeline.start && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Date de début:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(spec.timeline.start).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  )}
                  {spec.timeline.end && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Date de fin:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(spec.timeline.end).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {spec.budget && (spec.budget.total || spec.budget.breakdown) && (
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4">Budget</h2>
                {spec.budget.total && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 block mb-1">Budget total:</span>
                    <p className="text-2xl font-semibold text-purple-600">
                      {parseFloat(spec.budget.total).toLocaleString("fr-FR")} €
                    </p>
                  </div>
                )}
                {spec.budget.breakdown && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Répartition:</span>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {spec.budget.breakdown}
                    </p>
                  </div>
                )}
              </GlassCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );

}
