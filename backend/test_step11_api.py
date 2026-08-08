import urllib.request
import json

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
code = "import sqlite3\nquery = 'SELECT * FROM users WHERE name = ' + user_input\ncursor.execute(query)\n"

body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="test_sqli.py"\r\n'
    f"Content-Type: text/plain\r\n\r\n"
    f"{code}\r\n"
    f"--{boundary}--\r\n"
).encode('utf-8')

req = urllib.request.Request(
    'http://localhost:8000/analyze-file',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

res = urllib.request.urlopen(req).read().decode('utf-8')
data = json.loads(res)

print("=== ANALYSIS RESPONSE ===")
print("Analysis ID:", data.get("analysis_id"))
print("Risk Level:", data.get("risk_level"))
print("Findings Count:", len(data.get("findings", [])))
print("First Finding:", data.get("findings")[0] if data.get("findings") else "None")

aid = data.get("analysis_id")
req_report = urllib.request.Request(
    f"http://localhost:8000/analysis/{aid}/report",
    data=b'',
    headers={'Content-Type': 'application/json'}
)

rep_res = urllib.request.urlopen(req_report).read().decode('utf-8')
rep_data = json.loads(rep_res)

print("\n=== GENERATED REPORT RESPONSE ===")
print("Title:", rep_data.get("title"))
print("Markdown Preview:\n", rep_data.get("markdown_content")[:350])
