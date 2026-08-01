import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

ACC = open("/tmp/testacc.txt").read().strip().split("=")[1]

async def main():
    c = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = c[os.environ["DB_NAME"]]
    await db.memberships.update_one({"user_id": ACC}, {"$set": {"user_id": ACC, "status": "active", "tier_id": "mecene", "current_period_end": None}}, upsert=True)
    print("membership inserted for", ACC)

asyncio.run(main())
