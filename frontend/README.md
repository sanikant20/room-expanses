# We Roomies — Room Expenses Management

A modern room-expenses management app built with React, Vite, and Material UI. The app includes a polished dashboard experience, role-based UI sections, and reusable components for tracking shared expenses and settling balances in Nepali months.

## Tech stack

- React 19.2.7
- Vite 6.3.2
- Material UI 9.2.0
- React Router 7.18.1
- React Query 5.101.2
- React Toastify 11.1.0
- Nepali date pickers via nepali-date-converter
- PWA support via vite-plugin-pwa

## Available scripts

- `npm install` — install dependencies
- `npm run dev` or `npm start` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint on the project

## Getting started

1. Clone the repository and navigate into the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the local URL shown in the terminal.

## Project structure

- `src/pages` — public and protected screens
- `src/layout` — shared layout, header, sidebar, and navigation
- `src/components` — reusable UI components such as cards, dialogs, tables, and loaders
- `src/apis` — API integration layer for the app modules
- `src/theme` — theme configuration and color selection UI

## Notes

This project is currently focused on the frontend experience and UI flows. It is ready for further integration with live backend APIs and business data.
