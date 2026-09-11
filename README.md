# Atomic Single-Use Token Service

This project provides a small Node.js token service backed by Redis. It stores JSON payloads under `token:<id>` keys.

- `issueToken` generates a random token ID and stores the payload with one atomic `SET ... EX` command.
- `consumeToken` uses Redis `GETDEL`, which reads and deletes the token atomically.
- Because `GETDEL` is atomic, concurrent consumers can successfully consume a token only once.

## Requirements

- Node.js 18 or newer
- Redis 6.2 or newer, for `GETDEL`

## Install

```sh
npm install
```

Start Redis locally with your platform's Redis service, or run:

```sh
redis-server
```

The service connects to `redis://localhost:6379` by default. Set `REDIS_URL` to use another Redis instance.

## Test

```sh
npm test
```

The test issues exactly one token and starts five concurrent consumers with `Promise.all`. A successful run includes:

```text
winners: 1
PASS: token was single-use.
```

Observed winners count: 1. The atomic GETDEL command ensures the token can only be consumed successfully once.

## Atomicity sanity check

The issuance operation uses `SET token:<id> <json> EX <ttl>` so the value and expiration are set in one command. It does not use a separate `EXPIRE` command.

Temporarily replacing `GETDEL` with `GET` followed by `DEL` creates a race condition. With five concurrent consumers, multiple consumers may read the same token before one of them deletes it, potentially producing `winners: 5`. The submitted implementation uses `GETDEL` and must produce `winners: 1`.
