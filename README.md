# Real-time Patient Intake

A real-time patient intake demo built with Next.js + Supabase Realtime.

The app has two views:

- Patient view (`/`): patient fills out the intake form.
- Staff view (`/staff`): staff can monitor typing/submission status and live draft values.

## Features

- Live field updates from patient form to staff dashboard via Supabase Broadcast.
- Online/offline + activity tracking (`typing`, `inactive`, `submitted`) via Supabase Presence.
- Schema-based validation using Zod and React Hook Form.
- Toast feedback for form submission using Sonner.
- UI built with shadcn/ui + Tailwind CSS.

## Bonus Features

- Live "Last Changed Field" indicator on staff dashboard.
- Realtime visual highlight for the field currently being edited.
- Activity timeline widgets: Last Activity and Submitted At timestamps.
- Auto-switch patient status to `inactive` after a short idle timeout.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Supabase JS (Realtime channels)
- React Hook Form + Zod
- Tailwind CSS 4 + shadcn/ui

## Prerequisites

- Node.js 22+
- npm 10+
- A Supabase project with Realtime enabled

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
```

Notes:

- Variables are read in `utils/supabase/client.ts`.
- Both values are required for the app to connect to Supabase Realtime.

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` for the patient form.
Open `http://localhost:3000/staff` for the staff realtime dashboard.

## Production Build

```bash
npm run build
npm run start
```

## How Realtime Works

Shared constants and payload types live in `lib/realtime.ts`.

Patient page behavior:

- Joins channel `patient-intake-room`.
- Tracks presence with status updates.
- Broadcasts `patient-field-changed` on each form field change.
- Broadcasts `patient-submitted` on submit.

Staff page behavior:

- Subscribes to the same channel.
- Listens for both broadcast events.
- Syncs presence state to show patient online/offline and current status.
- Shows last changed field, last activity time, and submitted timestamp.

## Form Validation Rules

Validation schema is defined in `lib/validations.ts`.

Highlights:

- Required fields: first name, last name, DOB, gender, nationality, phone, email, address, preferred language.
- Phone: 9-15 characters, allows digits and `+ - ( )`.
- Email: must be valid format.

## Useful Scripts

- `npm run dev` - start dev server
- `npm run build` - build for production
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Project Structure

```text
app/
	page.tsx                 # Patient page
	staff/page.tsx           # Staff dashboard page
components/
	patient/patient-form.tsx
	staff/staff-dashboard.tsx
lib/
	realtime.ts              # Channel/event names and payload types
	validations.ts           # Zod schema + default form values
utils/supabase/
	client.ts                # Supabase browser client
```
