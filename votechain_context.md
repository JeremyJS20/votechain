# VoteChain Frontend - Project Context & Guidelines

This document serves as the single source of truth for the VoteChain frontend project. It combines the "Sovereign Trust" design system with our established clean architecture and modern technology stack.

## 1. Project Identity & Creative North Star
*   **Name:** VoteChain
*   **Type:** Digital Secure Voting Application
*   **Creative North Star:** "The Digital Institution"
*   **Goal:** Provide a highly secure, accessible, and authoritative voting experience that balances the high-velocity precision of modern tech with the authoritative weight of a government entity.
*   **Aesthetic:** Architectural Asymmetry, intentional whitespace, high-contrast typography, and layered tonal depth.
*   **Design System:** [HeroUI v3](https://heroui.com/) + [Tailwind CSS v4.0](https://tailwindcss.com/) customized with the Sovereign Trust aesthetic.

### The "No-Line" Rule
Horizontal or vertical dividing lines (1px solid borders) are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts (tonal layering) to maintain a clean, sophisticated break without visual noise.

## 2. Design & Branding (Sovereign Trust)

### Color Palette (Tonal Architecture)
The palette is built on "Trustworthy Blues" and "Crisp Whites."
*   **Base (Surface):** `#f9f9ff` (`surface`)
*   **Sectioning:** `#f1f3ff` (`surface-container-low`)
*   **Interactive Cards:** `#ffffff` (`surface-container-lowest`)
*   **Active Modals:** `#e0e8ff` (`surface-container-high`)
*   **Primary Accent:** `#003d9b` (`primary`) to `#0052cc` (`primary_container`) gradient.
*   **Active Selection:** `#dae2ff` (`primary_fixed`)
*   **Text (On-Background):** `#141b2c` (Avoid pure black).
*   **Error / Alert:** `#ffdad6` (`error_container`) background with `#93000a` (`on_error_container`) text.

### Typography (The Editorial Voice)
*   **Display / Headers:** [Manrope](https://fonts.google.com/specimen/Manrope) (Geometric authority).
    *   Display-LG: 3.5rem, -0.02em letter spacing (Hero text / Thank you screens).
    *   Headline-MD: 1.75rem, Bold (Candidate names, ballot questions).
*   **Body / Functional:** [Inter](https://fonts.google.com/specimen/Inter) (Unparalleled legibility).
    *   Body-LG: 1rem, 1.6 line-height (Voter instructions).
    *   Label-MD: 0.75rem, uppercase, +0.05em tracking (Metadata, security tags).

### Elevation, Depth & Core Components
Eschew traditional drop shadows for Tonal Layering.
*   **Buttons:** Oversized (64px min height). Primary buttons use a linear gradient from `primary` to `primary_container` (135deg). Active state scales down at 0.98x for tactile feedback.
*   **Candidate Cards:** Base of `surface-container-low`. Selected state shifts to `primary_fixed` with a "Ghost Border" (`primary` at 20% opacity).
*   **Blockchain Security Badges:** Glassmorphism using `surface-container-lowest` at 70% opacity with a 24px backdrop-blur. Include a tiny accent dot (`#7b2600`) to indicate "Live Encryption."
*   **Progress Indicators:** Segmented blocks using `surface-container-highest` for empty and `#0c56d0` for active states.
*   **Inputs:** 56px height, `surface-container-lowest` background. Active state is a 2px bottom-only highlight in `primary`.

## 3. Technology Stack
*   **Core Framework:** React 18 (Vite-based).
*   **Language:** TypeScript (Strict mode).
*   **UI Library:** HeroUI v3.
*   **Styling:** Tailwind CSS.
*   **Routing:** React Router Dom v6.
*   **HTTP Client:** Axios (Custom `HttpClient` wrapper).
*   **State Management:** React Context API (Auth, Language, Theme, Voting State).
*   **Validation:** Zod (for data schemas, forms, and ballot integrity).
*   **Internationalization:** `react-i18next`.

## 4. Architecture & Structure
The project strictly follows **Clean Architecture** principles to decouple business logic from UI and external APIs.

### Directory Structure (`src/`)
*   **`Domain/`**: The heart of the app. Contains pure business models, entities, and interfaces (e.g., Ballot, Candidate, Voter).
*   **`Data/`**: Static data definitions and constants.
*   **`Infrastructure/`**: External world implementations. (API Clients, Blockchain integrations, Services).
*   **`Presentation/`**: Everything related to the UI and UX.
    *   `Components/`: Reusable, atomic components built strictly to the Sovereign Trust specs.
    *   `Pages/`: High-level page orchestrators.
    *   `Hooks/` & `Context/`: State management and custom hooks.
*   **`Main/`**: Application wiring (`App.tsx`, `main.tsx`).
*   **`Validation/`**: Zod validators and business rules enforcing voting constraints.

## 5. Coding Standards & Conventions
### React & TypeScript
*   **Functional Components:** Always use functional components with strict typing. Avoid `any`.
*   **Generic & Reusable Components (MANDATORY):** All UI components MUST be built as generic wrappers around HeroUI components, abstracting the Sovereign Trust design rules so they are applied uniformly.
*   **Layers Separation:** NEVER perform direct API calls inside a component. Rely on an injected or imported `Service` from the Infrastructure layer.

### Styling & UI
*   **HeroUI First:** Base layouts on HeroUI, overridden with Tailwind utilizing our mapped Tonal Architecture theme variables.
*   **Interaction Note:** Consistently apply the 0.98x scale-down on all interactive elements across the platform.

## 6. Frontend Performance & Security
*   **SWC Integration:** Uses `@vitejs/plugin-react-swc` for fast local development.
*   **Security First:** Ensure all voting submissions and identity verifications are routed securely, leveraging cryptographic principles where applicable to match the "Institution" theme.

## 7. Development Workflow
1.  **Environment Setup:** Ensure `VITE_REST_API_URL` and applicable blockchain variables are configured in `.env`.
2.  **Dependencies:** Use `npm install` for reproducible builds.
3.  **Local Dev:** `npm run dev` for HMR.
4.  **Verification:** `npm run test` (Vitest) and `npm run lint` before committing.
5.  **Build:** `npm run build` generates a production-ready `dist` folder.
