import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET → list files in the bucket
export async function GET() {
  const { data, error } = await supabase.storage.from("files").list("", {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    console.error("[files GET] storage list error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Filter out folder placeholders (Supabase adds these for empty folders)
  const fileItems = (data ?? []).filter(
    (item) => item.id !== null && item.name !== ".emptyFolderPlaceholder"
  );

  const files = fileItems.map((item) => {
    const { data: urlData } = supabase.storage.from("files").getPublicUrl(item.name);
    return {
      url: urlData.publicUrl,
      pathname: item.name,
      size: item.metadata?.size ?? 0,
      uploadedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
    };
  });

  return Response.json(files);
}

// POST → upload file via multipart form
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  // Make filename unique to avoid overwrites
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const base = file.name.slice(0, file.name.lastIndexOf(".") || file.name.length);
  const uniqueName = `${base}-${Date.now()}${ext}`;

  const { error } = await supabase.storage
    .from("files")
    .upload(uniqueName, file, { contentType: file.type || "text/plain", upsert: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from("files").getPublicUrl(uniqueName);

  return Response.json({
    url: urlData.publicUrl,
    pathname: uniqueName,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  });
}
