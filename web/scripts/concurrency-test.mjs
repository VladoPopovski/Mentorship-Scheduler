// Run from web/:  node --env-file=.env.local scripts/concurrency-test.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// 1. Create a fresh test slot ~30 days out (random minute so reruns don't collide)
const offsetMs = (30 * 24 * 60 + Math.floor(Math.random() * 600)) * 60_000;
const { data: slot, error } = await supabase
  .from("slots")
  .insert({ starts_at: new Date(Date.now() + offsetMs).toISOString(), duration_min: 15 })
  .select()
  .single();
if (error) throw error;

// 2. Fire 10 booking requests at the same moment
const results = await Promise.all(
  Array.from({ length: 10 }, (_, i) =>
    supabase.rpc("book_slot", {
      p_slot_id: slot.id,
      p_name: `Guest ${i}`,
      p_email: `guest${i}@test.com`,
    }),
  ),
);

// 3. Exactly one must win
const wins = results.filter((r) => !r.error).length;
console.log(`${wins} succeeded, ${10 - wins} rejected → ${wins === 1 ? "PASS" : "FAIL"}`);
process.exit(wins === 1 ? 0 : 1);