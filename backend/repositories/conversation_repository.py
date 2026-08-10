import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from database import conversations_collection, messages_collection

in_memory_conversations: Dict[str, Dict[str, Any]] = {}
in_memory_messages: List[Dict[str, Any]] = []

class MongoConversationRepository:

    @staticmethod
    async def create_conversation(title: str = "New Chat", guest_id: str = "default_guest") -> Dict[str, Any]:
        cid = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        doc = {
            "id": cid,
            "guest_id": guest_id,
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
    async def get_conversation(conversation_id: str, guest_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        query: Dict[str, Any] = {"id": conversation_id}
        if guest_id:
            query["guest_id"] = guest_id
        try:
            res = await conversations_collection.find_one(query, {"_id": 0})
            if res:
                return res
        except Exception:
            pass
        conv = in_memory_conversations.get(conversation_id)
        if conv and (not guest_id or conv.get("guest_id") == guest_id):
            return conv
        return None

    @staticmethod
    async def list_conversations(guest_id: str = "default_guest") -> List[Dict[str, Any]]:
        convs = []
        try:
            cursor = conversations_collection.find({"guest_id": guest_id}, {"_id": 0}).sort("updated_at", -1)
            convs = await cursor.to_list(length=100)
        except Exception:
            convs = [c for c in in_memory_conversations.values() if c.get("guest_id") == guest_id]
            convs.sort(key=lambda c: str(c.get("updated_at", "")), reverse=True)

        for c in convs:
            if isinstance(c.get("created_at"), datetime):
                c["created_at"] = c["created_at"].isoformat()
            if isinstance(c.get("updated_at"), datetime):
                c["updated_at"] = c["updated_at"].isoformat()
        return convs

    @staticmethod
    async def update_title(conversation_id: str, new_title: str, guest_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        query: Dict[str, Any] = {"id": conversation_id}
        if guest_id:
            query["guest_id"] = guest_id
        try:
            res = await conversations_collection.find_one_and_update(
                query,
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
            if not guest_id or c.get("guest_id") == guest_id:
                c["title"] = new_title.strip()
                c["updated_at"] = now.isoformat()
                return c
        return None

    @staticmethod
    async def delete_conversation(conversation_id: str, guest_id: Optional[str] = None) -> bool:
        query: Dict[str, Any] = {"id": conversation_id}
        if guest_id:
            query["guest_id"] = guest_id
        deleted = False
        try:
            res = await conversations_collection.delete_one(query)
            if res.deleted_count > 0:
                await messages_collection.delete_many({"conversation_id": conversation_id})
                deleted = True
        except Exception:
            pass

        if conversation_id in in_memory_conversations:
            c = in_memory_conversations[conversation_id]
            if not guest_id or c.get("guest_id") == guest_id:
                del in_memory_conversations[conversation_id]
                deleted = True

        return deleted

    @staticmethod
    async def clear_guest_conversations(guest_id: str) -> int:
        count = 0
        try:
            cursor = conversations_collection.find({"guest_id": guest_id}, {"id": 1, "_id": 0})
            cids = [c["id"] async for c in cursor]
            if cids:
                await messages_collection.delete_many({"conversation_id": {"$in": cids}})
                res = await conversations_collection.delete_many({"guest_id": guest_id})
                count = res.deleted_count
        except Exception:
            pass

        to_del = [cid for cid, c in in_memory_conversations.items() if c.get("guest_id") == guest_id]
        for cid in to_del:
            del in_memory_conversations[cid]
            count += 1

        return count

    @staticmethod
    async def add_message(conversation_id: str, role: str, content: str, guest_id: str = "default_guest") -> Dict[str, Any]:
        conv = await MongoConversationRepository.get_conversation(conversation_id, guest_id=guest_id)
        if not conv:
            conv = await MongoConversationRepository.create_conversation(title=content[:28].strip() or "New Chat", guest_id=guest_id)
            conversation_id = conv["id"]

        msg_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        msg_doc = {
            "id": msg_id,
            "conversation_id": conversation_id,
            "guest_id": guest_id,
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
    async def get_messages(conversation_id: str, guest_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if guest_id:
            conv = await MongoConversationRepository.get_conversation(conversation_id, guest_id=guest_id)
            if not conv:
                return []

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
