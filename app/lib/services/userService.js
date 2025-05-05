import { supabase, handleSupabaseError } from '../supabase';

/**
 * Fetch all users from the users table
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return handleSupabaseError(error);
    }
    
    return { data: data || [] };
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return handleSupabaseError(error);
  }
}

/**
 * Fetch users filtered by status
 */
export async function getUsersByStatus(status) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users by status:', error);
      return handleSupabaseError(error);
    }
    
    return { data: data || [] };
  } catch (error) {
    console.error('Error in getUsersByStatus:', error);
    return handleSupabaseError(error);
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(id, status) {
  try {
    if (!id) {
      return { error: 'User ID is required' };
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update error:', error);
      return handleSupabaseError(error);
    }
    
    return { data: data && data.length > 0 ? data[0] : null };
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    return handleSupabaseError(error);
  }
}

/**
 * Get total user count from the users table
 */
export async function getUsersCount() {
  try {
    console.log('Fetching total users count...');
    
    // Count all users in the users table
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching users count:', error);
      return handleSupabaseError(error);
    }
    
    // Use count from response if available
    let totalUsers = count;
    
    // If count is not available, fetch all and count manually
    if (totalUsers === undefined || totalUsers === null) {
      const fullResponse = await supabase
        .from('users')
        .select('id');
        
      if (fullResponse.error) {
        console.error('Error fetching full users data:', fullResponse.error);
        return handleSupabaseError(fullResponse.error);
      }
      
      totalUsers = fullResponse.data?.length || 0;
    }
    
    console.log(`Found ${totalUsers} total users`);
    
    return { data: { totalUsers } };
  } catch (error) {
    console.error('Error in getUsersCount:', error);
    return handleSupabaseError(error);
  }
} 