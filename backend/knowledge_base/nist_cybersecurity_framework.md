# NIST Cybersecurity Framework (CSF) & Systems Security

## Core Functions
1. **Identify**: Develop organizational understanding to manage cybersecurity risk to systems, assets, data, and capabilities.
2. **Protect**: Develop and implement appropriate safeguards to ensure delivery of critical infrastructure services.
3. **Detect**: Implement activities to identify the occurrence of a cybersecurity event (SIEM, IDS/IPS, Audit Logging).
4. **Respond**: Take action regarding a detected cybersecurity incident to contain impact.
5. **Recover**: Maintain plans for resilience and restore capabilities impaired by a cybersecurity event.

## Hardening Best Practices
- Enforce Multi-Factor Authentication (MFA) across all administrative portals.
- Audit SSH configurations: Disable password auth, disable root login (`PermitRootLogin no`), and restrict to SSH Ed25519 keys.
- Network Segmentation: Isolate web servers in DMZ networks and restrict database access to backend application IP addresses.
