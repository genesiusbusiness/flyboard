"use client";

import { Navigation } from "@/components/Navigation";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProject, updateProject } from "@/lib/supabase/client-utils";

export default function EditProject() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    status: "draft",
    deadline: "",
    tags: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const project = await getProject(projectId);
      
      setFormData({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        priority: project.priority || "medium",
        status: project.status || "draft",
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "",
        tags: project.tags ? project.tags.join(', ') : "",
      });
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement du projet");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProject(projectId, {
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        priority: formData.priority,
        status: formData.status,
        deadline: formData.deadline || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : null,
      });

      router.push(`/dashboard/projects/${projectId}`);
    } catch (error: any) {
      console.error("Erreur:", error);
      alert(error.message || "Erreur lors de la mise à jour du projet");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen light-blue-bg">
        <Navigation />
        <main className="pt-20 md:pt-24 px-4 py-8">
          <div className="text-center">Chargement...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au projet
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-8 vibrant-accent-text">
            Modifier le projet
          </h1>

          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre du projet *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Nouveau site web Flynesis"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Décrivez votre projet en détail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="proposed">Proposé</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
                    Date limite
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: web, design, urgent"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
                <Link
                  href={`/dashboard/projects/${projectId}`}
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