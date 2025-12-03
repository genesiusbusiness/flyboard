"use client";


import { Navigation } from "@/components/Navigation";
import { ProposalCard } from "@/components/ProposalCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProjectProposals, acceptProposal, rejectProposal, deleteProposal, bootstrapFlyboardProfile } from "@/lib/supabase/client-utils";

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  estimated_duration: string | null;
  estimated_cost: number | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  proposer_id: string;
  proposer_name?: string;
  created_at: string;
  response_message?: string | null;
  responded_at?: string | null;
}

export default function ProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [canRespond, setCanRespond] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      // Charger le projet depuis Supabase
      const { data: projectData, error: projectError } = await supabase
        .from('flyboard_projects')
        .select('id, title, owner_id')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error("Erreur lors du chargement du projet:", projectError);
        return;
      }

      setProject(projectData);

      // Charger les propositions
      const proposalsData = await getProjectProposals(projectId);

      // Formater les propositions
      const formattedProposals: Proposal[] = (proposalsData || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        estimated_duration: p.estimated_duration,
        estimated_cost: p.estimated_cost,
        status: p.status,
        proposer_id: p.proposer_id,
        proposer_name: p.proposer?.display_name || "Utilisateur",
        created_at: p.created_at,
        response_message: p.response_message,
        responded_at: p.responded_at,
        project_id: projectId,
      }));

      setProposals(formattedProposals);

      // Vérifier si l'utilisateur peut répondre (propriétaire du projet)
      const profile = await bootstrapFlyboardProfile();
      if (profile?.id) {
        setCanRespond(profile.id === projectData.owner_id);
        setCurrentUserId(profile.id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (proposalId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir accepter cette proposition ?")) {
      return;
    }

    try {
      await acceptProposal(projectId, proposalId);
      
      // Recharger les données
      await loadData();
    } catch (error: any) {
      console.error("Erreur lors de l'acceptation:", error);
      alert(error.message || "Erreur lors de l'acceptation de la proposition");
    }
  };

  const handleReject = async (proposalId: string) => {
    const message = prompt("Raison du rejet (optionnel) :");
    
    try {
      await rejectProposal(projectId, proposalId, message || undefined);
      
      // Recharger les données
      await loadData();
    } catch (error: any) {
      console.error("Erreur lors du rejet:", error);
      alert(error.message || "Erreur lors du rejet de la proposition");
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette proposition ? Cette action est irréversible.")) {
      return;
    }

    try {
      await deleteProposal(proposalId);
      
      // Recharger les données
      await loadData();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.message || "Erreur lors de la suppression de la proposition");
    }
  };

  const pendingProposals = proposals.filter(p => p.status === "pending");
  const acceptedProposals = proposals.filter(p => p.status === "accepted");
  const rejectedProposals = proposals.filter(p => p.status === "rejected");

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
                Propositions
              </h1>
              <p className="text-gray-600">
                {project?.title}
              </p>
            </div>
            <Link
              href={`/dashboard/projects/${projectId}/proposals/new`}
              className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvelle proposition
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Propositions en attente */}
              {pendingProposals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 vibrant-accent-text">
                    En attente ({pendingProposals.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingProposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onDelete={handleDelete}
                        canRespond={canRespond}
                        currentUserId={currentUserId || undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Propositions acceptées */}
              {acceptedProposals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-green-600">
                    Acceptées ({acceptedProposals.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {acceptedProposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onDelete={handleDelete}
                        canRespond={false}
                        currentUserId={currentUserId || undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Propositions rejetées */}
              {rejectedProposals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-red-600">
                    Rejetées ({rejectedProposals.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rejectedProposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onDelete={handleDelete}
                        canRespond={false}
                        currentUserId={currentUserId || undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Aucune proposition */}
              {proposals.length === 0 && (
                <div className="text-center py-12 glass-card rounded-2xl">
                  <p className="text-gray-600 mb-6">Aucune proposition pour ce projet.</p>
                  <Link
                    href={`/dashboard/projects/${projectId}/proposals/new`}
                    className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Créer la première proposition
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}