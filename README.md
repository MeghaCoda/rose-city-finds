This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Deployments are handled using Vercel.


## Supabase

The DB exists in supabase which uses PostgreSQL. If tables are modified, run 
`npx supabase gen types typescript --project-id {{ project id goes here }} > types/supabase.ts` to keep local types in sync. The projet ID can be found in the dashboard.

All migrations should be handled using the supabase cli ( `npm install -D supabase` )

# Data Verification

All verified data should come with an expiration date (maximum 1 year) and must be manually verified. Data scraping was considered as a strategy, but too many expired listings remain on the internet and are not taken down or confirmed as having ended, hence manual verification via phone or discussion with business owners is strongly preferred.

# App Goals

The app is designed to prioritize data accuracy and quality above quantity of data. This is the opposite strategy of sites like RetailMeNot, which have a few valid offers alongside dozens of expired or fake offers and the user being left to sort of the valid and invalid offers themselves. 

The goal is to curate offers as carefully as possible so that users do not have to do this work themselves, with the value proposition being significantly reduced time and energy spend on searching, verifying and locating valid offers that fit their needs. 

# Access & Moderation Roadmap
The project is designed to scale its moderation model as the community grows.
Phase 1 (current / MVP) — Admin controlled: All data is uploaded through a single admin. 
Phase 2 - Addition of 'favorites' ability. Anyone can submit a new resource or propose an edit, but nothing goes live without admin approval to ensure accuracy of data, and also to figure out a moderation
plan for bots and spam.
Phase 3 — Volunteer contributors: As the project gains momentum, trusted volunteers can be granted the verifier role, allowing them to approve edits and verify resources without admin involvement.

