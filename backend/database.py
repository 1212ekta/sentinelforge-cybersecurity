import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("sentinelforge")

raw_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017").strip()
if raw_url.startswith("MONGODB_URL="):
    raw_url = raw_url.replace("MONGODB_URL=", "", 1).strip()

if not (raw_url.startswith("mongodb://") or raw_url.startswith("mongodb+srv://")):
    raw_url = "mongodb://localhost:27017"

MONGODB_URL = raw_url

try:
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
except Exception as e:
    logger.warning(f"Invalid MONGODB_URL format ({e}). Using local fallback.")
    client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)

# Select 'sentinelforge' database
db = client.sentinelforge

# Collections
conversations_collection = db.get_collection("conversations")
messages_collection = db.get_collection("messages")
analyses_collection = db.get_collection("analyses")
findings_collection = db.get_collection("findings")
reports_collection = db.get_collection("reports")

async def init_mongo_db():
    """Initializes MongoDB collection indexes and verifies database connectivity."""
    try:
        # Verify connection
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB.")

        # Create indexes
        await conversations_collection.create_index("updated_at", background=True)
        await messages_collection.create_index([("conversation_id", 1), ("created_at", 1)], background=True)
        await analyses_collection.create_index("id", unique=True, background=True)
        await findings_collection.create_index("analysis_id", background=True)
        await reports_collection.create_index("analysis_id", background=True)
        logger.info("MongoDB collection indexes initialized.")
    except Exception as e:
        logger.warning(f"MongoDB connection or indexing warning: {e}. Application will operate with in-memory fallback if MongoDB is offline.")
