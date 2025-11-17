import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

/**
 * AI Configuration
 * Using environment variables for flexibility and security
 */
const getOpenAIConfig = () => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

  if (!OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Please add it to your .env file."
    );
  }

  return { OPENAI_API_KEY, AI_MODEL };
};

/**
 * Initialize OpenAI provider with API key (lazy initialization)
 */
let openaiInstance: ReturnType<typeof createOpenAI> | null = null;

const getOpenAI = () => {
  if (!openaiInstance) {
    const { OPENAI_API_KEY } = getOpenAIConfig();
    openaiInstance = createOpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }
  return openaiInstance;
};

/**
 * Zod schema for a single generated task
 * Ensures type safety and validation
 */
const generatedTaskSchema = z.object({
  name: z
    .string()
    .min(3, "Task name must be at least 3 characters")
    .max(200, "Task name must not exceed 200 characters"),
  order: z.number().int().min(0, "Task order must be a positive integer"),
  estimatedDuration: z
    .string()
    .optional()
    .describe("Optional estimated duration (e.g., '2-3 days', '1 week')"),
});

/**
 * Zod schema for the complete response
 * Contains an array of tasks
 */
const taskGenerationResponseSchema = z.object({
  tasks: z
    .array(generatedTaskSchema)
    .min(3, "At least 3 tasks must be generated")
    .max(20, "Maximum 20 tasks can be generated"),
});

/**
 * Type inference from Zod schema
 */
export type GeneratedTask = z.infer<typeof generatedTaskSchema>;
export type TaskGenerationResponse = z.infer<
  typeof taskGenerationResponseSchema
>;

/**
 * System prompt for architecture task generation
 * Provides context and instructions to the AI model
 */
const ARCHITECTURE_TASK_SYSTEM_PROMPT = `You are an expert architecture project management assistant with deep knowledge of architectural workflows and best practices.

Your task is to generate specific, actionable tasks for architecture projects based on the project name and description provided.

Follow these guidelines:
1. Generate 8-12 tasks that cover the full architecture project lifecycle
2. Tasks should follow standard architecture workflow phases:
   - Concept Design (programming, site analysis, initial sketches)
   - Schematic Design (floor plans, elevations, 3D studies)
   - Design Development (detailed drawings, material selections)
   - Construction Documents (technical drawings, specifications)
   - Bidding & Negotiation (contractor selection, cost estimates)
   - Construction Administration (site visits, RFIs, submittals)

3. Make tasks specific to the project type (residential, commercial, institutional, etc.)
4. Use professional architectural terminology
5. Order tasks chronologically (concept → construction)
6. Include both creative and technical tasks
7. Consider project-specific requirements from the description
8. Provide realistic estimated durations where applicable

Example task names:
- "Conduct site analysis and zoning review"
- "Develop conceptual design sketches and mood boards"
- "Create schematic floor plans and site plan"
- "Prepare 3D massing studies and renderings"
- "Develop detailed construction drawings and specifications"

Return ONLY the structured JSON with the tasks array. Do not include any additional text or explanations.`;

/**
 * Main function to generate architecture tasks using AI
 *
 * @param projectName - Name of the architecture project
 * @param projectDescription - Optional detailed description of the project
 * @param taskCount - Number of tasks to generate (default: 10, min: 3, max: 20)
 * @returns Promise<GeneratedTask[]> - Array of generated tasks with names, orders, and optional durations
 *
 * @throws {Error} If API key is missing
 * @throws {Error} If OpenAI API request fails
 * @throws {Error} If response validation fails
 *
 * @example
 * ```typescript
 * const tasks = await generateArchitectureTasks(
 *   "Modern Villa Design",
 *   "3-bedroom luxury villa with sustainable features",
 *   10
 * );
 * console.log(tasks); // [{ name: "...", order: 0, estimatedDuration: "2-3 days" }, ...]
 * ```
 */
export async function generateArchitectureTasks(
  projectName: string,
  projectDescription?: string,
  taskCount: number = 10
): Promise<GeneratedTask[]> {
  try {
    // Get OpenAI configuration
    const { AI_MODEL } = getOpenAIConfig();
    const openai = getOpenAI();

    // Validate input parameters
    if (!projectName || projectName.trim().length === 0) {
      throw new Error("Project name is required");
    }

    if (taskCount < 3 || taskCount > 20) {
      throw new Error("Task count must be between 3 and 20");
    }

    // Construct user prompt with project details
    const userPrompt = `Generate ${taskCount} architecture project tasks for the following project:

Project Name: ${projectName}
${projectDescription ? `Project Description: ${projectDescription}` : ""}

Generate ${taskCount} specific, actionable tasks following the standard architecture workflow phases.
Each task should have a clear name, sequential order (0-${
      taskCount - 1
    }), and optionally an estimated duration.`;

    // Call OpenAI API with structured output using AI SDK 5
    const result = await generateObject({
      model: openai(AI_MODEL),
      schema: taskGenerationResponseSchema,
      system: ARCHITECTURE_TASK_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    // Return the validated tasks array
    return result.object.tasks;
  } catch (error) {
    // Enhanced error handling with specific error types
    if (error instanceof Error) {
      // Check for specific OpenAI errors
      if (error.message.includes("rate_limit")) {
        throw new Error(
          "OpenAI API rate limit exceeded. Please try again in a few moments."
        );
      }

      if (error.message.includes("invalid_api_key")) {
        throw new Error(
          "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable."
        );
      }

      if (error.message.includes("insufficient_quota")) {
        throw new Error(
          "OpenAI API quota exceeded. Please check your billing settings."
        );
      }

      // Re-throw with more context
      throw new Error(`Failed to generate tasks: ${error.message}`);
    }

    // Unknown error type
    throw new Error("An unexpected error occurred while generating tasks");
  }
}

/**
 * Helper function to parse and validate task response
 * This can be used if you receive raw text responses that need parsing
 *
 * @param responseText - Raw text response from AI
 * @returns ParsedTasks - Validated and parsed tasks
 *
 * @deprecated Use generateArchitectureTasks instead which uses structured outputs
 */
export function parseTasksFromResponse(responseText: string): GeneratedTask[] {
  try {
    const parsed = JSON.parse(responseText);
    const validated = taskGenerationResponseSchema.parse(parsed);
    return validated.tasks;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => issue.message)
        .join(", ");
      throw new Error(`Invalid task response format: ${errorMessages}`);
    }
    throw new Error("Failed to parse task response");
  }
}

/**
 * Health check function to verify OpenAI API connection
 * Useful for testing and validation
 *
 * @returns Promise<boolean> - True if connection is successful
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const testResult = await generateArchitectureTasks(
      "Test Project",
      "Simple test project for validation",
      3
    );

    return testResult.length >= 3;
  } catch (error) {
    console.error("OpenAI connection test failed:", error);
    return false;
  }
}
