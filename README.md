This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase

The DB exists in supabase. If tables are updated, you can run 
npx supabase gen types typescript --project-id {{ project id goes here }} > types/supabase.ts

To keep local types in sync.

## Supabase Setup
After running migrations, expose the following tables in 
Project Settings → API → Data API → Settings:
- locations
- location_hours
- location_eligibility
- location_benefits


# Access & Moderation Roadmap
The project is designed to scale its moderation model as the community grows.
Phase 1 (current) — Admin controlled: All data goes through a single admin. Anyone can submit a new resource or propose an edit, but nothing goes live without admin approval. This ensures data accuracy in the early stages.
Phase 2 — Volunteer contributors: As the project gains momentum, trusted volunteers can be granted the contributor role, allowing them to approve edits and verify resources without admin involvement.
Phase 3 — Community moderation: If the project grows large enough, verified owners will be able to manage their own listings directly, and the model opens up to wikipedia-style community editing for general users.

#Roadmap

In the future contributors who have physically been to a location can leave reviews and rate locations.