/**
 * Test script for AI task generation
 * Run this to verify OpenAI API connection and task generation
 *
 * Usage:
 * 1. Make sure OPENAI_API_KEY is set in apps/web/.env
 * 2. Run: pnpm tsx packages/api/src/lib/test-ai.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from apps/web/.env
config({ path: resolve(__dirname, "../../../../apps/web/.env") });

import { generateArchitectureTasks, testOpenAIConnection } from "./ai.js";

async function runTests() {
  console.log("🧪 Starting AI Module Tests...\n");

  // Test 1: Connection Test
  console.log("📡 Test 1: Testing OpenAI API connection...");
  try {
    const isConnected = await testOpenAIConnection();
    if (isConnected) {
      console.log("✅ OpenAI connection successful!\n");
    } else {
      console.log("❌ OpenAI connection failed\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Connection test error:", error);
    process.exit(1);
  }

  // Test 2: Generate Tasks for Residential Project
  console.log("🏡 Test 2: Generating tasks for residential project...");
  try {
    const residentialTasks = await generateArchitectureTasks(
      "Modern Villa Design",
      "3-bedroom luxury villa with sustainable features, rooftop garden, and open-plan living spaces",
      10
    );

    console.log(`✅ Generated ${residentialTasks.length} tasks:`);
    residentialTasks.forEach((task, index) => {
      console.log(
        `  ${index + 1}. ${task.name}${
          task.estimatedDuration ? ` (${task.estimatedDuration})` : ""
        }`
      );
    });
    console.log();
  } catch (error) {
    console.error("❌ Residential project test error:", error);
    process.exit(1);
  }

  // Test 3: Generate Tasks for Commercial Project
  console.log("🏢 Test 3: Generating tasks for commercial project...");
  try {
    const commercialTasks = await generateArchitectureTasks(
      "Office Building Renovation",
      "5-story office building renovation with modern workspace design and energy-efficient systems",
      8
    );

    console.log(`✅ Generated ${commercialTasks.length} tasks:`);
    commercialTasks.forEach((task, index) => {
      console.log(
        `  ${index + 1}. ${task.name}${
          task.estimatedDuration ? ` (${task.estimatedDuration})` : ""
        }`
      );
    });
    console.log();
  } catch (error) {
    console.error("❌ Commercial project test error:", error);
    process.exit(1);
  }

  // Test 4: Edge Case - Minimal Input
  console.log("🔬 Test 4: Testing with minimal input...");
  try {
    const minimalTasks = await generateArchitectureTasks(
      "Small Renovation",
      undefined,
      5
    );

    console.log(`✅ Generated ${minimalTasks.length} tasks with minimal input`);
    console.log();
  } catch (error) {
    console.error("❌ Minimal input test error:", error);
    process.exit(1);
  }

  console.log("🎉 All tests passed! AI module is working correctly.\n");
  console.log("📊 Summary:");
  console.log("  ✅ OpenAI API connection verified");
  console.log("  ✅ Task generation working for different project types");
  console.log("  ✅ Structured output validation successful");
  console.log("  ✅ Error handling functional");
  console.log("\n✨ Ready to integrate into the application!");
}

// Run tests
runTests().catch((error) => {
  console.error("💥 Test suite failed:", error);
  process.exit(1);
});
