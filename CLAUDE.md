@AGENTS.md

## Project

Rose City Finds — a civic web app helping Portland, OR residents find free and
discounted food resources and community benefits. Solo project, actively used
as a vehicle for learning backend/full-stack development on top of an existing
frontend engineering background. Prefer conventional, industry-standard
approaches over custom/clever tooling — this project is meant to build real
backend credibility, not shortcuts.

**Stack:** Next.js, React, Zustand, React Query, Supabase (local + cloud),
PostgreSQL, Tailwind CSS v4, Base UI components.

## Git

Always work on the current active branch. Do not default to or switch to main.
Confirm the active branch with `git branch --show-current` before starting any
task.

## Environment

Never modify `.env*` files under any circumstances, regardless of what a task
seems to require. Flag if a task appears to need an env change and stop.

## Database / Migrations

Workflow is fixed, do not deviate:
1. `migration new` to create a migration

Never edit a migration that has already been pushed — create a new one instead.

If creating seed data, modify generate-bulk-seed.mjs and use that to modify
the seed.sql file. Do not directly modify seed.sql.

## General

Prefer showing a diff-level summary of every file touched for any multi-file
refactor before considering a task done — don't just report success on the
files most central to the task.