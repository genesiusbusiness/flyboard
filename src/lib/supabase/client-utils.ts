/**
 * Utilitaires Supabase pour remplacer les API routes
 * Utilisé pour le déploiement statique sur S3
 */

import { createClient } from './client';

/**
 * Bootstrap le profil FlyBoard (remplace /api/flyboard/bootstrap)
 */
export async function bootstrapFlyboardProfile() {
  const supabase = createClient();
  
  // Vérifier l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Appeler la fonction RPC
  const { data: profile, error: rpcError } = await supabase.rpc('ensure_flyboard_profile');

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  // La fonction RPC peut retourner un tableau ou un objet
  return Array.isArray(profile) ? profile[0] : profile;
}

/**
 * Récupérer le profil FlyBoard actuel
 */
export async function getCurrentFlyboardProfile() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('flyboard_profiles')
    .select('*')
    .eq('flyid', user.id)
    .single();

  return profile;
}

/**
 * Créer un projet (remplace POST /api/projects)
 */
export async function createProject(projectData: {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  deadline?: string;
  tags?: string[];
}) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  const { data, error } = await supabase
    .from('flyboard_projects')
    .insert({
      owner_id: profile.id,
      ...projectData,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupérer un projet (remplace GET /api/projects/[id])
 */
export async function getProject(projectId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flyboard_projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour un projet (remplace PATCH /api/projects/[id])
 */
export async function updateProject(projectId: string, updates: any) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier les permissions
  const project = await getProject(projectId);
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Rechercher des utilisateurs (remplace GET /api/users/search)
 */
export async function searchUsers(query: string) {
  const supabase = createClient();
  
  if (!query || query.length < 2) {
    return [];
  }

  const { data: accounts, error } = await supabase.rpc('search_fly_accounts', {
    search_term: query
  });

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  // Pour chaque compte, vérifier s'il a un profil FlyBoard
  const usersWithProfiles = await Promise.all(
    (accounts || []).map(async (account: any) => {
      const { data: existingProfile } = await supabase
        .from('flyboard_profiles')
        .select('id, display_name, avatar_url')
        .eq('flyid', account.id)
        .maybeSingle();

      return {
        id: existingProfile?.id || account.id,
        flyid: account.id,
        email: account.email,
        display_name: existingProfile?.display_name || account.full_name || account.username || account.email?.split('@')[0] || 'Utilisateur',
        avatar_url: existingProfile?.avatar_url || account.avatar_url,
        username: account.username,
        hasProfile: !!existingProfile,
      };
    })
  );

  return usersWithProfiles;
}

/**
 * Récupérer les membres d'un projet (remplace GET /api/projects/[id]/members)
 */
export async function getProjectMembers(projectId: string) {
  const supabase = createClient();
  
  const { data: members, error } = await supabase
    .from('flyboard_project_permissions')
    .select(`
      *,
      member:flyboard_profiles!member_id (
        id,
        display_name,
        avatar_url,
        global_role,
        flyid
      )
    `)
    .eq('project_id', projectId);

  if (error) throw error;

  // Pour chaque membre, récupérer l'email depuis fly_accounts
  const membersWithEmail = await Promise.all(
    (members || []).map(async (member: any) => {
      if (member.member?.flyid) {
        const { data: flyAccount } = await supabase
          .from('fly_accounts')
          .select('email')
          .eq('id', member.member.flyid)
          .single();
        
        return {
          ...member,
          member: {
            ...member.member,
            email: flyAccount?.email || null
          }
        };
      }
      return member;
    })
  );

  return membersWithEmail;
}

/**
 * Ajouter un membre à un projet (remplace POST /api/projects/[id]/members)
 */
export async function addProjectMember(projectId: string, memberId: string, projectRole: string) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier les permissions
  const project = await getProject(projectId);
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  // Vérifier si memberId est un profil FlyBoard ou un flyid
  let finalMemberId = memberId;
  const { data: profileCheck } = await supabase
    .from('flyboard_profiles')
    .select('id')
    .eq('id', memberId)
    .maybeSingle();

  if (!profileCheck) {
    // C'est un flyid, créer le profil FlyBoard si nécessaire
    const { data: newProfile, error: createError } = await supabase
      .from('flyboard_profiles')
      .insert({
        flyid: memberId,
        display_name: 'Utilisateur',
        global_role: 'member',
      })
      .select()
      .single();

    if (createError) {
      // Essayer d'utiliser ensure_flyboard_profile
      const { data: profileData } = await supabase.rpc('ensure_flyboard_profile');
      const ensuredProfile = Array.isArray(profileData) ? profileData[0] : profileData;
      if (ensuredProfile) {
        finalMemberId = ensuredProfile.id;
      } else {
        throw new Error('Failed to create FlyBoard profile');
      }
    } else {
      finalMemberId = newProfile.id;
    }
  }

  const { data, error } = await supabase
    .from('flyboard_project_permissions')
    .insert({
      project_id: projectId,
      member_id: finalMemberId,
      project_role: projectRole,
      assigned_by: profile.id,
    })
    .select(`
      *,
      member:flyboard_profiles!member_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour les permissions d'un membre (remplace PATCH /api/projects/[id]/members)
 */
export async function updateProjectMemberPermissions(
  projectId: string,
  permissionId: string,
  updates: { project_role?: string; permissions?: any }
) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier les permissions
  const project = await getProject(projectId);
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_project_permissions')
    .update(updates)
    .eq('id', permissionId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Supprimer un membre d'un projet (remplace DELETE /api/projects/[id]/members)
 */
export async function removeProjectMember(projectId: string, permissionId: string) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier les permissions
  const project = await getProject(projectId);
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  const { error } = await supabase
    .from('flyboard_project_permissions')
    .delete()
    .eq('id', permissionId)
    .eq('project_id', projectId);

  if (error) throw error;
}

/**
 * Récupérer les spécifications d'un projet (remplace GET /api/projects/[id]/specs)
 */
export async function getProjectSpecs(projectId: string, category?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('flyboard_project_specs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Créer une spécification (remplace POST /api/projects/[id]/specs)
 */
export async function createProjectSpec(projectId: string, specData: any) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier les permissions
  const project = await getProject(projectId);
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_project_specs')
    .insert({
      project_id: projectId,
      author_id: profile.id,
      ...specData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour une spécification (remplace PATCH /api/projects/[id]/specs/[specId])
 */
export async function updateProjectSpec(projectId: string, specId: string, updates: any) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier les permissions
  const project = await getProject(projectId);
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_project_specs')
    .update(updates)
    .eq('id', specId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupérer une spécification (remplace GET /api/projects/[id]/specs/[specId])
 */
export async function getProjectSpec(projectId: string, specId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flyboard_project_specs')
    .select('*')
    .eq('id', specId)
    .eq('project_id', projectId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Supprimer une spécification (remplace DELETE /api/projects/[id]/specs/[specId])
 */
export async function deleteProjectSpec(projectId: string, specId: string) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier les permissions
  const project = await getProject(projectId);
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  const { error } = await supabase
    .from('flyboard_project_specs')
    .delete()
    .eq('id', specId)
    .eq('project_id', projectId);

  if (error) throw error;
}

/**
 * Récupérer les notes d'un projet (remplace GET /api/projects/[id]/notes)
 */
export async function getProjectNotes(projectId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flyboard_project_notes')
    .select(`
      *,
      author:flyboard_profiles!author_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('project_id', projectId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Créer une note (remplace POST /api/projects/[id]/notes)
 */
export async function createProjectNote(projectId: string, noteData: {
  title?: string;
  content: string;
  note_type?: string;
  is_pinned?: boolean;
}) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  const { data, error } = await supabase
    .from('flyboard_project_notes')
    .insert({
      project_id: projectId,
      author_id: profile.id,
      ...noteData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour une note (remplace PATCH /api/projects/[id]/notes/[noteId])
 */
export async function updateProjectNote(projectId: string, noteId: string, updates: any) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier que l'utilisateur est l'auteur ou le propriétaire du projet
  const note = await supabase
    .from('flyboard_project_notes')
    .select('author_id, project_id')
    .eq('id', noteId)
    .single();

  const project = await getProject(projectId);
  const isAuthor = note.data?.author_id === profile.id;
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isAuthor && !isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_project_notes')
    .update(updates)
    .eq('id', noteId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Supprimer une note (remplace DELETE /api/projects/[id]/notes/[noteId])
 */
export async function deleteProjectNote(projectId: string, noteId: string) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier que l'utilisateur est l'auteur ou le propriétaire du projet
  const { data: note } = await supabase
    .from('flyboard_project_notes')
    .select('author_id, project_id')
    .eq('id', noteId)
    .single();

  const project = await getProject(projectId);
  const isAuthor = note?.author_id === profile.id;
  const isOwner = project.owner_id === profile.id;
  const isSuperAdmin = profile.global_role === 'super_admin';

  if (!isAuthor && !isOwner && !isSuperAdmin) {
    throw new Error('Not authorized');
  }

  const { error } = await supabase
    .from('flyboard_project_notes')
    .delete()
    .eq('id', noteId)
    .eq('project_id', projectId);

  if (error) throw error;
}

/**
 * Récupérer les propositions d'un projet
 */
export async function getProjectProposals(projectId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flyboard_project_proposals')
    .select(`
      *,
      proposer:flyboard_profiles!proposer_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Créer une proposition (remplace POST /api/proposals)
 */
export async function createProposal(projectId: string, proposalData: {
  title: string;
  description?: string;
  estimated_duration?: string;
  estimated_cost?: number;
}) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  const { data, error } = await supabase
    .from('flyboard_project_proposals')
    .insert({
      project_id: projectId,
      proposer_id: profile.id,
      ...proposalData,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupérer une proposition (remplace GET /api/proposals/[id])
 */
export async function getProposal(proposalId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flyboard_project_proposals')
    .select(`
      *,
      proposer:flyboard_profiles!proposer_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('id', proposalId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mettre à jour une proposition (remplace PATCH /api/proposals/[id])
 */
export async function updateProposal(proposalId: string, updates: any) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier que l'utilisateur est le proposant
  const { data: proposal } = await supabase
    .from('flyboard_project_proposals')
    .select('proposer_id, status')
    .eq('id', proposalId)
    .single();

  if (proposal?.proposer_id !== profile.id) {
    throw new Error('Not authorized');
  }

  if (proposal?.status !== 'pending') {
    throw new Error('Cannot update non-pending proposal');
  }

  const { data, error } = await supabase
    .from('flyboard_project_proposals')
    .update(updates)
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Supprimer une proposition (remplace DELETE /api/proposals/[id])
 */
export async function deleteProposal(proposalId: string) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier que l'utilisateur est le proposant
  const { data: proposal } = await supabase
    .from('flyboard_project_proposals')
    .select('proposer_id')
    .eq('id', proposalId)
    .single();

  if (proposal?.proposer_id !== profile.id) {
    throw new Error('Not authorized');
  }

  const { error } = await supabase
    .from('flyboard_project_proposals')
    .delete()
    .eq('id', proposalId);

  if (error) throw error;
}

/**
 * Accepter une proposition (remplace POST /api/proposals/[id]/accept)
 */
export async function acceptProposal(projectId: string, proposalId: string) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier que l'utilisateur est le propriétaire du projet
  const project = await getProject(projectId);
  if (project.owner_id !== profile.id && profile.global_role !== 'super_admin') {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_project_proposals')
    .update({
      status: 'accepted',
      responded_by: profile.id,
      responded_at: new Date().toISOString(),
    })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Rejeter une proposition (remplace POST /api/proposals/[id]/reject)
 */
export async function rejectProposal(projectId: string, proposalId: string, responseMessage?: string) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || !profile.id) {
    throw new Error('Profile not found');
  }

  // Vérifier que l'utilisateur est le propriétaire du projet
  const project = await getProject(projectId);
  if (project.owner_id !== profile.id && profile.global_role !== 'super_admin') {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_project_proposals')
    .update({
      status: 'rejected',
      response_message: responseMessage || null,
      responded_by: profile.id,
      responded_at: new Date().toISOString(),
    })
    .eq('id', proposalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupérer tous les utilisateurs (admin) (remplace GET /api/admin/users)
 */
export async function getAllUsers() {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || profile.global_role !== 'super_admin') {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_profiles')
    .select(`
      *,
      fly_account:fly_accounts!flyid (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Mettre à jour le rôle global d'un utilisateur (remplace PATCH /api/admin/users)
 */
export async function updateUserGlobalRole(userId: string, globalRole: string) {
  const supabase = createClient();
  
  const profile = await bootstrapFlyboardProfile();
  if (!profile || profile.global_role !== 'super_admin') {
    throw new Error('Not authorized');
  }

  const { data, error } = await supabase
    .from('flyboard_profiles')
    .update({ global_role: globalRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

