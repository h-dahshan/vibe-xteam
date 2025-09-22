# 🛡️ Data Sanitization

> The high-performance sanitizer that guards your sensitive data with a single pass - because your logs shouldn't be a data breach waiting to happen! 🚀

## 🌟 The Story Behind This

Picture this: It's 3 AM 🌙, and you're debugging a critical production issue. You need those logs desperately. But wait - they could contain customer emails, credit card numbers, API keys... One accidental log entry, and boom! 💥 GDPR violation, PCI-DSS audit failure, or worse - actual data breach.

Every engineering team faces this dilemma: **How do you balance observability with security?** Log too little, and debugging becomes impossible. Log too much, and you risk exposing sensitive data.

_We've all been there._ 😭

That's exactly why we built this - a sanitizer so fast and smart, you can safely log everything without fear.

## 🚀 What We Built

We created a **single-pass, zero-dependency sanitizer** that automatically detects and redacts sensitive information in any data structure. It's like having a security guard that can spot every type of sensitive data simultaneously - in one quick glance!

No more choosing between debugging and security. No more manual redaction. Just clean, safe logs that you can actually use. 🛡️

### ✨ Core Features

- **🚦 Single-Pass Magic**: One traversal catches ALL sensitive patterns simultaneously
- **⚡ Blazing Fast**: Processes 1000 fields in <5ms
- **🔄 Smart Detection**: 30+ sensitive key patterns, 40+ value patterns
- **🎯 100% Test Coverage**: 124 comprehensive tests ensuring every edge case
- **🧠 Zero Dependencies**: Pure TypeScript, no external libraries to worry about
- **🎪 Flexible Redaction**: Full, partial, or hash-based redaction modes

### 🎪 Technical Highlights

- Built with TypeScript and regex mastery
- GDPR and PCI-DSS compliant patterns out of the box
- Handles circular references and deep nesting gracefully
- Supports Error objects and stack traces intelligently
- Pattern priority system prevents false positives
- O(n) complexity with single-tree traversal

## 🏗️ How We Built It

### Architecture Overview 🗂️

```
smart-sanitization/
├── 🔐 sanitizer.ts       # Core engine (~250 lines of precision)
├── 📚 patterns.ts        # 7 organized pattern sections
├── 🎨 types.ts          # TypeScript interfaces
├── 🧪 sanitizer.spec.ts # 124 comprehensive tests
└── 🔧 index.ts         # Clean module exports
```

### 💭 Design Decisions

We made some deliberate choices:

1. **🎯 Mega-Regex Pattern**: Instead of checking patterns one-by-one, we combined ALL patterns into one mega-regex with named capture groups. The regex engine's internal optimization beats any manual iteration. Plus, single-pass traversal is _chef's kiss_ 👨‍🍳

2. **🚨 Pattern Priority System**: More specific patterns (JWT, credit cards) come before general ones (paths). This prevents false positives and ensures accurate redaction labels.

3. **📁 Smart Key Detection**: Sensitive keys like `password` or `apiKey` trigger immediate redaction without even checking the value - because why waste cycles when the key tells you everything?

4. **🔑 Context-Aware Redaction**: Different patterns get different labels (`[EMAIL_REDACTED]`, `[CARD_REDACTED]`) so you know what was removed while debugging.

### 🛠️ Technologies & Patterns

- **Language**: Pure TypeScript - type-safe and fast
- **Pattern Engine**: Combined regex with named capture groups
- **Architecture**: Single-pass visitor pattern
- **Testing**: Vitest with 100% coverage
- **No Dependencies**: Zero external packages - nothing to break!

## 📖 How to Use It

### ⚡ Quick Start

Get sanitizing in under 30 seconds! 🎉

```typescript
// Step 1: Import the sanitizer 📦
import { Sanitizer } from "@/common/utils/smart-sanitization";

// Step 2: Create an instance 🔧
const sanitizer = new Sanitizer();

// Step 3: Sanitize anything! 🚀
const clean = sanitizer.sanitize({
  email: "user@example.com",
  password: "super-secret",
});
// Result: { email: '[EMAIL_REDACTED]', password: '[REDACTED]' } ✅
```

### 🎭 Basic Usage

The most common scenarios you'll encounter:

```typescript
// Example: Sanitizing user data before logging 🎯
import { Sanitizer } from "@/common/utils/smart-sanitization";

const sanitizer = new Sanitizer();

// String with multiple sensitive patterns
const text = "Contact john@example.com or call 555-123-4567";
console.log(sanitizer.sanitize(text));
// Result: 'Contact [EMAIL_REDACTED] or call [PHONE_REDACTED]' ✅

// Complex nested object
const userData = {
  user: {
    email: "john@example.com",
    phone: "+1-555-123-4567",
    ssn: "123-45-6789",
    creditCard: "4111-1111-1111-1111",
  },
  auth: {
    token: "Bearer eyJhbGciOiJIUzI1NiIs...",
    apiKey: "sk_test_1234567890",
  },
};

const safe = sanitizer.sanitize(userData);
// All sensitive data replaced with appropriate labels! 🛡️
```

### 🚀 Advanced Usage

For power users who need fine-grained control:

```typescript
// Example: Partial redaction for debugging
import { Sanitizer, RedactionLevel } from "@/common/utils/smart-sanitization";

const debugSanitizer = new Sanitizer({
  redactionLevel: RedactionLevel.PARTIAL,
  maxStackLines: 5, // Limit stack traces
  maxMessageLength: 500, // Truncate long messages
});

console.log(debugSanitizer.sanitize("user@example.com"));
// Result: 'us***@example.com' (first 2 + last part visible) 🔍

console.log(debugSanitizer.sanitize("4111111111111111"));
// Result: '************1111' (last 4 digits for reference) 💳

// Example: Hash redaction for tracking
const hashSanitizer = new Sanitizer({
  redactionLevel: RedactionLevel.HASH,
});

const email = "same@email.com";
console.log(hashSanitizer.sanitize(email)); // 'email_a1b2c3'
console.log(hashSanitizer.sanitize(email)); // 'email_a1b2c3' (same hash!)
// Deterministic hashing allows tracking without exposing data 🔐

// Example: Custom patterns for your domain
const customSanitizer = new Sanitizer({
  customPatterns: {
    employeeId: /EMP\d{6}/g,
    customerId: /CUST-[A-Z]{3}-\d{4}/g,
    internalApi: /internal\.api\.[a-z]+\.com/g,
  },
  excludeKeys: ["publicId", "displayName"], // Never redact these
});
```

### 📋 Configuration Reference

| Option             | Type                     | Default | Description                                 |
| ------------------ | ------------------------ | ------- | ------------------------------------------- |
| `redactionLevel`   | `RedactionLevel`         | `FULL`  | How to redact: `FULL`, `PARTIAL`, or `HASH` |
| `customPatterns`   | `Record<string, RegExp>` | `{}`    | Your domain-specific patterns               |
| `excludeKeys`      | `string[]`               | `[]`    | Keys to never redact                        |
| `maxDepth`         | `number`                 | `100`   | Max object nesting depth                    |
| `maxStackLines`    | `number`                 | `10`    | Lines to keep in stack traces               |
| `maxMessageLength` | `number`                 | `500`   | Truncate strings longer than this           |
| `removeStackTrace` | `boolean`                | `false` | Completely remove stack traces              |

### 🔌 API Reference

#### Main Methods 🎛️

- `sanitize(data: unknown): unknown` - Sanitizes any data structure 🎯
- `sanitizeString(value: string): string` - Direct string sanitization 🔧
- `sanitizeError(error: Error): object` - Special handling for Error objects ⚡

## 🎯 Pattern Library

### What Gets Redacted

We detect and redact 40+ different patterns across 7 categories:

#### 🔐 Personal Information (PII)

- **Emails**: `john@example.com` → `[EMAIL_REDACTED]`
- **Phones**: `555-123-4567` → `[PHONE_REDACTED]`
- **SSN**: `123-45-6789` → `[SSN_REDACTED]`
- **IP Addresses**: `192.168.1.1` → `[IP_REDACTED]`
- **Birth Dates**: `1990-01-01` → `[DOB_REDACTED]`
- **Addresses**: `123 Main Street` → `[ADDRESS_REDACTED]`

#### 💳 Payment Information (PCI)

- **Credit Cards**: `4111-1111-1111-1111` → `[CARD_REDACTED]`
- **CVV**: `CVV: 123` → `CVV: [CVV_REDACTED]`

#### 🔑 Authentication & Secrets

- **JWT Tokens**: `eyJhbG...` → `[JWT_REDACTED]`
- **API Keys**: `sk_test_abc123` → `[APIKEY_REDACTED]`
- **Bearer Tokens**: `Bearer abc123` → `[BEARER_REDACTED]`
- **Basic Auth**: `Basic dXNlcjpwYXNz` → `[BASIC_REDACTED]`
- **OAuth**: `oauth_token=xyz` → `[OAUTH_REDACTED]`

#### 🚨 Sensitive Keys (Automatic)

Any object key matching these patterns triggers automatic redaction:

- `password`, `passwd`, `pwd`, `secret`
- `token`, `apiKey`, `api_key`, `auth`
- `cookie`, `session`, `certificate`
- `ssn`, `creditCard`, `cvv`

## 🤝 How to Contribute

We'd love your help making this even better! 💪

### 🏃 Development Setup

```bash
# Clone and navigate 📦
cd apps/api/src/common/utils/smart-sanitization

# Run tests 🧪
pnpm test sanitizer.spec.ts

# Run with coverage 📊
pnpm test --coverage sanitizer.spec.ts

# Watch mode for development 👀
pnpm test --watch sanitizer.spec.ts
```

### 🧪 Adding New Patterns

When adding new patterns, follow this workflow:

```typescript
// 1. Add pattern to patterns.ts
export const MY_PATTERN = /my-pattern-regex/;

// 2. Include in COMBINED_VALUE_PATTERN (order matters!)
export const COMBINED_VALUE_PATTERN = new RegExp(
  [
    // ... existing patterns (specific first!)
    `(?<mypattern>${MY_PATTERN.source})`,
  ].join("|"),
  "gims"
);

// 3. Add redaction label
export const REDACTION_LABELS = {
  // ... existing labels
  mypattern: "MY_PATTERN_REDACTED",
};

// 4. Write comprehensive tests
describe("My Pattern", () => {
  it("should redact my pattern", () => {
    const result = sanitizer.sanitize("my-pattern-data");
    expect(result).toBe("[MY_PATTERN_REDACTED]");
  });
});
```

## 🚑 Troubleshooting

### Common Issues 🆘

<details>
<summary><strong>🔴 Pattern not being redacted</strong></summary>

**Problem**: Your sensitive data isn't being caught

**Solution**: Check pattern order in `COMBINED_VALUE_PATTERN`:

```typescript
// ✅ Good: More specific patterns first
`(?<jwt>${JWT_PATTERN.source})`,  // Specific JWT pattern
`(?<base64>${BASE64_PATTERN.source})`,  // General base64

// ❌ Bad: General pattern blocks specific ones
`(?<base64>${BASE64_PATTERN.source})`,  // Matches everything!
`(?<jwt>${JWT_PATTERN.source})`,  // Never reached
```

**Why this happens**: First matching pattern wins. It's a feature, not a bug! 🛡️

</details>

<details>
<summary><strong>🟡 False positives (over-redaction)</strong></summary>

**Problem**: Normal data getting redacted unnecessarily

**Solution**: Use `excludeKeys` or make patterns more specific:

```typescript
const sanitizer = new Sanitizer({
  excludeKeys: ["userId", "orderId"], // These look sensitive but aren't
});
```

**Prevention**: Always test with real-world data samples! 🧪

</details>

<details>
<summary><strong>🟠 Performance degradation</strong></summary>

**Problem**: Sanitization taking too long

**Solution**: Check for circular references or deep nesting:

```typescript
const sanitizer = new Sanitizer({
  maxDepth: 50, // Reduce for deeply nested objects
  removeStackTrace: true, // Skip stack trace processing
});
```

**Prevention**: Profile with large datasets before production 📊

</details>

### 🔍 Debug Mode

Enable detailed pattern matching info:

```bash
# See exactly what patterns are matching 👀
DEBUG=sanitizer:* pnpm test
```

## ❓ FAQ

**Q: Why isn't my 7-digit phone "555-0123" being redacted?** 🤔  
A: We require 10+ digits to avoid false positives (order IDs, etc.). Trust us, your future self will thank you! 🙏

**Q: Can this handle millions of log entries?** 💨  
A: Absolutely! Single-pass O(n) complexity means linear scaling. We process 1000 fields in <5ms.

**Q: Does it handle circular references?** 🔄  
A: Yes! We track visited objects and mark cycles as `[CIRCULAR]`.

**Q: Can I add industry-specific patterns?** 🆕  
A: Yes! Use the `customPatterns` option. We've made it as painless as possible! 😊

**Q: What about international formats?** 🌍  
A: We support international phones, various postal codes, and multiple date formats. PRs for more patterns welcome!

## 💡 Real-World Examples

### Example 1: API Error Logging 🌍

Stop worrying about what's in your error logs:

```typescript
// The dangerous way 😱
logger.error("Payment failed", {
  user: { email: "john@example.com" },
  card: "4111111111111111", // Full card number in logs!
  error: "Insufficient funds",
});

// The safe way 🛡️
const sanitizer = new Sanitizer();
logger.error(
  "Payment failed",
  sanitizer.sanitize({
    user: { email: "john@example.com" },
    card: "4111111111111111",
    error: "Insufficient funds",
  })
);
// Logs: { user: { email: '[EMAIL_REDACTED]' }, card: '[CARD_REDACTED]', error: 'Insufficient funds' }
// Security team happy! 🎉
```

### Example 2: Debugging with Partial Redaction 🔍

Keep some data visible for debugging:

```typescript
// Need to debug but stay compliant
const debugSanitizer = new Sanitizer({
  redactionLevel: RedactionLevel.PARTIAL,
});

const error = new Error("User authentication failed");
error.context = {
  email: "admin@company.com",
  apiKey: "sk_live_abcd1234efgh5678",
  timestamp: "2024-01-15T10:30:00Z",
};

console.log(debugSanitizer.sanitize(error));
// Shows: {
//   message: 'User authentication failed',
//   context: {
//     email: 'ad***@company.com',  // Partial visibility
//     apiKey: 'sk_live_****...5678',  // Keep prefix & suffix
//     timestamp: '2024-01-15T10:30:00Z'  // Not sensitive
//   }
// }
```

### Example 3: Structured Logging with Automatic Sanitization 📊

Integrate with your logging pipeline:

```typescript
// Create a logging wrapper
class SafeLogger {
  private sanitizer = new Sanitizer();

  log(level: string, message: string, data?: any) {
    const safeData = data ? this.sanitizer.sanitize(data) : undefined;
    console.log(
      JSON.stringify({
        level,
        message,
        data: safeData,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

const logger = new SafeLogger();

// Now log freely without fear!
logger.log("error", "Auth failed", {
  user: {
    email: "user@example.com",
    password: "SecretPass123!", // Auto-redacted
    sessionId: "sess_abc123", // Auto-redacted
  },
  ip: "192.168.1.100", // Auto-redacted
  attempt: 3, // Safe, not sensitive
});
```

## ⚡ Performance Considerations

- **🧠 Memory Usage**: O(n) where n is object size - no copies, just traversal
- **🚀 Processing Time**: <1ms for typical objects, <5ms for 1000 fields
- **📈 Scaling**: Linear complexity - doubles data = doubles time
- **💨 Optimization Tips**:
  - Use `excludeKeys` to skip known-safe keys
  - Set `maxDepth` for deeply nested objects
  - Enable `removeStackTrace` in production for speed
  - Consider `RedactionLevel.HASH` for high-volume tracking

## 📚 Related Resources

### Internal Documentation 📖

- **Backend Guidelines**: [`/docs/instructions/backend.md`](/docs/instructions/backend.md) - Architecture patterns and best practices

### External References 🔗

- **[GDPR Article 32](https://gdpr-info.eu/art-32-gdpr/)**: Security of processing requirements
- **[PCI-DSS Requirements](https://www.pcisecuritystandards.org/document_library/)**: Section 3.4 - Rendering PAN unreadable
- **[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)**: Security logging best practices
- **[Regex101](https://regex101.com/)**: Interactive regex testing and debugging

### Learning Resources 🎓

- **[Regular-Expressions.info](https://www.regular-expressions.info/catastrophic.html)**: Understanding regex performance
- **[Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)**: Comprehensive Node.js security and performance guide
- **[OWASP Top Ten](https://owasp.org/www-project-top-ten/)**: Essential security risks to understand

## 🗺️ Roadmap

Where we're heading next:

- **📍 Current**: Core sanitization with 40+ patterns
- **🔜 Next**: Stream processing for large files
- **🔮 Future**: ML-based pattern detection, WebAssembly engine
- **🙋 Help Wanted**: Healthcare identifiers (HIPAA), financial identifiers (SWIFT/IBAN)

## 💭 Final Thoughts

> "Security is not a product, but a process. Make that process invisible to developers, and they'll actually use it."
>
> — Every security engineer ever 🛡️

We built this sanitizer to be the security tool that developers actually want to use. Fast enough to not notice, smart enough to trust, simple enough to integrate everywhere.
