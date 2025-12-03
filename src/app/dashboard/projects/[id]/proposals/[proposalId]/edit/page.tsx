"use client";

import { Navigation } from "@/components/Navigation";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProposal, updateProposal } from "@/lib/supabase/client-utils";
import { createClient } from "@/lib/supabase/client";

export default function EditProposal() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const proposalId = params.proposalId as string;
  const supabase = createClient();
  
  const [project, setProject] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimated_duration: "",
    estimated_cost: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingProposal, setLoadingProposal] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId, proposalId]);

  const loadData = async () => {
    try {
      // Charger le projet
      const { data: projectData, error: projectError } = await supabase
        .from('flyboard_projects')
        .select('id, title')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error("Erreur lors du chargement du projet:", projectError);
        return;
      }

      setProject(projectData);

      // Charger la proposition
      const { data: proposalData, error: proposalError } = await supabase
        .from('flyboard_project_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError) {
        console.error("Erreur lors du chargement de la proposition:", proposalError);
        alert("Proposition non trouvée ou vous n'avez pas les droits pour la modifier.");
        router.push(`/dashboard/projects/${projectId}/proposals`);
        return;
      }

      // Vérifier que l'utilisateur est l'auteur
      const { data: profile } = await supabase.rpc('ensure_flyboard_profile');
      if (profile?.id !== proposalData.proposer_id) {
        alert("Vous n'avez pas les droits pour modifier cette proposition.");
        router.push(`/dashboard/projects/${projectId}/proposals`);
        return;
      }

      // Vérifier que la proposition est encore en attente
      if (proposalData.status !== 'pending') {
        alert("Vous ne pouvez modifier que les propositions en attente.");
        router.push(`/dashboard/projects/${projectId}/proposals`);
        return;
      }

      setProposal(proposalData);
      setFormData({
        title: proposalData.title || "",
        description: proposalData.description || "",
        estimated_duration: proposalData.estimated_duration || "",
        estimated_cost: proposalData.estimated_cost ? proposalData.estimated_cost.toString() : "",
      });
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoadingProposal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProposal(proposalId, {
        title: formData.title,
        description: formData.description || null,
        estimated_duration: formData.estimated_duration || null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      });

      // Rediriger vers la liste des propositions
      router.push(`/dashboard/projects/${projectId}/proposals`);
    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      alert(error.message || "Erreur lors de la modification de la proposition");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProposal) {
    return (
      <div className="min-h-screen light-blue-bg">
        <Navigation />
        <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/dashboard/projects/${projectId}/proposals`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux propositions
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 vibrant-accent-text">
              Modifier la proposition
            </h1>
            {project && (
              <p className="text-gray-600">
                Pour le projet : <span className="font-semibold">{project.title}</span>
              </p>
            )}
          </div>

          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre de la proposition *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Refonte complète avec React et Next.js"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Décrivez votre proposition en détail : approche, technologies, méthodologie..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="estimated_duration" className="block text-sm font-semibold text-gray-700 mb-2">
                    Durée estimée
                  </label>
                  <input
                    type="text"
                    id="estimated_duration"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: 3 mois, 6 semaines..."
                  />
                </div>

                <div>
                  <label htmlFor="estimated_cost" className="block text-sm font-semibold text-gray-700 mb-2">
                    Coût estimé (€)
                  </label>
                  <input
                    type="number"
                    id="estimated_cost"
                    step="0.01"
                    min="0"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Note :</strong> Vous ne pouvez modifier que les propositions en attente. 
                  Une fois acceptée ou rejetée, la proposition ne peut plus être modifiée.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
                <Link
                  href={`/dashboard/projects/${projectId}/proposals`}
                  className="glass-card px-6 py-3 text-sm font-semibold text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Annuler
                </Link>
              </div>
            </form>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}