<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and Deploy the Supabase SGQ App

This repository runs the AREA FIT SGQ platform using Supabase Auth and PostgreSQL as the primary infrastructure.

## Infrastructure

- Supabase Auth
- PostgreSQL
- Supabase Realtime

View your app in AI Studio: https://ai.studio/apps/2b0dc766-c41e-4672-a60c-01be028d05e7

## Setup

Configure the following environment variables before starting the app:

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase public anon key.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
3. Run the app:
   `npm run dev`
