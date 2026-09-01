# Contributing to AI-Powered Personalized Learning Path Recommender

First off, thank you for considering contributing to **AI-Powered Personalized Learning Path Recommender**! 🎉 Open source projects thrive because of contributors like you.

Please take a moment to review this document to make the contribution process smooth and enjoyable for everyone.

---

## 📜 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [How Can I Contribute?](#-how-can-i-contribute)
3. [Local Development Setup](#-local-development-setup)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
4. [Branching & Git Workflow](#-branching--git-workflow)
5. [Commit Message Guidelines](#-commit-message-guidelines)
6. [Submitting a Pull Request (PR)](#-submitting-a-pull-request-pr)
7. [Reporting Bugs & Feature Requests](#-reporting-bugs--feature-requests)

---

## 🛡️ Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior according to the instructions in that document.

---

## 💡 How Can I Contribute?

There are many ways you can contribute to this project:
- 🐛 **Fixing Bugs:** Check open issues with the `bug` tag and fix them.
- ✨ **Adding Features:** Check issues labeled `enhancement` or propose your own!
- 📝 **Improving Documentation:** Fix typos, clarify setup guides, or add architecture diagrams.
- 🎨 **UI / UX Polish:** Enhance design consistency, animations, or accessibility.
- 🧪 **Writing Tests:** Help increase test coverage for both backend APIs and frontend components.
- 🌟 **Good First Issues:** If you're new to the project, look for issues labeled `good first issue`!

---

## ⚙️ Local Development Setup

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (or Supabase instance)
- [Redis](https://redis.io/) (for BullMQ background task processing)

### 1. Fork & Clone Repository
```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/AI-Powered-Personalized-Learning-Path-Recommender.git
cd AI-Powered-Personalized-Learning-Path-Recommender
```

### 2. Backend Setup (`/server`)
```bash
cd server
npm install

# Copy sample environment variables
cp .env.example .env
# Edit .env with your PostgreSQL, Redis, Mistral/AI and OAuth credentials

# Run database migrations / generate Prisma client
npx prisma generate
npx prisma db push

# Start backend dev server (runs on port 3000 by default)
npm run dev
```

### 3. Frontend Setup (`/frontend`)
```bash
cd ../frontend
npm install

# Copy sample environment variables
cp .env.example .env

# Start frontend development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌿 Branching & Git Workflow

1. Always sync your `main` branch with the upstream repository:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create a new branch with a descriptive name:
   ```bash
   # For features:
   git checkout -b feat/add-roadmap-export

   # For bug fixes:
   git checkout -b fix/auth-token-expiry

   # For documentation:
   git checkout -b docs/update-api-reference
   ```

---

## ✍️ Commit Message Guidelines

We follow standard conventional commit conventions:

- `feat: <description>` - A new feature
- `fix: <description>` - A bug fix
- `docs: <description>` - Documentation changes
- `style: <description>` - Code style / formatting changes (no logic changes)
- `refactor: <description>` - Code changes that neither fix bugs nor add features
- `test: <description>` - Adding or updating tests
- `chore: <description>` - Build process, dependency updates, tooling

**Example:**
```bash
git commit -m "feat: add PDF export for generated learning roadmap"
```

---

## 🚀 Submitting a Pull Request (PR)

1. Ensure your code passes linting and builds cleanly:
   ```bash
   # In /frontend
   npm run lint
   npm run build
   ```
2. Push your changes to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
3. Open a Pull Request from your branch to `main` of the upstream repository.
4. Fill out the PR template completely:
   - What problem does this solve?
   - Steps taken to verify/test the changes.
   - Screenshots/screen recordings (for frontend/UI changes).
5. A maintainer will review your PR and suggest changes if needed!

---

## 🐞 Reporting Bugs & Feature Requests

- **Bugs:** Check existing issues before opening a new one. Provide reproducible steps, expected vs actual behavior, and environment details.
- **Features:** Explain the problem you're trying to solve and how the proposed feature addresses it.

---

Thank you for building with us! ❤️
