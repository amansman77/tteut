import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { getAllEntries } from "@/lib/livedMeaningsStore";
import { generateSemanticEdges } from "@/lib/semanticEdgeGenerator";
import { upsertSemanticEdge, clearSemanticEdges } from "@/lib/semanticEdgesStore";

async function requireAdmin(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const email = await verifySession(token);
  return email === process.env.ADMIN_EMAIL;
}

export async function POST(_req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await getAllEntries();
  const words = Object.entries(entries).map(([word, meanings]) => ({ word, meanings }));

  const edges = generateSemanticEdges(words);

  await clearSemanticEdges();
  for (const edge of edges) {
    await upsertSemanticEdge(edge.fromWord, edge.toWord, edge.score, edge.reason);
  }

  return NextResponse.json({ ok: true, generated: edges.length });
}
