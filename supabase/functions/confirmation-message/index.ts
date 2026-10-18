// Public endpoint that only writes text. It never touches the database,
// so it needs no Supabase keys. The booking is already saved before this is called.

Deno.serve(async (req) => {
  // Browsers send a preflight request first; echo back the headers they ask for
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": req.headers.get("access-control-request-headers") ?? "*",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const reply = (message: string) =>
    new Response(JSON.stringify({ message }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });

  // Input comes from the browser, so trim and cap everything
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "there").slice(0, 100);
  const when = String(body.when ?? "soon").slice(0, 100);
  const minutes = Number(body.durationMin) || 30;

  const fallback = `You're booked, ${name}! Looking forward to seeing you.`;
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return reply(fallback);

  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.5-flash-lite";
  const prompt =
    `Write a warm, friendly booking confirmation in 2 short sentences for ${name}, ` +
    `who just booked a ${minutes}-minute coaching session on ${when}. No emojis, no markdown.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(5000), // never keep the guest waiting long
      },
    );
    if (!res.ok) throw new Error(`Gemini responded ${res.status}`);

    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();
    return reply(text || fallback);
  } catch (err) {
    console.error("Gemini call failed:", err); // shows up in the function's Logs tab
    return reply(fallback);
  }
});