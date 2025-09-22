/**
 * Comprehensive pattern definitions for data sanitization
 * Organized by category for maintainability and clarity
 */

// ============================================
// SECTION 1: PII PATTERNS (GDPR Compliance)
// ============================================

// 1.1 Contact Information Patterns
// ----------------------------------------
export const EMAIL_PATTERN =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

// Phone patterns - handles various formats
export const PHONE_PATTERN =
  /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,5}/;
export const PHONE_INTL_PATTERN = /\+\d{1,3}\s\d{2}\s\d{4}\s\d{4}/; // International format with spaces

// 1.2 Identity Document Patterns
// ----------------------------------------
// Social Security Numbers
export const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/; // SSN with dashes
export const SSN_NO_DASH_PATTERN = /\b(?<![\d-])\d{9}(?![\d-])\b/; // SSN without dashes

// Date of Birth - matches dates from 1900-2099
export const DOB_PATTERN =
  /\b(?:19|20)\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b/;

// 1.3 Location Data Patterns
// ----------------------------------------
// IP Address patterns (IPv4)
export const IP_PATTERN =
  /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;

// Physical address patterns (detects street addresses)
export const ADDRESS_PATTERN =
  /\b\d+\s+[\w\s]{1,50}\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Plaza|Pl|Highway|Hwy|Parkway|Pkwy|Square|Sq|Trail|Trl|Way|Terrace|Ter|Place|Pl)\b/i;

// Postal/ZIP code patterns (more specific to avoid false positives)
export const POSTAL_CODE_US = /\b\d{5}(?:-\d{4})?\b(?!\d)/; // US ZIP: 12345 or 12345-6789
export const POSTAL_CODE_UK = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/i; // UK: SW1A 1AA
export const POSTAL_CODE_CA = /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i; // Canada: K1A 0B1

// ============================================
// SECTION 2: PAYMENT PATTERNS (PCI-DSS)
// ============================================

// Credit/Debit Card patterns
export const CARD_PATTERN = /\b(?:\d{4}[\s-]?){3}\d{4}\b/; // Card with formatting
export const CARD_NO_FORMAT_PATTERN = /\b\d{15,16}\b/; // Card without formatting (simplified)

// CVV/CVC patterns (only when preceded by context keywords)
export const CVV_CONTEXT_PATTERN = /(?:cvv|CVV|cvc|CVC|cid|CID)[\s:]*\d{3,4}\b/;

// ============================================
// SECTION 3: AUTHENTICATION & SECURITY
// ============================================

// 3.1 Tokens & Keys
// ----------------------------------------
// JWT tokens (JSON Web Tokens)
export const JWT_PATTERN =
  /\b[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]+\b/;

// Bearer tokens
export const BEARER_PATTERN = /\bBearer\s+[\w-]+/i;

// Basic auth tokens
export const BASIC_PATTERN = /\bBasic\s+[A-Za-z0-9+/]+=*/i;

// API keys with common prefixes
export const API_KEY_PATTERN = /\b(?:sk|pk|api)_[a-zA-Z0-9_-]{10,}/;

// Token prefix pattern (like "Token abc123")
export const TOKEN_PREFIX_PATTERN = /\bToken\s+[\w-]+/i;

// 3.2 Certificates & Secrets
// ----------------------------------------
// Private key patterns (PEM format)
export const PRIVATE_KEY_PATTERN =
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/;
export const PRIVATE_KEY_BEGIN =
  /-----BEGIN\s+(RSA\s+|EC\s+|DSA\s+)?PRIVATE\s+KEY-----/;

// Certificate patterns
export const CERTIFICATE_PATTERN =
  /-----BEGIN\s+CERTIFICATE-----[\s\S]*?-----END\s+CERTIFICATE-----/;
export const CERTIFICATE_BEGIN = /-----BEGIN\s+CERTIFICATE-----/;

// 3.3 Headers & Sessions
// ----------------------------------------
// OAuth tokens (various formats)
export const OAUTH_PATTERN =
  /\b(oauth[_-]?token|oauth[_-]?secret)[=:]\s*[\w-]+/i;
export const OAUTH_BEARER = /\bOAuth\s+[\w-]+/i;

// ============================================
// SECTION 4: ERROR & SYSTEM PATTERNS
// ============================================

// 4.1 Stack Traces & Errors
// ----------------------------------------
export const STACK_TRACE_PATTERN = /\s+at\s+.*\(.*:\d+:\d+\)/;

// Internal error codes (Node.js/system errors)
export const INTERNAL_ERROR_CODES =
  /\b(ENOENT|EACCES|EADDRINUSE|ECONNREFUSED|ECONNRESET|EEXIST|EISDIR|EMFILE|ENOTDIR|ENOTEMPTY|EPERM|EPIPE|ETIMEDOUT)\b/;

// JavaScript error patterns
export const JS_ERROR_PATTERNS =
  /(Cannot\s+read\s+prop|Cannot\s+access|undefined\s+is\s+not|null\s+is\s+not|is\s+not\s+a\s+function|is\s+not\s+defined|ReferenceError|TypeError|SyntaxError)/;

// 4.2 File Paths & Directories
// ----------------------------------------
// General file path patterns (Unix and Windows)
export const FILE_PATH_PATTERN =
  /(?:\/[\w.-]+)+(?:\.\w+)?|[A-Z]:\\(?:[\w.-]+\\)*[\w.-]+/;

// Home directory patterns
export const HOME_DIR_PATTERN = /\/(?:home|Users)\/[\w.-]+|~\/[\w.-]+/;

// Node modules paths
export const NODE_MODULES_PATTERN = /node_modules\/[\w./@-]+/;

// 4.3 Sensitive File Types
// ----------------------------------------
// Files with sensitive extensions
export const SENSITIVE_FILE_PATTERN =
  /[\w.-]+\.(?:env|key|pem|crt|cer|p12|pfx)\b/;

// Config and secrets directories
export const CONFIG_DIR_PATTERN = /\/config\/[\w\-./]+/;
export const SECRETS_DIR_PATTERN =
  /\/(secrets|private|credentials|keys)\/[\w\-./]+/;

// ============================================
// SECTION 5: SENSITIVE KEY PATTERNS
// ============================================

/**
 * Patterns for object keys that should trigger automatic redaction
 * Matches common sensitive field names in various formats
 */
export const SENSITIVE_KEY_PATTERN =
  /^(?:password|passwd|pwd|pass|secret|api[_-]?key|token|auth|authorization|credential|cvv|cvc|cid|ssn|social[_-]?security[_-]?number?|card[_-]?number|credit[_-]?card|x-api-key|x-auth-token|x-access-token|x-refresh-token|bearer|refresh[_-]?token|access[_-]?token|cookie|session(?:[_-]?id)?|certificate|oauth|client[_-]?secret|api[_-]?secret|private[_-]?key|address|postal[_-]?code|zip[_-]?code)$/i;

// ============================================
// SECTION 6: COMBINED MEGA-PATTERN
// ============================================

/**
 * Combined pattern with named capture groups for single-pass matching
 * ORDER MATTERS: More specific patterns must come before general ones
 */
export const COMBINED_VALUE_PATTERN = new RegExp(
  [
    // === CERTIFICATES & KEYS (most specific, multiline) ===
    `(?<privatekey>${PRIVATE_KEY_PATTERN.source})`,
    `(?<certificate>${CERTIFICATE_PATTERN.source})`,
    `(?<privatekeybegin>${PRIVATE_KEY_BEGIN.source})`,
    `(?<certificatebegin>${CERTIFICATE_BEGIN.source})`,

    // === AUTH PATTERNS (most specific first) ===
    `(?<jwt>${JWT_PATTERN.source})`,
    `(?<bearer>${BEARER_PATTERN.source})`,
    `(?<basic>${BASIC_PATTERN.source})`,
    `(?<tokenprefix>${TOKEN_PREFIX_PATTERN.source})`,
    `(?<oauthbearer>${OAUTH_BEARER.source})`,
    `(?<oauth>${OAUTH_PATTERN.source})`,
    `(?<apikey>${API_KEY_PATTERN.source})`,

    // === PAYMENT PATTERNS (before phone to avoid conflicts) ===
    `(?<card>${CARD_PATTERN.source})`,
    `(?<cardlong>${CARD_NO_FORMAT_PATTERN.source})`,
    `(?<cvv>${CVV_CONTEXT_PATTERN.source})`,

    // === IDENTITY PATTERNS ===
    `(?<ssn>${SSN_PATTERN.source})`,
    `(?<ssnnodash>${SSN_NO_DASH_PATTERN.source})`,

    // === CONTACT PATTERNS ===
    `(?<email>${EMAIL_PATTERN.source})`,
    `(?<phoneintl>${PHONE_INTL_PATTERN.source})`,
    `(?<phone>${PHONE_PATTERN.source})`,

    // === LOCATION PATTERNS ===
    `(?<address>${ADDRESS_PATTERN.source})`,
    `(?<postalus>${POSTAL_CODE_US.source})`,
    `(?<postaluk>${POSTAL_CODE_UK.source})`,
    `(?<postalca>${POSTAL_CODE_CA.source})`,
    `(?<ip>${IP_PATTERN.source})`,
    `(?<dob>${DOB_PATTERN.source})`,

    // === ERROR PATTERNS ===
    `(?<jserror>${JS_ERROR_PATTERNS.source})`,
    `(?<internalerror>${INTERNAL_ERROR_CODES.source})`,

    // === PATH PATTERNS ===
    `(?<stack>${STACK_TRACE_PATTERN.source})`,
    `(?<config>${CONFIG_DIR_PATTERN.source})`,
    `(?<secrets>${SECRETS_DIR_PATTERN.source})`,
    `(?<modules>${NODE_MODULES_PATTERN.source})`,
    `(?<home>${HOME_DIR_PATTERN.source})`,
    `(?<sensitive>${SENSITIVE_FILE_PATTERN.source})`,
    `(?<path>${FILE_PATH_PATTERN.source})`,
  ].join("|"),
  "gims" // Added 's' flag for multiline matching (for certificates)
);

// ============================================
// SECTION 7: REDACTION LABELS
// ============================================

/**
 * Mapping of pattern types to their redaction labels
 * Used to generate appropriate redaction messages
 */
export const REDACTION_LABELS: Record<string, string> = {
  // Contact patterns
  email: "EMAIL_REDACTED",
  phone: "PHONE_REDACTED",
  phoneintl: "PHONE_REDACTED",

  // Identity patterns
  ssn: "SSN_REDACTED",
  ssnnodash: "SSN_REDACTED",
  dob: "DOB_REDACTED",

  // Location patterns
  ip: "IP_REDACTED",
  address: "ADDRESS_REDACTED",
  postalus: "POSTAL_CODE_REDACTED",
  postaluk: "POSTAL_CODE_REDACTED",
  postalca: "POSTAL_CODE_REDACTED",

  // Payment patterns
  card: "CARD_REDACTED",
  cardlong: "CARD_REDACTED",
  cvv: "CVV_REDACTED",

  // Auth patterns
  jwt: "JWT_REDACTED",
  bearer: "BEARER_REDACTED",
  basic: "BASIC_REDACTED",
  apikey: "APIKEY_REDACTED",
  tokenprefix: "TOKEN_REDACTED",
  privatekey: "PRIVATE_KEY_REDACTED",
  privatekeybegin: "PRIVATE_KEY_REDACTED",
  certificate: "CERTIFICATE_REDACTED",
  certificatebegin: "CERTIFICATE_REDACTED",
  oauth: "OAUTH_REDACTED",
  oauthbearer: "OAUTH_REDACTED",

  // Error patterns
  stack: "STACK_TRACE",
  internalerror: "INTERNAL_ERROR",
  jserror: "JS_ERROR",

  // Path patterns
  path: "PATH",
  home: "PATH",
  modules: "NODE_MODULES",
  sensitive: "SENSITIVE_FILE",
  config: "CONFIG_PATH",
  secrets: "SECRETS_PATH",
};
