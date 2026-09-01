# 🛠️ Local Setup & Execution Instructions

Follow these step-by-step instructions to set up and run the **AI-Powered Personalized Learning Path Recommender** locally on your machine.

---

### 📋 Prerequisites
Ensure the following tools are installed:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm** (comes bundled with Node.js) or **pnpm** / **yarn**
- **Git** ([Download Git](https://git-scm.com/))

---

### 1️⃣ Clone the Repository
Open a terminal and clone the project repository:
```bash
git clone https://github.com/devansh-g10/AI-Powered-Personalized-Learning-Path-Recommender.git
cd AI-Powered-Personalized-Learning-Path-Recommender
```

---

### 2️⃣ Backend Configuration & Startup (`server/`)

Open a terminal window and execute:

#### a) Navigate & Install Dependencies
```bash
cd server
npm install
```

#### b) Configure Environment Variables
Create or verify the `.env` file in the `server/` directory with the following configuration:
```env
PORT="4000"

# Supabase Auth & Config
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Prisma Database Connections (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"

# URLs
GOOGLE_REDIRECT_URL="http://localhost:5173/auth/callback"
CLIENT_URL="http://localhost:5173"

# Mistral AI (LLM Engine)
MISTRAL_API_KEY="your_mistral_api_key_here"
MISTRAL_MODEL="mistral-small-latest"

# Upstash Redis & Caching
UPSTASH_REDIS_REST_URL="https://your-upstash-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token"
REDIS_URL="rediss://default:your_token@your-upstash-redis.upstash.io:6379"
```

#### c) Setup Prisma ORM & Database Schema
```bash
npx prisma generate
npx prisma db push
```

#### d) Run the Backend Server
```bash
npm run dev
```
> 🟢 **Backend API will run at:** `http://localhost:4000`  
> 🏥 **Health Check Endpoint:** `http://localhost:4000/` (Returns `Server is healthy ❤️`)

---

### 3️⃣ Frontend Configuration & Startup (`frontend/`)

Open a **separate/second terminal window** and execute:

#### a) Navigate & Install Dependencies
```bash
cd frontend
npm install
```

#### b) Configure Environment Variables
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL="http://localhost:4000/api"
```

#### c) Run the Frontend Development Server
```bash
npm run dev
```
> 🌐 **Frontend will run at:** `http://localhost:5173`

---

### 4️⃣ Accessing & Testing the Application

1. Open your browser and navigate to **`http://localhost:5173`**.
2. **Authentication:** Sign up with a new email/password or use existing credentials.
3. **Questionnaire:** Fill in learning goals, experience level, and preferred weekly hours.
4. **Interactive Roadmap:** View the generated personalized curriculum with phases, topics, milestones, and prerequisites.
5. **AI Tutor / Assistant:** Chat with the real-time Socratic AI Tutor to ask topic-specific doubts with streaming responses.

---

### 🏗️ Technology Summary
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios, Sonner
- **Backend:** Node.js, Express.js 5 (ES Modules), LangChain, Mistral AI (`mistral-small-latest`)
- **Database & ORM:** PostgreSQL (Supabase), Prisma ORM v7 (PgBouncer Pooling)
- **Caching & Background Queues:** Upstash Redis (`ioredis`), BullMQ Workers
