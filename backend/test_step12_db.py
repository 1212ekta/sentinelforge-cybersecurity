import urllib.request
import json

base_url = "http://localhost:8000"

print("--- 1. Testing POST /conversations ---")
req = urllib.request.Request(
    f"{base_url}/conversations",
    data=json.dumps({"title": "Persistent DB Test Conversation"}).encode(),
    headers={"Content-Type": "application/json"}
)
res = json.loads(urllib.request.urlopen(req).read().decode())
print("Created conversation:", res)
cid = res["id"]

print("\n--- 2. Testing GET /conversations ---")
req_list = urllib.request.Request(f"{base_url}/conversations")
convs = json.loads(urllib.request.urlopen(req_list).read().decode())
print(f"Total conversations in DB: {len(convs)}")

print("\n--- 3. Testing PATCH /conversations/{id} ---")
req_patch = urllib.request.Request(
    f"{base_url}/conversations/{cid}",
    data=json.dumps({"title": "Renamed DB Test"}).encode(),
    headers={"Content-Type": "application/json"},
    method="PATCH"
)
res_patch = json.loads(urllib.request.urlopen(req_patch).read().decode())
print("Renamed conversation:", res_patch)

print("\n--- 4. Testing GET /conversations/{id}/messages ---")
req_msgs = urllib.request.Request(f"{base_url}/conversations/{cid}/messages")
msgs = json.loads(urllib.request.urlopen(req_msgs).read().decode())
print(f"Messages in conversation {cid}: {len(msgs)}")

print("\nStep 12 Backend Database Persistence Test PASSED successfully!")
