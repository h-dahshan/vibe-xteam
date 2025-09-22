# Sanitization Utility Analysis - Third-Party Libraries Assessment

## Executive Summary

Analysis of whether third-party libraries (fast-redact, maskdata, validator) can replace our custom sanitization implementation.

## Coverage Analysis: Third-Party Libraries vs Our Needs

### 1. PII Strategy Coverage

| Feature           | Our Implementation | fast-redact   | maskdata   | validator     | Combined Coverage |
| ----------------- | ------------------ | ------------- | ---------- | ------------- | ----------------- |
| Email detection   | ✅ Pattern + key   | ✅ Path-based | ✅ Masking | ✅ Detection  | ✅ **Full**       |
| Phone detection   | ✅ Pattern + key   | ✅ Path-based | ✅ Masking | ❌ Limited    | ⚠️ **Partial**    |
| SSN detection     | ✅ Pattern + key   | ✅ Path-based | ❌ No SSN  | ❌ No SSN     | ❌ **Missing**    |
| Credit Card       | ✅ Pattern + key   | ✅ Path-based | ✅ Masking | ✅ Detection  | ✅ **Full**       |
| IP Address        | ✅ Pattern + key   | ✅ Path-based | ❌ No IP   | ✅ Detection  | ⚠️ **Partial**    |
| Date of Birth     | ✅ Pattern + key   | ✅ Path-based | ❌ No DOB  | ❌ No DOB     | ❌ **Missing**    |
| Address fields    | ✅ Key patterns    | ✅ Path-based | ❌ Limited | ❌ No address | ⚠️ **Partial**    |
| Partial redaction | ✅ Custom logic    | ❌ Full only  | ✅ Yes     | N/A           | ⚠️ **Partial**    |

### 2. Auth Strategy Coverage

| Feature         | Our Implementation  | fast-redact   | maskdata   | validator    | Combined Coverage |
| --------------- | ------------------- | ------------- | ---------- | ------------ | ----------------- |
| Password fields | ✅ Key patterns     | ✅ Path-based | ✅ Masking | ❌ No        | ✅ **Full**       |
| JWT tokens      | ✅ Pattern detect   | ❌ Path only  | ❌ No JWT  | ✅ Detection | ⚠️ **Partial**    |
| API Keys        | ✅ Pattern detect   | ✅ Path-based | ❌ No      | ❌ No        | ⚠️ **Partial**    |
| Bearer tokens   | ✅ Pattern detect   | ✅ Path-based | ❌ No      | ❌ No        | ⚠️ **Partial**    |
| Headers         | ✅ Specific headers | ✅ Path-based | ❌ No      | ❌ No        | ✅ **Full**       |
| OAuth tokens    | ✅ Pattern detect   | ✅ Path-based | ❌ No      | ❌ No        | ⚠️ **Partial**    |

### 3. Error Strategy Coverage

| Feature             | Our Implementation | fast-redact   | maskdata | validator | Combined Coverage |
| ------------------- | ------------------ | ------------- | -------- | --------- | ----------------- |
| Stack trace removal | ✅ Yes             | ❌ No         | ❌ No    | ❌ No     | ❌ **Missing**    |
| Path sanitization   | ✅ Yes             | ❌ No         | ❌ No    | ❌ No     | ❌ **Missing**    |
| Error patterns      | ✅ ENOENT, etc.    | ❌ No         | ❌ No    | ❌ No     | ❌ **Missing**    |
| Error truncation    | ✅ Yes             | ❌ No         | ❌ No    | ❌ No     | ❌ **Missing**    |
| Sensitive paths     | ✅ .env, secrets   | ✅ Path-based | ❌ No    | ❌ No     | ⚠️ **Partial**    |

## Gap Analysis

### What's Missing from Libraries:

1. **SSN Detection**: No library handles Social Security Number patterns
2. **Error Sanitization**: Complete gap - none handle stack traces or error messages
3. **Smart Detection**: Libraries are path-based, not value-based pattern matching
4. **Context-aware**: No understanding of data types (PII vs Auth vs Error)
5. **Redaction Levels**: Limited support for partial vs full redaction

### What We'd Need to Add:

```typescript
// Custom patterns that libraries don't cover
const customPatterns = {
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  dob: /^\d{4}-\d{2}-\d{2}$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  apiKey: /^(sk|pk|api)_[a-zA-Z0-9]+$/,
  stackTrace: /at\s+.*\(.*:\d+:\d+\)/,
  filePath: /\/[\w\-./]+/,
};

// Error handling that's completely missing
class ErrorSanitizer {
  sanitizeError(error: Error) {
    // No library does this
    return {
      message: this.sanitizeMessage(error.message),
      // Remove stack trace
      stack: this.config.removeStackTrace
        ? undefined
        : this.sanitizeStack(error.stack),
    };
  }
}
```

## Recommended Approaches

### Option 1: Minimal External Dependencies

Use libraries for what they do well, keep custom code for gaps:

```typescript
class HybridSanitizer {
  private fastRedact = fastRedact({
    paths: [
      /* known paths */
    ],
  });

  private customPatterns = {
    // Keep our SSN, DOB, JWT detection
  };

  private errorSanitizer = new ErrorSanitizer();

  sanitize(data: any) {
    // 1. Fast path-based redaction
    let result = this.fastRedact(data);

    // 2. Custom pattern detection (SSN, JWT, etc.)
    result = this.applyCustomPatterns(result);

    // 3. Error sanitization (fully custom)
    result = this.errorSanitizer.process(result);

    return result;
  }
}
```

### Option 2: Build on Top of fast-redact

Extend fast-redact with custom serializers:

```typescript
const redact = fastRedact({
  paths: ["*.password", "*.ssn"],
  serialize: (obj) => {
    // Custom serialization with pattern detection
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "string") {
        if (isSSN(value)) return "[SSN_REDACTED]";
        if (isJWT(value)) return "[JWT_REDACTED]";
      }
      return value;
    });
  },
});
```

## Library Benefits

### fast-redact

- **Performance**: 10-100x faster than manual traversal
- **Path-based**: Excellent for known field locations
- **Production-tested**: Used by Pino logger ecosystem

### maskdata

- **Partial masking**: Built-in support for showing partial data
- **Multiple formats**: Email, phone, card masking strategies

### validator

- **Detection**: Comprehensive validation/detection functions
- **Well-maintained**: Active community support

## Final Assessment

| Strategy  | Library Coverage | Recommendation                                                |
| --------- | ---------------- | ------------------------------------------------------------- |
| **PII**   | 60%              | Use `fast-redact` + `validator` + custom SSN/DOB              |
| **Auth**  | 70%              | Use `fast-redact` for paths, custom for JWT/API key detection |
| **Error** | 0%               | Keep fully custom implementation                              |

### Overall Verdict:

- Libraries can save ~40-50% of the work
- Performance gains from `fast-redact` are significant
- You still need custom code for:
  - Error strategy (100% custom)
  - SSN, DOB, JWT detection
  - Partial redaction logic
  - Context-aware sanitization

## Recommended Action Plan

1. **Phase 1**: Keep current implementation, fix critical bugs
2. **Phase 2**: Benchmark performance of current vs fast-redact
3. **Phase 3**: If performance is critical, implement hybrid approach:
   - Use fast-redact for known paths
   - Keep custom patterns for value detection
   - Maintain error sanitization as custom
4. **Phase 4**: Consider logging-specific solutions (Pino with redaction)

## Cost-Benefit Analysis

### Keep Custom Implementation

- **Pros**: Full control, all features work, already built
- **Cons**: More code to maintain, potentially slower

### Switch to Libraries

- **Pros**: Less code, better performance, community support
- **Cons**: Missing features, need hybrid approach, migration effort

### Recommendation

**Keep the custom implementation** but:

1. Fix the current bugs (root object handling)
2. Consider adding `fast-redact` for performance-critical paths only
3. Use it as a learning experience for the team
4. Document why certain features require custom implementation
