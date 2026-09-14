import { createClient } from "../../lib/supabase/server";

export default async function TestSupabasePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>❌ Supabase connection failed</h1>

        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>✅ Supabase connection works!</h1>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
