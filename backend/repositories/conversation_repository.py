import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from database import conversations_collection, messages_collection

class MongoConversationRepository:

    @staticmethod
    async def create_conversation(title: str = "New Chat") -> Dict[str, Any]:
        cid = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        doc = {
            "id": cid,
            "title": title.strip() or "New Chat",
            "created_at": now,
            "updated_at": now,
        }
        await conversations_collection.insert_one(doc)
        return doc

    @staticmethod
    async def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
        return await conversations_collection.find_one({"id": conversation_id}, {"_id": 0})

    @staticmethod
    async def list_conversations() -> List[Dict[str, Any]]:
        cursor = conversations_collection.find({}, {"_id": 0}).sort("updated_at", -1)
        convs = await cursor.to_list(length=100)
        # Format timestamps to ISO strings if needed
        for c in convs:
            if isinstance(c.get("created_at"), datetime):
                c["created_at"] = c["created_at"].isoformat()
            if isinstance(c.get("updated_at"), datetime):
                c["updated_at"] = c["updated_at"].isoformat()
        return convs

    @staticmethod
    async def update_title(conversation_id: str, new_title: str) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        res = await conversations_collection.find_one_and_update(
            {"id": conversation_id},
            {"$set": {"title": new_title.strip(), "updated_at": now}},
            return_document=True,
            projection={"_id": 0}
        )
        if res and isinstance(res.get("created_at"), datetime):
            res["created_at"] = res["created_at"].isoformat()
        if res and isinstance(res.get("updated_at"), datetime):
            res["updated_at"] = res["updated_at"].isoformat()
        return res

    @staticmethod
    async def delete_conversation(conversation_id: str) -> bool:
        res = await conversations_collection.delete_one({"id": conversation_id})
        if res.deleted_count > 0:
            await messages_collection.delete_many({"conversation_id": conversation_id})
            return True
        return False

    @staticmethod
    async def add_message(conversation_id: str, role: str, content: str) -> Dict[str, Any]:
        conv = await MongoConversationRepository.get_conversation(conversation_id)
        if not conv:
            conv = await MongoConversationRepository.create_conversation(title=content[:28].strip() or "New Chat")
            conversation_id = conv["id"]

        msg_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        msg_doc = {
            "id": msg_id,
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "created_at": now,
        }
        await messages_collection.insert_one(msg_doc)
        await conversations_collection.update_one({"id": conversation_id}, {"$set": {"updated_at": now}})
        
        msg_doc["created_at"] = now.isoformat()
        return msg_doc

    @staticmethod
    async def get_messages(conversation_id: str) -> List[Dict[str, Any]]:
        cursor = messages_collection.find({"conversation_id": conversation_id}, {"_id": 0}).sort("created_at", 1)
        msgs = await cursor.to_list(length=100)
        for m in msgs:
            if isinstance(m.get("created_at"), datetime):
                m["created_at"] = m["created_at"].isoformat()
        return msgs
