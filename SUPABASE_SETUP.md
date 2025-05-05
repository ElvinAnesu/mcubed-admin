# Supabase Setup Instructions

This document outlines how to set up Supabase for this dashboard application.

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

Replace the placeholder values with your actual Supabase URL and anon key from your Supabase project dashboard.

## Getting Your Supabase Credentials

1. Sign up or log in to [Supabase](https://supabase.com/)
2. Create a new project
3. Once your project is created, go to the Project Settings > API
4. Copy the URL and anon key values to your `.env.local` file

## Database Schema

Here's a suggested schema for your application:

### Users Table
```sql
create table users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  status text not null default 'Active',
  role text not null default 'User',
  joined_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a policy to allow reading users
create policy "Allow public read access to users"
on users for SELECT 
USING (true);

-- Create a policy to allow admins to update users
create policy "Allow admins to update users"
on users for UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

### Withdrawal Requests Table
```sql
create table withdrawal_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  amount decimal not null,
  status text not null default 'Pending',
  request_date timestamp with time zone default now(),
  account text not null,
  completed_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a policy to allow reading withdrawal requests
create policy "Allow public read access to withdrawal_requests"
on withdrawal_requests for SELECT 
USING (true);

-- Create a policy to allow admins to update withdrawal requests
create policy "Allow admins to update withdrawal_requests"
on withdrawal_requests for UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

## Authentication Setup

1. Go to Authentication > Settings in your Supabase project
2. Configure the authentication providers you want to use
3. For email auth, you can enable "Email auth" and configure required settings

## Row Level Security

The above SQL includes basic Row Level Security (RLS) policies. Adjust these according to your application's security requirements.

## Next Steps

After setting up your Supabase project and tables:

1. Update the login functionality to use Supabase Auth
2. Replace the dummy data in the dashboard with real data from Supabase
3. Implement Supabase queries in the users and withdrawals pages 