// Quick test: check what happens with a management key vs API key on OpenRouter

async function testKey() {
  // Read key from stdin or env
  const key = process.argv[2] || "";
  if (!key) {
    console.log("Usage: node scripts/test-openrouter.mjs <your-key>");
    process.exit(1);
  }
  
  console.log("Key prefix:", key.substring(0, 12) + "...");
  
  // Test 1: Check /api/v1/auth/key (key info endpoint)
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { "Authorization": `Bearer ${key}` },
    });
    const data = await res.json();
    console.log("\n=== Key Info (/api/v1/auth/key) ===");
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Key info error:", e.message);
  }

  // Test 2: Try a minimal chat completion
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "https://launcher-os.local",
        "X-Title": "Launcher OS",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: "Say OK" }],
        max_tokens: 5,
      }),
    });
    const data = await res.json();
    console.log("\n=== Chat Completions Test ===");
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Chat test error:", e.message);
  }
}

testKey();
