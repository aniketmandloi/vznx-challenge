import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import ws from "ws";
import * as schema from "./schema";

// Load environment variables from apps/web/.env
dotenv.config({ path: "../../apps/web/.env" });

neonConfig.webSocketConstructor = ws;

const sql = neon(process.env.DATABASE_URL || "");
const db = drizzle(sql, { schema });

/**
 * Seed script for VZNX Challenge database
 *
 * Creates sample data:
 * - Uses existing users from the database
 * - 5 projects with varying statuses
 * - 20+ tasks across projects
 */
async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // ============================================
    // 1. Get Existing Users
    // ============================================
    console.log("👤 Fetching existing users from database...");

    const allUsers = await db.select().from(schema.user);

    if (allUsers.length === 0) {
      console.error("\n❌ No users found in database!");
      console.error(
        "Please sign up through the app first, then run this seed script."
      );
      console.error("\nSteps:");
      console.error("  1. Start the app with 'pnpm run dev'");
      console.error("  2. Go to /signup and create an account");
      console.error("  3. Run this seed script again\n");
      process.exit(1);
    }

    console.log(`✅ Found ${allUsers.length} user(s):`);
    allUsers.forEach((user) => {
      console.log(`  - ${user.name} (${user.email})`);
      console.log(`    ID: ${user.id}`);
    });

    // Use the first user for all projects if there's only one
    // Otherwise, distribute projects across available users
    const primaryUser = allUsers[0]!;
    const secondaryUser = allUsers[1] || primaryUser;
    const tertiaryUser = allUsers[2] || primaryUser;

    const createdUsers = [primaryUser, secondaryUser, tertiaryUser];

    console.log(
      `\n✅ Will create projects for ${
        allUsers.length === 1 ? "this user" : "these users"
      }\n`
    );

    // ============================================
    // 2. Create Sample Projects
    // ============================================
    console.log("📁 Creating sample projects...");

    const projectsData = [
      {
        name: "Website Redesign",
        description:
          "Complete overhaul of company website with modern UI/UX design principles",
        status: "in-progress" as const,
        userId: createdUsers[0]!.id,
      },
      {
        name: "Mobile App Development",
        description: "Build cross-platform mobile app for iOS and Android",
        status: "planning" as const,
        userId: createdUsers[0]!.id,
      },
      {
        name: "Marketing Campaign Q1",
        description: "Launch comprehensive marketing campaign for Q1 targets",
        status: "completed" as const,
        userId: createdUsers[1]!.id,
      },
      {
        name: "API Integration",
        description: "Integrate third-party APIs for enhanced functionality",
        status: "in-progress" as const,
        userId: createdUsers[1]!.id,
      },
      {
        name: "Security Audit",
        description:
          "Comprehensive security review and vulnerability assessment",
        status: "on-hold" as const,
        userId: createdUsers[2]!.id,
      },
    ];

    const createdProjects = await Promise.all(
      projectsData.map(async (projectData) => {
        const [newProject] = await db
          .insert(schema.project)
          .values({
            ...projectData,
            progress: 0, // Will be updated after tasks are created
          })
          .returning();
        console.log(`  ✅ Created project: ${projectData.name}`);
        return newProject!;
      })
    );

    console.log(`✅ ${createdProjects.length} projects created\n`);

    // ============================================
    // 3. Create Sample Tasks
    // ============================================
    console.log("✅ Creating sample tasks...");

    const tasksData = [
      // Website Redesign tasks (Project 1)
      {
        projectId: createdProjects[0]!.id,
        name: "Design new homepage mockup",
        status: "complete" as const,
        assignedToId: createdUsers[0]!.id,
        order: 1,
      },
      {
        projectId: createdProjects[0]!.id,
        name: "Create component library",
        status: "complete" as const,
        assignedToId: createdUsers[1]!.id,
        order: 2,
      },
      {
        projectId: createdProjects[0]!.id,
        name: "Implement responsive navigation",
        status: "complete" as const,
        assignedToId: createdUsers[0]!.id,
        order: 3,
      },
      {
        projectId: createdProjects[0]!.id,
        name: "Optimize images and assets",
        status: "incomplete" as const,
        assignedToId: createdUsers[2]!.id,
        order: 4,
      },
      {
        projectId: createdProjects[0]!.id,
        name: "Set up analytics tracking",
        status: "incomplete" as const,
        assignedToId: null,
        order: 5,
      },

      // Mobile App Development tasks (Project 2)
      {
        projectId: createdProjects[1]!.id,
        name: "Research React Native vs Flutter",
        status: "complete" as const,
        assignedToId: createdUsers[0]!.id,
        order: 1,
      },
      {
        projectId: createdProjects[1]!.id,
        name: "Set up development environment",
        status: "incomplete" as const,
        assignedToId: createdUsers[1]!.id,
        order: 2,
      },
      {
        projectId: createdProjects[1]!.id,
        name: "Design app architecture",
        status: "incomplete" as const,
        assignedToId: createdUsers[0]!.id,
        order: 3,
      },
      {
        projectId: createdProjects[1]!.id,
        name: "Create wireframes",
        status: "incomplete" as const,
        assignedToId: null,
        order: 4,
      },

      // Marketing Campaign tasks (Project 3) - All complete
      {
        projectId: createdProjects[2]!.id,
        name: "Define target audience",
        status: "complete" as const,
        assignedToId: createdUsers[1]!.id,
        order: 1,
      },
      {
        projectId: createdProjects[2]!.id,
        name: "Create content calendar",
        status: "complete" as const,
        assignedToId: createdUsers[1]!.id,
        order: 2,
      },
      {
        projectId: createdProjects[2]!.id,
        name: "Design campaign materials",
        status: "complete" as const,
        assignedToId: createdUsers[2]!.id,
        order: 3,
      },
      {
        projectId: createdProjects[2]!.id,
        name: "Launch social media ads",
        status: "complete" as const,
        assignedToId: createdUsers[1]!.id,
        order: 4,
      },

      // API Integration tasks (Project 4)
      {
        projectId: createdProjects[3]!.id,
        name: "Research API documentation",
        status: "complete" as const,
        assignedToId: createdUsers[1]!.id,
        order: 1,
      },
      {
        projectId: createdProjects[3]!.id,
        name: "Set up authentication flow",
        status: "complete" as const,
        assignedToId: createdUsers[0]!.id,
        order: 2,
      },
      {
        projectId: createdProjects[3]!.id,
        name: "Implement data synchronization",
        status: "incomplete" as const,
        assignedToId: createdUsers[1]!.id,
        order: 3,
      },
      {
        projectId: createdProjects[3]!.id,
        name: "Write integration tests",
        status: "incomplete" as const,
        assignedToId: null,
        order: 4,
      },

      // Security Audit tasks (Project 5)
      {
        projectId: createdProjects[4]!.id,
        name: "Conduct vulnerability scan",
        status: "complete" as const,
        assignedToId: createdUsers[2]!.id,
        order: 1,
      },
      {
        projectId: createdProjects[4]!.id,
        name: "Review authentication mechanisms",
        status: "incomplete" as const,
        assignedToId: createdUsers[2]!.id,
        order: 2,
      },
      {
        projectId: createdProjects[4]!.id,
        name: "Update security policies",
        status: "incomplete" as const,
        assignedToId: null,
        order: 3,
      },
    ];

    const createdTasks = await Promise.all(
      tasksData.map(async (taskData) => {
        const [newTask] = await db
          .insert(schema.task)
          .values(taskData)
          .returning();
        return newTask!;
      })
    );

    console.log(`✅ ${createdTasks.length} tasks created\n`);

    // ============================================
    // 4. Update Project Progress
    // ============================================
    console.log("📊 Calculating project progress...");

    for (const proj of createdProjects) {
      const projectTasks = createdTasks.filter((t) => t.projectId === proj.id);
      const completedTasks = projectTasks.filter(
        (t) => t.status === "complete"
      );

      const progress =
        projectTasks.length > 0
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0;

      await db
        .update(schema.project)
        .set({ progress })
        .where(eq(schema.project.id, proj.id));

      console.log(
        `  ✅ ${proj.name}: ${progress}% (${completedTasks.length}/${projectTasks.length} tasks)`
      );
    }

    // ============================================
    // Summary
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("✨ Seed completed successfully!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`  👥 Users: ${allUsers.length}`);
    console.log(`  📁 Projects: ${createdProjects.length}`);
    console.log(`  ✅ Tasks: ${createdTasks.length}\n`);

    console.log("🚀 Next steps:");
    console.log("  1. Log in with your existing account");
    console.log("  2. View your projects and tasks in the dashboard");
    console.log("  3. Start managing your projects!\n");

    console.log(
      "💡 Tip: All projects and tasks are now linked to your account."
    );
    console.log(
      `   Logged in as: ${allUsers.map((u) => u.email).join(", ")}\n`
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed
seed();
