import { supabase, handleSupabaseError } from '../supabase';

/**
 * Fetch all withdrawal requests with user details
 */
export async function getWithdrawalRequests() {
  try {
    // Use a simpler query that doesn't rely on foreign key relationships
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select(`
        id,
        user_id,
        method_id,
        amount,
        status,
        processed_at,
        processed_by,
        transaction_reference,
        notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      return handleSupabaseError(error);
    }
    
    // Optionally, if you still need user data, fetch it separately
    if (data && data.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(data.map(item => item.user_id).filter(Boolean))];
      
      // Fetch user details if there are user IDs
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        if (!userError && userData) {
          // Create a map of user data for quick lookup
          const userMap = userData.reduce((map, user) => {
            map[user.id] = user;
            return map;
          }, {});
          
          // Add user data to each withdrawal request
          data.forEach(withdrawal => {
            withdrawal.user = userMap[withdrawal.user_id] || null;
          });
        }
      }
    }
    
    return { data: data || [] };
  } catch (error) {
    console.error('Error in getWithdrawalRequests:', error);
    return handleSupabaseError(error);
  }
}

/**
 * Fetch withdrawal requests filtered by status
 */
export async function getWithdrawalRequestsByStatus(status) {
  try {
    // Use a simpler query that doesn't rely on foreign key relationships
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select(`
        id,
        user_id,
        method_id,
        amount,
        status,
        processed_at,
        processed_by,
        transaction_reference,
        notes,
        created_at,
        updated_at
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      return handleSupabaseError(error);
    }
    
    // Optionally, if you still need user data, fetch it separately
    if (data && data.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(data.map(item => item.user_id).filter(Boolean))];
      
      // Fetch user details if there are user IDs
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        if (!userError && userData) {
          // Create a map of user data for quick lookup
          const userMap = userData.reduce((map, user) => {
            map[user.id] = user;
            return map;
          }, {});
          
          // Add user data to each withdrawal request
          data.forEach(withdrawal => {
            withdrawal.user = userMap[withdrawal.user_id] || null;
          });
        }
      }
    }
    
    return { data: data || [] };
  } catch (error) {
    console.error('Error in getWithdrawalRequestsByStatus:', error);
    return handleSupabaseError(error);
  }
}

/**
 * Update withdrawal request status
 */
export async function updateWithdrawalStatus(id, { status, processed_by, transaction_reference, notes }) {
  try {
    if (!id) {
      return { error: 'Withdrawal ID is required' };
    }
    
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };
    
    // Only add these fields if the status is being changed to Completed or Rejected
    if (status === 'Completed' || status === 'Rejected') {
      updateData.processed_at = new Date().toISOString();
      updateData.processed_by = processed_by;
      
      if (transaction_reference) {
        updateData.transaction_reference = transaction_reference;
      }
      
      if (notes) {
        updateData.notes = notes;
      }
    }
    
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update error:', error);
      return handleSupabaseError(error);
    }
    
    return { data: data && data.length > 0 ? data[0] : null };
  } catch (error) {
    console.error('Error in updateWithdrawalStatus:', error);
    return handleSupabaseError(error);
  }
}

/**
 * Get withdrawal statistics
 */
export async function getWithdrawalStats() {
  try {
    console.log('Fetching withdrawal stats...');
    
    // Fetch all withdrawal requests for counting and summing
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('id, amount, status');
    
    if (error) {
      console.error('Error fetching withdrawal data:', error);
      return handleSupabaseError(error);
    }
    
    // Debug
    console.log(`Total records fetched: ${data ? data.length : 0}`);
    if (data && data.length > 0) {
      console.log('Status distribution:', data.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}));
    }
    
    // Manually calculate the stats from the data
    const totalCount = data ? data.length : 0;
    
    // Calculate processing amount - use case insensitive comparison
    const processingData = data ? data.filter(item => {
      const status = (item.status || '').toLowerCase();
      return status === 'processing';
    }) : [];
    
    console.log(`Processing records: ${processingData.length}`);
    if (processingData.length > 0) {
      console.log('Processing records:', processingData);
    }
    
    let pendingAmount = 0;
    if (processingData.length > 0) {
      pendingAmount = processingData.reduce((sum, item) => {
        // Ensure amount is a valid number
        let amount = 0;
        try {
          amount = typeof item.amount === 'string' 
            ? parseFloat(item.amount.replace(/[^0-9.-]+/g, ''))
            : Number(item.amount);
        } catch (e) {
          console.error('Error parsing amount:', item.amount, e);
        }
        
        if (isNaN(amount)) {
          console.warn('Invalid amount found:', item.amount);
          amount = 0;
        }
        
        return sum + amount;
      }, 0);
    }
    console.log(`Calculated processing amount: ${pendingAmount}`);
    
    // Calculate completed amount
    const completedData = data ? data.filter(item => {
      const status = (item.status || '').toLowerCase();
      return status === 'completed';
    }) : [];
    
    console.log(`Completed records: ${completedData.length}`);
    
    let completedAmount = 0;
    if (completedData.length > 0) {
      completedAmount = completedData.reduce((sum, item) => {
        // Ensure amount is a valid number
        let amount = 0;
        try {
          amount = typeof item.amount === 'string' 
            ? parseFloat(item.amount.replace(/[^0-9.-]+/g, ''))
            : Number(item.amount);
        } catch (e) {
          console.error('Error parsing amount:', item.amount, e);
        }
        
        if (isNaN(amount)) {
          console.warn('Invalid amount found:', item.amount);
          amount = 0;
        }
        
        return sum + amount;
      }, 0);
    }
    console.log(`Calculated completed amount: ${completedAmount}`);
    
    // Return the results
    return { 
      data: {
        totalCount,
        pendingAmount,
        completedAmount
      } 
    };
  } catch (error) {
    console.error('Error in getWithdrawalStats:', error);
    return handleSupabaseError(error);
  }
} 