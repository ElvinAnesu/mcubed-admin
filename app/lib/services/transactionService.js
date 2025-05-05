import { supabase, handleSupabaseError } from '../supabase';

/**
 * Get total deposits amount from transaction history
 */
export async function getTotalDeposits() {
  try {
    console.log('Fetching total deposits amount...');
    // Fetch all transaction records with type 'deposit'
    const { data, error } = await supabase
      .from('transaction_history')
      .select('amount')
      .eq('transaction_type', 'deposit');
    
    if (error) {
      console.error('Error fetching deposit transactions:', error);
      return handleSupabaseError(error);
    }
    
    console.log(`Found ${data?.length || 0} deposit transactions`);
    
    // Calculate total deposits amount
    const totalAmount = data?.reduce((sum, transaction) => {
      // Handle different formats of amount (string vs number)
      let amount = 0;
      try {
        amount = typeof transaction.amount === 'string'
          ? parseFloat(transaction.amount.replace(/[^0-9.-]+/g, ''))
          : Number(transaction.amount);
          
        if (isNaN(amount)) {
          console.warn('Invalid amount found:', transaction.amount);
          return sum;
        }
      } catch (e) {
        console.error('Error parsing amount:', transaction.amount, e);
        return sum;
      }
      
      return sum + amount;
    }, 0) || 0;
    
    console.log(`Calculated total deposits amount: ${totalAmount}`);
    
    return { data: { totalAmount } };
  } catch (error) {
    console.error('Error in getTotalDeposits:', error);
    return handleSupabaseError(error);
  }
}

/**
 * Get total count of processing withdrawal requests
 */
export async function getProcessingWithdrawalsCount() {
  try {
    console.log('Fetching processing withdrawals count...');
    // Count withdrawal requests with status 'processing'
    const { data, error, count } = await supabase
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');
    
    if (error) {
      console.error('Error fetching processing withdrawals count:', error);
      return handleSupabaseError(error);
    }
    
    // Use count from response if available
    let processingCount = count;
    
    // If count is not available, fetch all and count manually
    if (processingCount === undefined || processingCount === null) {
      const fullResponse = await supabase
        .from('withdrawal_requests')
        .select('id')
        .eq('status', 'processing');
        
      if (fullResponse.error) {
        console.error('Error fetching full processing withdrawals data:', fullResponse.error);
        return handleSupabaseError(fullResponse.error);
      }
      
      processingCount = fullResponse.data?.length || 0;
    }
    
    console.log(`Found ${processingCount} processing withdrawal requests`);
    
    return { data: { processingCount } };
  } catch (error) {
    console.error('Error in getProcessingWithdrawalsCount:', error);
    return handleSupabaseError(error);
  }
}

/**
 * Get recent withdrawal requests with user details
 */
export async function getRecentWithdrawals(limit = 5) {
  try {
    console.log('Fetching recent withdrawal requests...');
    // Fetch most recent withdrawal requests
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select(`
        id,
        user_id,
        amount,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent withdrawals:', error);
      return handleSupabaseError(error);
    }
    
    console.log(`Found ${data?.length || 0} recent withdrawal requests`);
    
    // If there are any withdrawal requests, fetch user details
    if (data && data.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(data.map(item => item.user_id).filter(Boolean))];
      
      // Fetch user details if there are user IDs
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        if (userError) {
          console.error('Error fetching user details:', userError);
        } else if (userData) {
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
    console.error('Error in getRecentWithdrawals:', error);
    return handleSupabaseError(error);
  }
} 