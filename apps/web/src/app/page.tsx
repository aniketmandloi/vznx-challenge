"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fadeInUp, staggerContainer, transitions } from "@/lib/animations";
import { FolderKanban, CheckCircle2, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Gradient Mesh Background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              var(--gradient-mesh-1),
              var(--gradient-mesh-2),
              var(--gradient-mesh-3)
            `,
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        className="container relative mx-auto px-4 py-20 md:py-32"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline with Gradient Text */}
          <motion.h1
            variants={fadeInUp}
            className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl"
            style={{
              letterSpacing: "var(--letter-spacing-tight)",
              lineHeight: "var(--line-height-tight)",
            }}
          >
            <span
              className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-text)",
              }}
            >
              Project Management,
            </span>
            <br />
            <span className="text-foreground">Simplified</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl"
            style={{
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Streamline your architecture studio workflow with intuitive project
            tracking, task management, and team collaboration—all in one elegant
            workspace.
          </motion.p>

          {/* CTA Buttons with Glass Morphism */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group relative overflow-hidden px-8 py-6 text-lg font-medium shadow-lg transition-all hover:shadow-xl"
                style={{
                  boxShadow: "var(--shadow-colored)",
                }}
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="group px-8 py-6 text-lg font-medium backdrop-blur-sm transition-all hover:bg-secondary/50"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(8px)",
                }}
              >
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Showcase Section */}
      <motion.section
        className="container relative mx-auto px-4 py-16 md:py-24"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={fadeInUp} className="mb-16 text-center">
          <h2
            className="mb-4 text-3xl font-bold md:text-4xl"
            style={{
              letterSpacing: "var(--letter-spacing-tight)",
            }}
          >
            Everything you need to succeed
          </h2>
          <p
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
            style={{
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Powerful features designed for modern architecture teams
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Feature 1: Projects */}
          <FeatureCard
            icon={<FolderKanban className="h-10 w-10" />}
            title="Project Organization"
            description="Create and manage multiple projects with ease. Track progress, set deadlines, and keep everything organized in one beautiful interface."
            gradient="from-blue-500 to-cyan-500"
            delay={0}
          />

          {/* Feature 2: Tasks */}
          <FeatureCard
            icon={<CheckCircle2 className="h-10 w-10" />}
            title="Task Management"
            description="Break down complex projects into manageable tasks. Assign responsibilities, set priorities, and track completion with intuitive workflows."
            gradient="from-purple-500 to-pink-500"
            delay={0.1}
          />

          {/* Feature 3: Team */}
          <FeatureCard
            icon={<Users className="h-10 w-10" />}
            title="Team Collaboration"
            description="Monitor team capacity, distribute workload effectively, and ensure everyone stays productive without burning out."
            gradient="from-orange-500 to-red-500"
            delay={0.2}
          />
        </div>
      </motion.section>

      {/* Decorative Floating Elements */}
      <motion.div
        className="pointer-events-none absolute left-10 top-1/4 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-1/4 right-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl"
        animate={{
          y: [20, -20, 20],
          x: [10, -10, 10],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
}: FeatureCardProps) {
  return (
    <motion.div variants={fadeInUp} transition={{ delay }}>
      <Card
        className="group relative h-full overflow-hidden border-2 transition-all duration-300 hover:border-primary/50"
        style={{
          background: "var(--gradient-card), var(--card)",
        }}
      >
        {/* Hover Glow Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.05 }}
        />

        <CardHeader className="relative">
          {/* Icon with Gradient Background */}
          <motion.div
            className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 text-white`}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={transitions.spring}
          >
            {icon}
          </motion.div>

          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>

        <CardContent className="relative">
          <CardDescription
            className="text-base"
            style={{
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            {description}
          </CardDescription>
        </CardContent>

        {/* Shimmer Effect on Hover */}
        <motion.div
          className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: "var(--gradient-shimmer)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </Card>
    </motion.div>
  );
}
