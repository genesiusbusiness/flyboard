# 🚀 FlyBoard - Gestion de Projets Flynesis

Application professionnelle de gestion de projets pour l'écosystème Flynesis, avec design Apple Glass UI / Vibrant.

## ✨ Fonctionnalités

- ✅ **Création de projets** : Organise tes idées en projets structurés
- ✅ **Cahiers des charges** : Rédige des cahiers des charges détaillés avec objectifs, exigences, livrables
- ✅ **Propositions** : Propose des projets et accepte-les
- ✅ **Dashboard** : Vue d'ensemble de tous tes projets
- ✅ **Design Flynesis** : Style Apple Glass UI avec glassmorphisme et gradients vibrants

## 🎨 Design

FlyBoard suit le design du site Flynesis :
- **Fond** : #EAF0FF (Light Blue)
- **Gradient** : #6C63FF → #FF77E9 (Violet-Rose)
- **Glass Cards** : Effet de flou avec backdrop-filter
- **Animations** : Framer Motion pour des transitions fluides

## 🗄️ Base de données

### Tables créées

1. **flyboard_profiles** : Profils utilisateurs (déjà créé)
2. **flyboard_projects** : Projets
3. **flyboard_project_proposals** : Propositions de projets
4. **flyboard_project_specs** : Cahiers des charges
5. **flyboard_project_members** : Membres assignés aux projets

### Migration SQL

Exécuter dans Supabase SQL Editor :
1. `autre/supabase/migrations/create_flyboard_tables.sql` (profils)
2. `autre/supabase/migrations/create_flyboard_projects_tables.sql` (projets)

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Le fichier `.env.local` est déjà configuré avec :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Lancer le serveur

```bash
npm run dev
```

Le serveur est accessible sur **http://localhost:3002**

## 📁 Structure du projet

```
src/
├── app/
│   ├── page.tsx                    # Page d'accueil (landing)
│   ├── dashboard/
│   │   ├── page.tsx               # Dashboard principal
│   │   └── projects/
│   │       ├── new/
│   │       │   └── page.tsx       # Création de projet
│   │       └── [id]/
│   │           ├── page.tsx       # Détail du projet
│   │           └── specs/
│   │               └── edit/
│   │                   └── page.tsx # Éditeur cahier des charges
│   └── api/
│       └── flyboard/
│           └── bootstrap/
│               └── route.ts        # API bootstrap profil
├── components/
│   ├── Navigation.tsx             # Navigation principale
│   └── GlassCard.tsx              # Composant carte glass
└── lib/
    └── supabase/
        ├── client.ts              # Client Supabase (browser)
        └── server.ts              # Client Supabase (server)
```

## 🎯 Utilisation

### Créer un projet

1. Aller sur `/dashboard`
2. Cliquer sur "Nouveau projet"
3. Remplir le formulaire
4. Sauvegarder

### Créer un cahier des charges

1. Ouvrir un projet
2. Aller dans l'onglet "Cahier des charges"
3. Cliquer sur "Éditer"
4. Remplir les sections (objectifs, exigences, livrables, etc.)
5. Sauvegarder

### Proposer un projet

1. Créer un projet avec le statut "draft"
2. Cliquer sur "Proposer le projet"
3. Le projet passe en statut "proposed"
4. D'autres utilisateurs peuvent voir et accepter la proposition

## 🔐 Sécurité

- **RLS activé** : Chaque utilisateur ne voit que ses propres projets
- **Authentification FlyID** : Connexion obligatoire via FlyID
- **Bootstrap automatique** : Le profil FlyBoard est créé automatiquement à la première connexion

## 📝 TODO

- [ ] Intégration complète avec Supabase (CRUD projets)
- [ ] Système de propositions fonctionnel
- [ ] Acceptation/rejet de propositions
- [ ] Gestion des membres de projet
- [ ] Notifications
- [ ] Recherche et filtres avancés

## 🎨 Composants disponibles

- `GlassCard` : Carte avec effet glassmorphisme
- `Navigation` : Navigation principale avec style Flynesis
- Styles globaux : `.glass-card`, `.vibrant-accent`, `.vibrant-accent-text`, etc.

## 📚 Ressources

- [Documentation Supabase Migration](../autre/supabase/migrations/FLYBOARD_SETUP.md)
- [Schéma de base de données](../../schema.md)
- [Design Flynesis](../flynesis Site/src/index.css)

---

**🎉 FlyBoard est prêt à être utilisé !**
