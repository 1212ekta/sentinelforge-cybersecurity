import urllib.request
import json

base_url = "http://localhost:8000"

print("--- 1. Testing POST /conversations (MongoDB) ---")
req = urllib.request.Request(
    f"{base_url}/conversations",
    data=json.dumps({"title": "Unified MongoDB Test Conversation"}).encode(),
    headers={"Content-Type": "application/json"}
)
res = json.loads(urllib.request.urlopen(req).read().decode())
print("Created conversation:", res)
cid = res["id"]

print("\n--- 2. Testing GET /conversations ---")
req_list = urllib.request.Request(f"{base_url}/conversations")
convs = json.loads(urllib.request.urlopen(req_list).read().decode())
print(f"Total conversations: {len(convs)}")

print("\n--- 3. Testing PATCH /conversations/{id} ---")
req_patch = urllib.request.Request(
    f"{base_url}/conversations/{cid}",
    data=json.dumps({"title": "Renamed Mongo Test"}).encode(),
    headers={"Content-Type": "application/json"},
    method="PATCH"
)
res_patch = json.loads(urllib.request.urlopen(req_patch).read().decode())
print("Renamed conversation:", res_patch)

print("\n--- 4. Testing GET /conversations/{id}/messages ---")
req_msgs = urllib.request.Request(f"{base_url}/conversations/{cid}/messages")
msgs = json.loads(urllib.request.urlopen(req_msgs).read().decode())
print(f"Messages count: {len(msgs)}")

print("\nStep 16A MongoDB Unification Local Verification PASSED successfully!")
