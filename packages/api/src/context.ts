import type { NextRequest } from "next/server";
import { auth } from "@vznx-challenge/auth";
import { db } from "@vznx-challenge/db";

export async function createContext(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return {
    session,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
