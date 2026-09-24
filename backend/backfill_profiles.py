"""One-off idempotent backfill: ensure every account (db.users) has a member profile (db.profiles).
Compte = profil. Safe to rerun."""
import asyncio, os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    created = 0
    total = 0
    async for u in db.users.find({}, {"_id": 0, "id": 1, "name": 1, "avatar": 1, "email": 1}):
        total += 1
        uid = u.get("id")
        if not uid:
            continue
        if await db.profiles.find_one({"account_id": uid}):
            continue
        name = u.get("name") or ((u.get("email") or "").split("@")[0]) or "Membre"
        now = now_iso()
        await db.profiles.update_one(
            {"account_id": uid},
            {"$setOnInsert": {
                "id": uid, "account_id": uid, "name": name,
                "avatar": u.get("avatar") or "", "email": "",
                "instagram": "", "hide_tier": False,
                "created_at": now, "updated_at": now,
            }},
            upsert=True,
        )
        created += 1
    print(f"users={total} profiles_created={created}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
