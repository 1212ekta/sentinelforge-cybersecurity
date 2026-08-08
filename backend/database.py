import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)

# Select 'sentinelforge' database
db = client.sentinelforge

# Collections
conversations_collection = db.get_collection("conversations")
messages_collection = db.get_collection("messages")
