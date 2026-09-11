const crypto = require("crypto");
const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

client.on("error", (error) => {
  console.error("Redis client error:", error.message);
});

let connectPromise;

async function ensureConnected() {
  if (client.isOpen) {
    return;
  }

  connectPromise ??= client.connect().catch((error) => {
    connectPromise = undefined;
    throw error;
  });

  await connectPromise;
}

async function issueToken(payload, ttlSeconds) {
  const tokenId = crypto.randomBytes(16).toString("hex");
  await ensureConnected();
  await client.set(`token:${tokenId}`, JSON.stringify(payload), {
    EX: ttlSeconds
  });
  return tokenId;
}

async function consumeToken(tokenId) {
  await ensureConnected();
  const value = await client.getDel(`token:${tokenId}`);

  if (value === null) {
    return {
      ok: false,
      reason: "invalid"
    };
  }

  return {
    ok: true,
    payload: JSON.parse(value)
  };
}

module.exports = { issueToken, consumeToken };
