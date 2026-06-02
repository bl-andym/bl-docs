# AI Project Secrets and Enterprise AI Security Documentation

## Official Vendor Documentation

### OpenAI Enterprise / Business Privacy

#### OpenAI Enterprise Privacy Commitments
- Covers ownership of data, retention controls, training policies, enterprise access controls, and compliance.
- States that business data is not used to train models by default.

URL:
https://openai.com/policies/api-data-usage-policies/

---

#### OpenAI Business Data Privacy, Security and Compliance
- Enterprise-focused overview of privacy, security, compliance, and data handling.
- Useful when writing internal AI governance policies.

URL:
https://openai.com/business-data/

---

## Cursor Privacy and Security

### Cursor Privacy & Security Documentation
- Official explanation of Privacy Mode, code indexing, storage behaviour, and security controls.

URL:
https://docs.cursor.com/account/privacy

---

### Cursor Data Use & Privacy Overview
- Explains what data Cursor stores under different privacy modes.
- Important reading for any company considering Cursor adoption.

URL:
https://cursor.com/data-use/

---

### Cursor Security Overview
- Details Cursor's Privacy Mode guarantee and how requests are segregated.

URL:
https://cursor.com/security

---

### Cursor Privacy FAQ
- Discusses code indexing, embeddings, storage, and request routing.

URL:
https://cursordocs.com/en/docs/privacy/privacy

---

# Secret Management Documentation

## GitHub

### GitHub Secret Scanning Documentation
- Explains GitHub's built-in secret detection.
- Covers API keys, tokens, passwords, and accidental secret exposure.

URL:
https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning

---

### GitHub Secret Scanning Overview Video
- Short GitHub-produced introduction to secret scanning and push protection.

URL:
https://www.youtube.com/watch?v=AVB60Vn_uxI

---

## Gitleaks

### Gitleaks Documentation
- Popular open-source secret scanning tool.
- Commonly used in CI pipelines and pre-commit hooks.

URL:
https://github.com/gitleaks/gitleaks

---

## TruffleHog

### TruffleHog Documentation
- Secret scanning tool with credential verification.
- Useful for scanning repositories, Git history, and cloud environments.

URL:
https://github.com/trufflesecurity/trufflehog

---

# Off-Project Secret Storage and External Secret Management

## Overview

Off-project secret storage is considered industry-standard secure engineering practice.

The approach separates application source code from sensitive credentials and runtime secrets.

Typical examples of secrets include:

- API keys
- Database credentials
- OAuth tokens
- Private certificates
- SSH keys
- Production environment variables
- Service account credentials

The objective is to ensure secrets are:

- never committed to Git repositories
- never embedded in source code
- excluded from AI indexing and prompt submission
- injected only at runtime
- centrally controlled and rotated

---

## Industry Terminology

The practice is commonly referred to as:

- External secret management
- Out-of-repository secret storage
- Centralized secret storage
- Runtime secret injection
- Secrets management

---

## Recommended Architecture

```text
Git repository
    ↓
Contains only:
- source code
- .env.example
- placeholders
- configuration templates

Real secrets
    ↓
Stored externally in:
- Azure Key Vault
- AWS Secrets Manager
- Google Secret Manager
- HashiCorp Vault
- CI/CD secret stores
- OS keychains
- local ignored .env files

Runtime / CI pipeline
    ↓
Injects secrets into application environment
```

---

## Cloud Secret Store Documentation

### Azure Key Vault

#### Azure Key Vault Overview
- Centralized cloud secret and certificate management platform.
- Supports runtime secret injection, RBAC, auditing, and rotation.

URL:
https://learn.microsoft.com/en-us/azure/key-vault/general/overview

---

### AWS Secrets Manager

#### AWS Secrets Manager Documentation
- Managed AWS secret storage and credential rotation platform.
- Commonly used for runtime injection into applications and infrastructure.

URL:
https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html

---

### Google Secret Manager

#### Google Secret Manager Overview
- Centralized secret management service for GCP environments.
- Supports secure access controls and application integration.

URL:
https://cloud.google.com/secret-manager/docs/overview

---

## Developer-Focused Secret Management

### Doppler

#### Doppler Documentation
- Developer-focused centralized secret management platform.
- Frequently used for local development and CI/CD secret synchronization.

URL:
https://docs.doppler.com/docs/enclave-fundamentals

---

### HashiCorp Vault

#### HashiCorp Vault Documentation
- Enterprise-grade secrets management and encryption platform.
- Widely used in DevOps and cloud-native infrastructure.

URL:
https://developer.hashicorp.com/vault/docs

---

### 1Password Secrets Automation

#### 1Password Secrets Automation Documentation
- Secret automation tooling for development workflows and CI/CD systems.

URL:
https://developer.1password.com/docs/secrets-automation/

---

## Recommended Repository Practices

### `.gitignore`

Example:

```gitignore
.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.crt
```

Purpose:
- Prevents accidental commits of secret material.

---

### `.cursorignore`

Example:

```gitignore
.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.crt
```

Purpose:
- Reduces the likelihood of AI indexing or processing local secret files.

---

# Governance and Enterprise AI Security Reading

## One-size-fits-all AI Guardrails Do Not Work in the Enterprise
- Discusses enterprise AI governance, access controls, and role-based exposure of sensitive information.

URL:
https://www.techradar.com/pro/one-size-fits-all-ai-guardrails-do-not-work-in-the-enterprise

---

## On the Challenges of Deploying Privacy-Preserving Synthetic Data in the Enterprise
- Academic paper covering governance, compliance, architecture, and privacy considerations for enterprise AI adoption.

URL:
https://arxiv.org/abs/2307.04208

---

# Recommended Reading Order for a Development Team

1. GitHub Secret Scanning docs
2. Gitleaks docs
3. Cursor Privacy & Security docs
4. Cursor Data Use & Privacy Overview
5. Azure Key Vault overview
6. HashiCorp Vault documentation
7. OpenAI Enterprise Privacy Commitments
8. OpenAI Business Data Privacy & Compliance

That sequence takes you from:

- "don't leak secrets"
- → "scan for secrets"
- → "understand what the AI tool can see"
- → "store secrets outside the repository"
- → "understand enterprise contractual protections"
