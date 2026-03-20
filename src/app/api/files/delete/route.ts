import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// DELETE → ?pathname=<filename>
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const pathname = searchParams.get("pathname");
  if (!pathname) {
    return Response.json({ error: "Missing pathname parameter" }, { status: 400 });
  }

  const { error } = await supabase.storage.from("files").remove([pathname]);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
