"use client";


import { Navigation } from "@/components/Navigation";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProposal() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();
  
  const [project, setProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimated_duration: "",
    estimated_cost: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
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
    } catch (error) {
      console.error("Erreur lors du chargement du projet:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Récupérer le profil FlyBoard
      const { data: profile, error: profileError } = await supabase.rpc('ensure_flyboard_profile');
      if (profileError || !profile) {
        throw new Error('Profil non trouvé. Veuillez vous connecter.');
      }

      // Créer la proposition dans Supabase
      const { data: proposal, error: proposalError } = await supabase
        .from('flyboard_project_proposals')
        .insert({
          project_id: projectId,
          proposer_id: profile.id,
          title: formData.title,
          description: formData.description || null,
          estimated_duration: formData.estimated_duration || null,
          estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
          status: 'pending',
        })
        .select()
        .single();

      if (proposalError) {
        throw new Error(proposalError.message || 'Erreur lors de la création de la proposition');
      }

      // Rediriger vers la liste des propositions
      router.push(`/dashboard/projects/${projectId}/proposals`);
    } catch (error: any) {
      console.error("Erreur lors de la création de la proposition:", error);
      alert(error.message || "Erreur lors de la création de la proposition");
    } finally {
      setLoading(false);
    }
  };

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
              Nouvelle proposition
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

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Votre proposition sera soumise au propriétaire du projet. 
                  Il pourra l&apos;accepter ou la rejeter. Vous serez notifié de la réponse.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Envoi..." : "Envoyer la proposition"}
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
