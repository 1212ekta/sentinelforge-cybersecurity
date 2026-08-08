# OWASP Top 10 Web Application Security Risks Reference

## A01:2021-Broken Access Control
Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data.
Remediation: Enforce access control mechanisms server-side, disable directory listing, and apply principle of least privilege.

## A02:2021-Cryptographic Failures
Failures related to cryptography (formerly known as Sensitive Data Exposure). Focus is on protecting data in transit and at rest (passwords, credit cards, PII).
Remediation: Use strong algorithm standards (AES-256, RSA-4096), TLS 1.3, salted Argon2/bcrypt password hashing, and avoid hardcoded keys.

## A03:2021-Injection
Injection flaws, such as SQL, NoSQL, OS Command, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query.
Remediation: Use parameterized queries (prepared statements), ORM binding, input validation, and context-aware escaping.

## A04:2021-Insecure Design
Focuses on risks related to design and architectural flaws. Call for more use of threat modeling, secure design patterns, and reference architectures.

## A05:2021-Security Misconfiguration
Occurs when security settings are defined, implemented, or maintained casually (e.g., default credentials, open S3 buckets, verbose error stack traces enabled).
Remediation: Automated hardening scripts, minimal installed software, disabling unused ports and endpoints.
