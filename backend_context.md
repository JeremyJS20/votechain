# VoteChain Backend - Project Context & Guidelines

This document serves as the single source of truth for the VoteChain backend API. It dictates the architectural patterns, security standards, and technologies used to power the "Digital Institution" voting platform, ensuring immutable, verifiable, and fast operations.

## 1. Project Identity & Goal
*   **Name:** VoteChain API Layer
*   **Type:** Secured RESTful API
*   **Goal:** Serve as the authoritative, hardened gateway between the VoteChain client and the underlying persistence/ledger layer. It must enforce strict identity verification, ensure the cryptographic integrity of votes, and maintain high availability under load.
*   **Core Philosophy:** "Zero Trust & Immutable Audit Trails"

## 2. Technology Stack
*   **Core Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript (Strict Mode)
*   **Validation & Serialization:** Zod (shared schemas with the frontend for perfect sync)
*   **Database ORM:** Prisma (or TypeORM) for relational data integrity
*   **Primary Database:** PostgreSQL
*   **Security & HTTP:** 
    *   `helmet` (Hardened HTTP headers)
    *   `cors` (Strict origin policies and whitelists)
    *   `express-rate-limit` (DDoS mitigation & brute-force prevention)
    *   JWT / Asymmetric Key Signatures for voter tokens
*   **Testing:** Jest & Supertest

## 3. Architecture & Structure
The project strictly follows **Clean Architecture** (n-tier) principles to separate web transport concerns from core voting logic and data persistence.

### Directory Structure (`src/`)
*   **`Domain/`**: Shared interfaces, types, Zod schemas, and business rules (e.g., Ballot eligibility rules).
*   **`Presentation/` (Controllers/Routes)**: Express routers and controller functions. Solely responsible for receiving HTTP requests, validating them via middleware, calling services, and returning standard HTTP responses.
*   **`Application/` (Services)**: The core business logic. Where votes are finalized, identities are cryptographically verified, and ledger entries are prepared.
*   **`Infrastructure/` (Repositories/Config)**: 
    *   `Database`: Data access patterns (Prisma client) dealing directly with PostgreSQL.
    *   `External`: Third-party Identity verification (KYC/ID scanning wrappers) or blockchain connectors.
    *   `Middlewares`: Centralized error handling, JWT verification, rate limiting, and request logging.

## 4. Security & Cryptographic Integrity
As a high-stakes civic platform, the backend must be bulletproof:
1.  **Immutability:** Once a vote is cast, cryptographically sealed, and accepted, it cannot be mutated. Data updates are handled as append-only ledger events.
2.  **Strict Input Validation:** All incoming request bodies, params, and queries MUST be validated via Zod schemas (`Infrastructure/Middlewares/validateResource.ts`) before hitting any controller logic.
3.  **Rate Limiting:** IP-based and Token-based rate limiters must be applied globally, with highly restrictive limits on authentication, OTP requests, and ballot submission endpoints.
4.  **Logging & Audit:** Use structured, sanitised logging (e.g., `pino` or `winston`). Sensitive data (PII, raw identity tokens) MUST never be logged.

## 5. Development Workflow & Fullstack Concurrency
1.  **Monorepo Setup:** The overarching workspace should use `npm workspaces`, `yarn workspaces`, or `pnpm workspaces` along with a tool like `concurrently` so that running `npm run dev` in the root spins up the Vite frontend and Express backend simultaneously.
2.  **Environment Management:** Environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`) must be strictly supplied via `.env` (development) or CI/CD secrets (production) and never committed.
3.  **Local Dev:** Run the backend via `ts-node-dev` or `nodemon + ts-node` for lightning-fast HMR.
4.  **Shared Types:** To maintain the "Digital Institution" precision, all Zod schemas and TypeScript interfaces should be stored in a shared `packages/common` folder, imported by both the Frontend and the Express API.
