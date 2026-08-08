import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from database import conversations_collection, messages_collection

in_memory_conversations: Dict[str, Dict[str, Any]] = {}
in_memory_messages: List[Dict[str, Any]] = []

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
        try:
            await conversations_collection.insert_one(doc)
        except Exception:
            in_memory_conversations[cid] = doc
        return doc

    @staticmethod
    async def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
        try:
            res = await conversations_collection.find_one({"id": conversation_id}, {"_id": 0})
            if res:
                return res
        except Exception:
            pass
        return in_memory_conversations.get(conversation_id)

    @staticmethod
    async def list_conversations() -> List[Dict[str, Any]]:
        convs = []
        try:
            cursor = conversations_collection.find({}, {"_id": 0}).sort("updated_at", -1)
            convs = await cursor.to_list(length=100)
        except Exception:
            convs = list(in_memory_conversations.values())
            convs.sort(key=lambda c: str(c.get("updated_at", "")), reverse=True)

        for c in convs:
            if isinstance(c.get("created_at"), datetime):
                c["created_at"] = c["created_at"].isoformat()
            if isinstance(c.get("updated_at"), datetime):
                c["updated_at"] = c["updated_at"].isoformat()
        return convs

    @staticmethod
    async def update_title(conversation_id: str, new_title: str) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        try:
            res = await conversations_collection.find_one_and_update(
                {"id": conversation_id},
                {"$set": {"title": new_title.strip(), "updated_at": now}},
                return_document=True,
                projection={"_id": 0}
            )
            if res:
                if isinstance(res.get("created_at"), datetime):
                    res["created_at"] = res["created_at"].isoformat()
                if isinstance(res.get("updated_at"), datetime):
                    res["updated_at"] = res["updated_at"].isoformat()
                return res
        except Exception:
            pass

        if conversation_id in in_memory_conversations:
            c = in_memory_conversations[conversation_id]
            c["title"] = new_title.strip()
            c["updated_at"] = now.isoformat()
            return c
        return None

    @staticmethod
    async def delete_conversation(conversation_id: str) -> bool:
        deleted = False
        try:
            res = await conversations_collection.delete_one({"id": conversation_id})
            if res.deleted_count > 0:
                await messages_collection.delete_many({"conversation_id": conversation_id})
                deleted = True
        except Exception:
            pass

        if conversation_id in in_memory_conversations:
            del in_memory_conversations[conversation_id]
            deleted = True

        return deleted

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
        try:
            await messages_collection.insert_one(msg_doc)
            await conversations_collection.update_one({"id": conversation_id}, {"$set": {"updated_at": now}})
        except Exception:
            in_memory_messages.append(msg_doc)
            if conversation_id in in_memory_conversations:
                in_memory_conversations[conversation_id]["updated_at"] = now.isoformat()

        msg_doc["created_at"] = now.isoformat()
        return msg_doc

    @staticmethod
    async def get_messages(conversation_id: str) -> List[Dict[str, Any]]:
        msgs = []
        try:
            cursor = messages_collection.find({"conversation_id": conversation_id}, {"_id": 0}).sort("created_at", 1)
            msgs = await cursor.to_list(length=100)
        except Exception:
            msgs = [m for m in in_memory_messages if m.get("conversation_id") == conversation_id]

        for m in msgs:
            if isinstance(m.get("created_at"), datetime):
                m["created_at"] = m["created_at"].isoformat()
        return msgs
