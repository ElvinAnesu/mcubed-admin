# MCubed Admin Dashboard

An administrative dashboard for managing users and withdrawal requests.

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (see below)
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

This project uses Supabase for its backend. Copy the `example.env.local` file to `.env.local` and update with your Supabase credentials:

```bash
cp example.env.local .env.local
```

Then edit `.env.local` to add your Supabase URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project dashboard under Project Settings > API.

## Features

- User authentication
- Dashboard with key metrics
- User management
- Withdrawal request processing

## Supabase Setup

For detailed Supabase setup instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Default Login Credentials

For testing purposes, use the following credentials:

- Email: `elvin@gmail.com`
- Password: `password`

In a production environment, you should replace this with a proper authentication system.
