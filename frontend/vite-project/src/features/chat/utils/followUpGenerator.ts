/**
 * Contextual Follow-Up Question Generator for SentinelForge AI Assistant.
 * Generates 3-4 topic-relevant, non-generic follow-up questions based on the
 * user's prompt and assistant's response.
 */

export function generateFollowUpQuestions(userPrompt: string, assistantResponse: string): string[] {
  const combinedText = `${userPrompt} ${assistantResponse}`.toLowerCase();

  // 1. SQL Injection / Database Security
  if (combinedText.includes('sql') || combinedText.includes('sqli') || combinedText.includes('parameterized') || combinedText.includes('database injection')) {
    return [
      'How can I prevent SQL injection using parameterized queries?',
      'What is the difference between In-Band, Blind, and Error-Based SQLi?',
      'How do ORMs like SQLAlchemy or Hibernate mitigate injection risks?',
      'How can I detect SQL injection attempts in database access logs?',
    ];
  }

  // 2. Cross-Site Scripting (XSS) / CSP / Context Encoding
  if (combinedText.includes('xss') || combinedText.includes('cross-site scripting') || combinedText.includes('csp') || combinedText.includes('sanitiz')) {
    return [
      'What is the difference between Reflected, Stored, and DOM-based XSS?',
      'How does Content Security Policy (CSP) prevent XSS execution?',
      'How should user input be sanitized and context-encoded?',
      'Can HttpOnly cookies prevent session hijacking via XSS?',
    ];
  }

  // 3. Authentication / JWT / Passwords / Sessions / MFA
  if (combinedText.includes('jwt') || combinedText.includes('auth') || combinedText.includes('password') || combinedText.includes('session') || combinedText.includes('token')) {
    return [
      'How do I implement secure JWT expiration and refresh token rotation?',
      'What password hashing algorithm (Argon2id, bcrypt) is recommended?',
      'How do I prevent Session Fixation and Credential Stuffing?',
      'What are security best practices for OAuth 2.0 and OIDC flows?',
    ];
  }

  // 4. API Security / REST / CORS / BOLA / IDOR
  if (combinedText.includes('api') || combinedText.includes('cors') || combinedText.includes('bola') || combinedText.includes('idor') || combinedText.includes('rate limit')) {
    return [
      'How do I prevent Broken Object Level Authorization (BOLA / IDOR)?',
      'What CORS headers should be configured for production APIs?',
      'How should API rate limiting and token bucket throttling be implemented?',
      'How can sensitive API parameters be masked in server logs?',
    ];
  }

  // 5. Buffer Overflow / Memory Safety / C / Assembly
  if (combinedText.includes('buffer') || combinedText.includes('overflow') || combinedText.includes('memory') || combinedText.includes('strcpy') || combinedText.includes('canary')) {
    return [
      'How do ASLR, DEP, and Stack Canaries mitigate buffer overflows?',
      'What safe C functions replace vulnerable methods like strcpy and sprintf?',
      'How can static analysis tools detect memory corruption bugs?',
      'What is the difference between stack smashing and heap exploitation?',
    ];
  }

  // 6. Security Log Auditing / Syslog / SSH / Brute Force
  if (combinedText.includes('log') || combinedText.includes('syslog') || combinedText.includes('auth.log') || combinedText.includes('brute') || combinedText.includes('ssh')) {
    return [
      'How do I analyze Linux /var/log/auth.log for SSH brute-force attempts?',
      'What key Indicators of Compromise (IoCs) signal privilege escalation?',
      'How can Fail2ban or automated IP ban rules mitigate log anomalies?',
      'What log integrity controls prevent attacker log tampering?',
    ];
  }

  // 7. CVE / CVSS / Vulnerability Management / RCE
  if (combinedText.includes('cve') || combinedText.includes('cvss') || combinedText.includes('vulnerability') || combinedText.includes('rce') || combinedText.includes('exploit')) {
    return [
      'How is a CVSS v3.1 base score calculated across metrics?',
      'What is the operational impact of Remote Code Execution (RCE) vs Privilege Escalation?',
      'How do security teams prioritize CVE patches using EPSS?',
      'Where can I track vendor security advisories and zero-day disclosures?',
    ];
  }

  // 8. Cryptography / Ciphers / Encryption / TLS
  if (combinedText.includes('crypto') || combinedText.includes('cipher') || combinedText.includes('encrypt') || combinedText.includes('tls') || combinedText.includes('ssl')) {
    return [
      'What is the difference between AES-GCM and AES-CBC encryption?',
      'How does TLS 1.3 enforce Perfect Forward Secrecy (PFS)?',
      'What are common cryptographic implementation mistakes in web apps?',
      'How should sensitive keys be managed using Key Vaults or HSMs?',
    ];
  }

  // 9. Docker / Containers / Kubernetes / Cloud
  if (combinedText.includes('docker') || combinedText.includes('container') || combinedText.includes('kubernetes') || combinedText.includes('cloud')) {
    return [
      'How do I secure Docker container privileges and rootless execution?',
      'How can image scanning detect vulnerable dependencies in CI/CD?',
      'What are best practices for container network isolation?',
      'How do I audit Kubernetes RBAC permissions for least privilege?',
    ];
  }

  // 10. Default Contextual Fallback based on user prompt concepts
  return [
    'How can I audit this security risk in source code?',
    'What automated SAST tools detect this vulnerability?',
    'What remediation steps should dev teams implement first?',
    'How can I write a unit test to verify this security fix?',
  ];
}
