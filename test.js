const assert = require("assert");
const { issueToken, consumeToken } = require("./token-service");

async function main() {
  const tokenId = await issueToken(
    { message: "single-use test" },
    60
  );

  console.log(`issued token: ${tokenId}`);

  const results = await Promise.all([
    consumeToken(tokenId),
    consumeToken(tokenId),
    consumeToken(tokenId),
    consumeToken(tokenId),
    consumeToken(tokenId)
  ]);

  const winners = results.filter((result) => result.ok).length;
  console.log(`winners: ${winners}`);
  assert.strictEqual(winners, 1);
  console.log("PASS: token was single-use.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
