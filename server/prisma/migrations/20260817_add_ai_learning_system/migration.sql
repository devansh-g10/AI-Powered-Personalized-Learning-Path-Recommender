-- Migration: add_ai_learning_system
-- Applied directly to Supabase via execute_sql
-- This file documents the schema changes for tracking purposes

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('HUMAN', 'AI');

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Learning Path',
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_learning_context" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "learningGoal" TEXT NOT NULL,
    "motivation" TEXT,
    "currentLevel" TEXT NOT NULL,
    "existingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentlyLearning" TEXT,
    "nextToLearn" TEXT,
    "depthPreference" TEXT NOT NULL DEFAULT 'balanced',
    "weeklyHours" INTEGER,
    "targetOutcome" TEXT,
    "preferences" TEXT,
    "additionalContext" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_learning_context_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "currentAssessment" TEXT,
    "finalOutcome" TEXT,
    "totalEstimatedWeeks" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "rawJson" JSONB NOT NULL,
    "changeHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_phases" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "estimatedWeeks" INTEGER,

    CONSTRAINT "roadmap_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_topics" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "whyThisExists" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "estimatedHours" INTEGER,
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subtopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "projects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isMilestone" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "roadmap_topics_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "conversations_userId_idx" ON "conversations"("userId");
CREATE INDEX "conversations_userId_status_idx" ON "conversations"("userId", "status");
CREATE INDEX "conversation_messages_conversationId_idx" ON "conversation_messages"("conversationId");
CREATE INDEX "conversation_messages_conversationId_createdAt_idx" ON "conversation_messages"("conversationId", "createdAt");
CREATE UNIQUE INDEX "conversation_learning_context_conversationId_key" ON "conversation_learning_context"("conversationId");
CREATE INDEX "conversation_learning_context_userId_idx" ON "conversation_learning_context"("userId");
CREATE UNIQUE INDEX "roadmaps_conversationId_key" ON "roadmaps"("conversationId");
CREATE INDEX "roadmaps_userId_idx" ON "roadmaps"("userId");
CREATE INDEX "roadmap_phases_roadmapId_idx" ON "roadmap_phases"("roadmapId");
CREATE INDEX "roadmap_topics_phaseId_idx" ON "roadmap_topics"("phaseId");
CREATE INDEX "roadmap_topics_topicId_idx" ON "roadmap_topics"("topicId");

-- Foreign Keys
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_learning_context" ADD CONSTRAINT "conversation_learning_context_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "roadmap_phases" ADD CONSTRAINT "roadmap_phases_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "roadmap_topics" ADD CONSTRAINT "roadmap_topics_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "roadmap_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
