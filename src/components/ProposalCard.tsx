"use client";

import { GlassCard } from "./GlassCard";
import { CheckCircle, XCircle, Clock, User, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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
  project_id?: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  canRespond?: boolean;
  currentUserId?: string;
}

export function ProposalCard({ proposal, onAccept, onReject, onDelete, canRespond = false, currentUserId }: ProposalCardProps) {
  const isOwner = currentUserId === proposal.proposer_id;
  const canEdit = isOwner && proposal.status === "pending";
  const getStatusIcon = () => {
    switch (proposal.status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (proposal.status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "withdrawn":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {proposal.status === "pending" && "En attente"}
              {proposal.status === "accepted" && "Acceptée"}
              {proposal.status === "rejected" && "Rejetée"}
              {proposal.status === "withdrawn" && "Retirée"}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(proposal.created_at).toLocaleDateString("fr-FR")}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
        
        {proposal.description && (
          <p className="text-sm text-gray-600 mb-4">{proposal.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          {proposal.estimated_duration && (
            <div>
              <span className="text-xs text-gray-500">Durée estimée</span>
              <p className="text-sm font-medium">{proposal.estimated_duration}</p>
            </div>
          )}
          {proposal.estimated_cost && (
            <div>
              <span className="text-xs text-gray-500">Coût estimé</span>
              <p className="text-sm font-medium">{proposal.estimated_cost.toLocaleString("fr-FR")} €</p>
            </div>
          )}
        </div>

        {proposal.proposer_name && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Proposé par {proposal.proposer_name}</span>
          </div>
        )}

        {proposal.response_message && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Réponse :</p>
            <p className="text-sm text-gray-700">{proposal.response_message}</p>
          </div>
        )}

        {(canRespond || canEdit) && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            {canRespond && proposal.status === "pending" && (
              <>
                <button
                  onClick={() => onAccept?.(proposal.id)}
                  className="flex-1 glass-button-accent px-4 py-2 text-sm font-semibold text-white rounded-full flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accepter
                </button>
                <button
                  onClick={() => onReject?.(proposal.id)}
                  className="flex-1 glass-card px-4 py-2 text-sm font-semibold text-gray-900 rounded-full flex items-center justify-center gap-2 border border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  Rejeter
                </button>
              </>
            )}
            
            {canEdit && (
              <div className="flex items-center gap-2 ml-auto">
                {proposal.project_id && (
                  <Link
                    href={`/dashboard/projects/${proposal.project_id}/proposals/${proposal.id}/edit`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={() => onDelete?.(proposal.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

