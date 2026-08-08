import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/session";
import { getAllEntries } from "@/lib/livedMeaningsStore";
import { generateSemanticEdges } from "@/lib/semanticEdgeGenerator";
import { upsertSemanticEdge, clearSemanticEdges } from "@/lib/semanticEdgesStore";

export async function POST(_req: NextRequest) {
  if (!(await requireAdminSession())) {
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
