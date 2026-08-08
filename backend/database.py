import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("sentinelforge")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)

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
