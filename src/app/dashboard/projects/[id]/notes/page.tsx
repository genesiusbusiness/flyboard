"use client";

import { Navigation } from "@/components/Navigation";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Pin, PinOff, Lightbulb, FileText, CheckSquare, Bell } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getProjectNotes, createProjectNote, updateProjectNote, deleteProjectNote, getProjectUserRole } from "@/lib/supabase/client-utils";

interface Note {
  id: string;
  project_id: string;
  author_id: string;
  title: string | null;
  content: string;
  note_type: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

// Composant NoteCard défini en dehors de la fonction principale
function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  getNoteTypeIcon,
  getNoteTypeColor,
  getNoteTypeLabel,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (note: Note) => void;
  getNoteTypeIcon: (type: string) => JSX.Element;
  getNoteTypeColor: (type: string) => string;
  getNoteTypeLabel: (type: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getNoteTypeIcon(note.note_type)}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getNoteTypeColor(note.note_type)}`}>
                {getNoteTypeLabel(note.note_type)}
              </span>
              {note.is_pinned && (
                <Pin className="w-4 h-4 text-yellow-600" />
              )}
            </div>
            {note.title && (
              <h3 className="font-semibold text-slate-900 mb-2">{note.title}</h3>
            )}
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span>{note.author.display_name}</span>
              <span>•</span>
              <span>{new Date(note.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePin(note)}
              className="p-2 hover:bg-white/50 rounded-lg transition"
              title={note.is_pinned ? "Désépingler" : "Épingler"}
            >
              {note.is_pinned ? (
                <Pin className="w-4 h-4 text-yellow-600" />
              ) : (
                <PinOff className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {(permissions?.canEdit || permissions?.isOwner) && (
              <button
                onClick={() => onEdit(note)}
                className="p-2 hover:bg-white/50 rounded-lg transition"
                title="Modifier"
              >
                <Edit className="w-4 h-4 text-slate-600" />
              </button>
            )}
            {(permissions?.canEdit || permissions?.isOwner) && (
              <button
                onClick={() => onDelete(note.id)}
                className="p-2 hover:bg-white/50 rounded-lg transition"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function ProjectNotesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    note_type: "note",
    is_pinned: false,
  });

  useEffect(() => {
    loadNotes();
    loadPermissions();
  }, [projectId]);

  const loadPermissions = async () => {
    try {
      const userPermissions = await getProjectUserRole(projectId);
      setPermissions(userPermissions);
    } catch (error) {
      console.error("Erreur lors du chargement des permissions:", error);
    }
  };

  const loadNotes = async () => {
    try {
      const notesData = await getProjectNotes(projectId);
      setNotes(notesData || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    try {
      if (editingNote) {
        await updateProjectNote(projectId, editingNote.id, formData);
      } else {
        await createProjectNote(projectId, formData);
      }

      await loadNotes();
      setShowAddModal(false);
      setEditingNote(null);
      setFormData({ title: "", content: "", note_type: "note", is_pinned: false });
    } catch (error: any) {
      alert(error.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) return;

    try {
      await deleteProjectNote(projectId, noteId);
      await loadNotes();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la suppression");
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || "",
      content: note.content,
      note_type: note.note_type,
      is_pinned: note.is_pinned,
    });
    setShowAddModal(true);
  };

  const togglePin = async (note: Note) => {
    try {
      await updateProjectNote(projectId, note.id, { is_pinned: !note.is_pinned });
      await loadNotes();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case "idea":
        return <Lightbulb className="w-4 h-4" />;
      case "todo":
        return <CheckSquare className="w-4 h-4" />;
      case "reminder":
        return <Bell className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "idea":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
      case "todo":
        return "bg-blue-500/20 text-blue-700 border-blue-300";
      case "reminder":
        return "bg-orange-500/20 text-orange-700 border-orange-300";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-300";
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case "idea":
        return "Idée";
      case "todo":
        return "À faire";
      case "reminder":
        return "Rappel";
      default:
        return "Note";
    }
  };

  // Séparer les notes épinglées et non épinglées
  const pinnedNotes = notes.filter(n => n.is_pinned);
  const unpinnedNotes = notes.filter(n => !n.is_pinned);

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
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
                Notes & Idées
              </h1>
              <p className="text-gray-600">Partagez vos notes et idées pour ce projet</p>
            </div>
            {permissions?.canCreateNotes && (
              <button
                onClick={() => {
                  setEditingNote(null);
                  setFormData({ title: "", content: "", note_type: "note", is_pinned: false });
                  setShowAddModal(true);
                }}
                className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvelle note
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Notes épinglées */}
              {pinnedNotes.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">📌 Épinglées</h2>
                  <div className="space-y-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTogglePin={togglePin}
                        getNoteTypeIcon={getNoteTypeIcon}
                        getNoteTypeColor={getNoteTypeColor}
                        getNoteTypeLabel={getNoteTypeLabel}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Notes normales */}
              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Toutes les notes</h2>
                  )}
                  <div className="space-y-4">
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTogglePin={togglePin}
                        getNoteTypeIcon={getNoteTypeIcon}
                        getNoteTypeColor={getNoteTypeColor}
                        getNoteTypeLabel={getNoteTypeLabel}
                      />
                    ))}
                  </div>
                </div>
              )}

              {notes.length === 0 && (
                <GlassCard>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Aucune note pour ce projet</p>
                    {permissions?.canCreateNotes && (
                      <button
                        onClick={() => {
                          setEditingNote(null);
                          setFormData({ title: "", content: "", note_type: "note", is_pinned: false });
                          setShowAddModal(true);
                        }}
                        className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full inline-flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Créer la première note
                      </button>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {/* Modal d'ajout/édition */}
          {showAddModal && permissions?.canCreateNotes && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold mb-6 vibrant-accent-text">
                  {editingNote ? "Modifier la note" : "Nouvelle note"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type de note
                    </label>
                    <select
                      value={formData.note_type}
                      onChange={(e) => setFormData({ ...formData, note_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="note">Note</option>
                      <option value="idea">Idée</option>
                      <option value="todo">À faire</option>
                      <option value="reminder">Rappel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Titre (optionnel)
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Titre de la note..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contenu *
                    </label>
                    <textarea
                      required
                      rows={8}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Écrivez votre note ou idée..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_pinned"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="is_pinned" className="text-sm text-gray-700">
                      Épingler cette note
                    </label>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full"
                    >
                      {editingNote ? "Enregistrer" : "Créer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingNote(null);
                        setFormData({ title: "", content: "", note_type: "note", is_pinned: false });
                      }}
                      className="flex-1 glass-card px-6 py-3 text-sm font-semibold text-gray-900 rounded-full"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

