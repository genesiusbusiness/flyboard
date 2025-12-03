"use client";

import { Navigation } from "@/components/Navigation";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProjectSpec, updateProjectSpec } from "@/lib/supabase/client-utils";

const categories = [
  { value: 'general', label: 'Général', icon: '📄' },
  { value: 'technical', label: 'Technique', icon: '⚙️' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'legal', label: 'Juridique', icon: '⚖️' },
  { value: 'other', label: 'Autre', icon: '📌' },
];

export default function EditSpecs() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const specId = params.specId as string;
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    status: "draft",
    objectives: [""],
    requirements: [""],
    deliverables: [""],
    constraints: [""],
    timeline: {
      start: "",
      end: "",
    },
    budget: {
      total: "",
      breakdown: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(true);

  useEffect(() => {
    if (specId) {
      loadSpecs();
    } else {
      setLoadingSpecs(false);
    }
  }, [projectId, specId]);

  const loadSpecs = async () => {
    if (!specId) return;
    
    try {
      const specData = await getProjectSpec(projectId, specId);
      
      if (specData) {
        setFormData({
          title: specData.title || "",
          description: specData.description || "",
          category: specData.category || "general",
          status: specData.status || "draft",
          objectives: specData.objectives && specData.objectives.length > 0 
            ? specData.objectives 
            : [""],
          requirements: specData.requirements && specData.requirements.length > 0 
            ? specData.requirements 
            : [""],
          deliverables: specData.deliverables && specData.deliverables.length > 0 
            ? specData.deliverables 
            : [""],
          constraints: specData.constraints && specData.constraints.length > 0 
            ? specData.constraints 
            : [""],
          timeline: specData.timeline || {
            start: "",
            end: "",
          },
          budget: specData.budget || {
            total: "",
            breakdown: "",
          },
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des specs:", error);
    } finally {
      setLoadingSpecs(false);
    }
  };

  const addItem = (field: "objectives" | "requirements" | "deliverables" | "constraints") => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const removeItem = (field: "objectives" | "requirements" | "deliverables" | "constraints", index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const updateItem = (field: "objectives" | "requirements" | "deliverables" | "constraints", index: number, value: string) => {
    const newItems = [...formData[field]];
    newItems[index] = value;
    setFormData({
      ...formData,
      [field]: newItems,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert("Le titre est obligatoire");
      return;
    }

    setLoading(true);

    try {
      await updateProjectSpec(projectId, specId, {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        status: formData.status,
        objectives: formData.objectives,
        requirements: formData.requirements,
        deliverables: formData.deliverables,
        constraints: formData.constraints,
        timeline: formData.timeline,
        budget: formData.budget,
      });

      // Rediriger vers la page de visualisation du cahier des charges
      router.push(`/dashboard/projects/${projectId}/specs/${specId}`);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(error.message || "Erreur lors de la sauvegarde du cahier des charges");
    } finally {
      setLoading(false);
    }
  };

  if (loadingSpecs) {
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

  return (
    <div className="min-h-screen light-blue-bg">
      <Navigation />
      
      <main className="pt-20 md:pt-24 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/dashboard/projects/${projectId}/specs/${specId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au cahier des charges
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-8 vibrant-accent-text">
            Modifier le cahier des charges
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Titre du cahier des charges *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Cahier des charges technique - API v2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Description du cahier des charges..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Objectifs */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Objectifs</h2>
                <button
                  type="button"
                  onClick={() => addItem("objectives")}
                  className="glass-button-accent px-3 py-1.5 text-xs font-semibold text-white rounded-full flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {formData.objectives.map((obj, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => updateItem("objectives", index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Objectif du projet..."
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("objectives", index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Exigences */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Exigences</h2>
                <button
                  type="button"
                  onClick={() => addItem("requirements")}
                  className="glass-button-accent px-3 py-1.5 text-xs font-semibold text-white rounded-full flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateItem("requirements", index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Exigence du projet..."
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("requirements", index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Livrables */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Livrables</h2>
                <button
                  type="button"
                  onClick={() => addItem("deliverables")}
                  className="glass-button-accent px-3 py-1.5 text-xs font-semibold text-white rounded-full flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {formData.deliverables.map((del, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={del}
                      onChange={(e) => updateItem("deliverables", index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Livrable du projet..."
                    />
                    {formData.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("deliverables", index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Contraintes */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Contraintes</h2>
                <button
                  type="button"
                  onClick={() => addItem("constraints")}
                  className="glass-button-accent px-3 py-1.5 text-xs font-semibold text-white rounded-full flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {formData.constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={constraint}
                      onChange={(e) => updateItem("constraints", index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Contrainte du projet..."
                    />
                    {formData.constraints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("constraints", index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Timeline */}
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Planning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.timeline.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeline: { ...formData.timeline, start: e.target.value },
                    })}
                    className="w-full px-4 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.timeline.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeline: { ...formData.timeline, end: e.target.value },
                    })}
                    className="w-full px-4 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Budget */}
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Budget</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget total (€)
                  </label>
                  <input
                    type="number"
                    value={formData.budget.total}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget, total: e.target.value },
                    })}
                    className="w-full px-4 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Répartition du budget
                  </label>
                  <textarea
                    value={formData.budget.breakdown}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget, breakdown: e.target.value },
                    })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Détaillez la répartition du budget..."
                  />
                </div>
              </div>
            </GlassCard>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
              <Link
                href={`/dashboard/projects/${projectId}/specs/${specId}`}
                className="glass-card px-6 py-3 text-sm font-semibold text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );

}
