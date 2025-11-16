ALTER TABLE "task" ADD COLUMN "ai_generated" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "metadata" jsonb;