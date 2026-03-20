import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// PUT body: { pathname, content }
export async function PUT(req: Request) {
  const { pathname, content } = await req.json();
  if (!pathname || content === undefined) {
    return Response.json({ error: "Missing pathname or content" }, { status: 400 });
  }

  const blob = new Blob([content], { type: "text/plain" });

  const { error } = await supabase.storage
    .from("files")
    .update(pathname, blob, { contentType: "text/plain", upsert: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from("files").getPublicUrl(pathname);

  return Response.json({
    url: urlData.publicUrl,
    pathname,
    size: content.length,
    uploadedAt: new Date().toISOString(),
  });
}
