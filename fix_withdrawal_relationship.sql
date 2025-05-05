-- First, we need to ensure the profiles table has an id column that's a primary key
-- If the profiles table doesn't exist or doesn't have the correct structure,
-- this query will create/modify it accordingly

-- Check if profiles table exists with id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    -- Create profiles table if it doesn't exist
    CREATE TABLE profiles (
      id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
      full_name TEXT,
      email TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  ELSIF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
  ) THEN
    -- Add id column if it doesn't exist
    ALTER TABLE profiles ADD COLUMN id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4();
  END IF;
END
$$;

-- Now add foreign key constraint to withdrawal_requests table
-- First, check if it already has the constraint to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'withdrawal_requests'
    AND constraint_name = 'withdrawal_requests_user_id_fkey'
  ) THEN
    ALTER TABLE withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id);
  END IF;
END
$$; 