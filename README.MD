# ✨ VoteChain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0%2B-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite)](https://vitejs.dev/)
[![HeroUI](https://img.shields.io/badge/HeroUI-v3-00B8D9?logo=heroui)](https://heroui.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

🏛️ **VoteChain** is an institutional-grade digital voting platform with biometric verification. Built as a university project for a **Software Security** subject, it leverages agentic IDE workflows, Clean Architecture, and is **secured with blockchain technology** to explore the future of autonomous civic governance and the Sovereign Trust design system. 🗳️✨

---

## 🏛️ Sovereign Trust Aesthetic & Design

The application features the **Sovereign Trust** design system, a modern institutional interface centered on trust, depth, and clarity:
- **Tonal Architecture**: Boundaries defined through background color shifts rather than visual lines, utilizing a "Trustworthy Blue" and "Crisp White" palette.
- **Architectural Depth**: Sophisticated layering of surfaces (Surface-Low, Lowest, High) and glassmorphism security badges.
- **Monumental Typography**: High-contrast pairing of **Manrope** for authoritative headlines and **Inter** for uncompromising functional legibility.
- **Tactile Micro-animations**: Purposeful transitions and status pulses powered by **Framer Motion**.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 18 / 19](https://react.dev/) |
| **Build Tool** | [Vite](https://vite.dev/) |
| **UI Library** | [HeroUI v3](https://heroui.com/) |
| **Styling** | [Tailwind CSS v4.0](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Material Symbols](https://fonts.google.com/icons) / [Lucide](https://lucide.dev/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Validation** | [Zod](https://zod.dev/) |
| **State Management** | React Context API |
| **i18n** | [react-i18next](https://react.i18next.com/) |
| **Blockchain** | Custom Implementation (SHA-256 / PoW) |

---

## 🏛️ Architecture Overview

VoteChain utilizes **Clean Architecture** to decouple the user interface from voting logic, identity verification, and blockchain integrations.

### Layered Structure:
- **`Domain/`**: Pure business models, entities (Ballot, Candidate, Voter), and domain-specific validation logic.
- **`Data/`**: Static definitions, cryptographic constants, and institutional metadata.
- **`Infrastructure/`**: Implementation of external interactions (API Services, Blockchain connectors, Secure HTTP Client).
- **`Presentation/`**: UI components, statutory pages, hooks, and global state providers.
- **`Validation/`**: Centralized Zod schemas enforcing ballot integrity and verification constraints.
- **`Main/`**: Application entry point and monolithic wiring.

---

## 📁 Directory Structure

```text
src/
├── Domain/         # Entities & Business Rules
├── Data/           # Constants & Static Data
├── Infrastructure/ # API Services, Security & HTTP
├── Presentation/   # Components, Pages, Hooks, Context
├── Validation/     # Integrity Schemas
├── Main/           # Application Initialization
└── Assets/         # Optimized Statutory Assets
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup
Create a `.env` file in the root directory and configure your institutional nodes:
```env
# Didit Verification SDK
DIDIT_API_KEY=your_didit_api_key
DIDIT_WORKFLOW_ID=your_workflow_id
DIDIT_WEBHOOK_SECRET=your_webhook_secret

# Verification Services (Backend)
MOCK_VERIFICATION_URL=http://localhost:5174/mock-verification
DIDIT_CALLBACK_URL=http://localhost:5173/verification/biometric
DIDIT_API_URL=https://verification.didit.me/v3/session/

# Frontend Configuration
VITE_REST_API_URL=http://localhost:3000/api
```

### Development
Run the development server for the Digital Institution:
```bash
npm run dev
```

### Build
Generate a production-ready statutory bundle:
```bash
npm run build
```

---

## 🤖 Agentic Development (Optional)

VoteChain is built with an "Autonomous First" philosophy. If you are developing with an agentic IDE (like **Cursor**), we have provided architectural context to ensure your AI assistant adheres to the Sovereign Trust standards.

- **`.cursorrules`**: Institutional coding standards and UI parity rules.
- **`project_context.md`**: Global project roadmap and design philosophy.
- **`backend_context.md`**: Verification service architecture and security rules.

### ⚡ Autoskills
To bootstrap the agentic capabilities in your local environment, you can optionally run:
```bash
npx autoskills
```

---

## 🛡️ Statutory Coding Standards

- **Strict TypeScript**: No `any` types; all identity and ballot interfaces must be fully defined.
- **Institutional Wrappers**: All UI components must be generic wrappers prefixed with `Institutional`, abstracting the Sovereign Trust design rules.
- **Zero Hardcoding**: All strings must be localized via `i18next`.
- **Secured API Layer**: Components must never execute direct API calls; all IO must pass through the `Infrastructure` service layer.

---

Developed with a commitment to integrity by the **VoteChain Team**.

