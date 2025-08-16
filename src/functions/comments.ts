import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key (never expose this to the client!)
const SUPABASE_URL = import.meta.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const get: APIRoute = async ({ request, url }) => {
  const blogId = url.searchParams.get("blogId");
  if (!blogId) {
    return new Response(JSON.stringify({ error: "Missing blogId" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("blogId", blogId)
    .eq("approved", true)
    .order("created_at", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const post: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { blogId, comment } = body;
  if (!blogId || !comment) {
    return new Response(JSON.stringify({ error: "blogId and comment are required" }), { status: 400 });
  }

  const { data, error } = await supabase.from("comments").insert([
    { blogId, comment, approved: false, reply: null },
  ]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ status: "success", comment: data[0] }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
