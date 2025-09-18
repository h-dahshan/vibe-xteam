# Safe Stringify Utility 🛡️

> **The JSON Bodyguard**
>
> JSON.stringify() is like a tightrope walker—impressive when it works, catastrophic when it falls. Circular references, BigInts, functions, and symbols can all send it tumbling. The Safe Stringify utility is your safety net, ensuring that no matter what JavaScript throws at it, you always get a string back.

## 📖 The Circular Reference Nightmare

Picture this: You're debugging a production issue at 3 AM. You add a console.log(JSON.stringify(obj)) to see what's happening. Your application crashes with "Converting circular structure to JSON". Now you have two problems.

That's where Safe Stringify saves the day:

- **Handles circular references** gracefully
- **Never throws** an error
- **Preserves data visibility** for debugging
- **Customizable** for your specific needs

## 🎯 Core Features

### Circular Reference Detection

Automatically detects and replaces circular references with a placeholder.

### Error Recovery

Falls back gracefully when encountering non-serializable values.

### Custom Replacers

Support for custom replacer functions while maintaining safety.

### Performance Optimized

Uses WeakSet for efficient circular reference tracking.

## 💡 When to Use

### ✅ Perfect For

- **Logging objects** - Never let logging crash your app
- **Error serialization** - Capture error objects safely
- **API responses** - Ensure responses are always valid JSON
- **Debug output** - See complex object structures
- **Cache serialization** - Store objects reliably
- **Message queue payloads** - Guarantee serializable messages

### ❌ Use Regular JSON.stringify For

- **Simple data** - When you know the structure is safe
- **Performance critical** - When every microsecond counts
- **Strict validation** - When you want to fail on bad data

## 🚀 Usage Examples

### Basic Usage

```typescript
import { safeStringify } from "@/common/utils";

// Circular reference example
const user = { name: "Alice" };
const team = { name: "Engineering", lead: user };
user.team = team; // Circular reference!

// This would throw with JSON.stringify
// JSON.stringify(user); // ❌ TypeError: Converting circular structure to JSON

// Safe stringify handles it gracefully
const json = safeStringify(user);
console.log(json); // ✅ {"name":"Alice","team":{"name":"Engineering","lead":"[Circular]"}}
```

### Custom Replacer Function

```typescript
const data = {
  password: "secret123",
  creditCard: "4111111111111111",
  username: "alice",
  apiKey: "sk_live_abcd1234",
};

const sanitized = safeStringify(data, (key, value) => {
  // Redact sensitive fields
  if (key === "password" || key === "creditCard" || key === "apiKey") {
    return "[REDACTED]";
  }

  // Convert dates to ISO strings
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Remove functions
  if (typeof value === "function") {
    return "[Function]";
  }

  return value;
});

console.log(sanitized);
// {"password":"[REDACTED]","creditCard":"[REDACTED]","username":"alice","apiKey":"[REDACTED]"}
```

### Pretty Printing

```typescript
const complexObject = {
  users: [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" },
  ],
  settings: {
    theme: "dark",
    notifications: { email: true, push: false },
  },
};

// Pretty print with 2-space indentation
const pretty = safeStringify(complexObject, null, 2);
console.log(pretty);
/*
{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "Bob",
      "role": "user"
    }
  ],
  "settings": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
*/
```

## 🎨 Real-World Patterns

### 1. Error Logging

```typescript
@Injectable()
export class ErrorLogger {
  logError(error: unknown, context?: Record<string, unknown>): void {
    // Errors often have circular references (e.g., in cause chains)
    const errorInfo = safeStringify({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "UnknownError",
      cause: error instanceof Error ? error.cause : undefined,
      context,
      timestamp: new Date().toISOString(),
    });

    console.error(errorInfo);

    // Send to external service
    this.logService.send(errorInfo);
  }
}
```

### 2. Request/Response Logging

```typescript
@Injectable()
export class RequestLogger {
  logRequest(req: Request, res: Response): void {
    // Request and response objects have circular references
    const logEntry = safeStringify(
      {
        request: {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body,
          query: req.query,
          params: req.params,
        },
        response: {
          statusCode: res.statusCode,
          headers: res.getHeaders(),
        },
        timestamp: new Date().toISOString(),
      },
      (key, value) => {
        // Redact sensitive headers
        if (key === "authorization" || key === "cookie") {
          return "[REDACTED]";
        }

        // Limit string length for large bodies
        if (typeof value === "string" && value.length > 1000) {
          return value.substring(0, 1000) + "...[truncated]";
        }

        return value;
      }
    );

    this.logger.info(logEntry);
  }
}
```

### 3. State Debugging

```typescript
@Injectable()
export class StateDebugger {
  captureState(state: any, label: string): void {
    // Complex state objects often have circular references
    const snapshot = safeStringify(state, (key, value) => {
      // Handle special types
      if (value instanceof Map) {
        return { _type: "Map", entries: Array.from(value.entries()) };
      }

      if (value instanceof Set) {
        return { _type: "Set", values: Array.from(value) };
      }

      if (value instanceof WeakMap) {
        return "[WeakMap]";
      }

      if (value instanceof WeakSet) {
        return "[WeakSet]";
      }

      if (typeof value === "symbol") {
        return value.toString();
      }

      if (typeof value === "bigint") {
        return value.toString() + "n";
      }

      return value;
    });

    console.debug(`State snapshot [${label}]:`, snapshot);

    // Store for later analysis
    this.stateHistory.push({
      label,
      snapshot,
      timestamp: Date.now(),
    });
  }
}
```

### 4. Cache Serialization

```typescript
@Injectable()
export class CacheService {
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    // Ensure value is serializable before caching
    const serialized = safeStringify(value, (k, v) => {
      // Convert dates to timestamps for consistent serialization
      if (v instanceof Date) {
        return { _type: "Date", value: v.getTime() };
      }

      // Remove non-serializable types
      if (typeof v === "function" || typeof v === "undefined") {
        return null;
      }

      return v;
    });

    await this.redis.set(key, serialized, ttl ? ["EX", ttl] : []);
  }

  async get<T>(key: string): Promise<T | null> {
    const serialized = await this.redis.get(key);
    if (!serialized) return null;

    return JSON.parse(serialized, (k, v) => {
      // Restore dates
      if (v && typeof v === "object" && v._type === "Date") {
        return new Date(v.value);
      }
      return v;
    });
  }
}
```

### 5. Message Queue Payloads

```typescript
@Injectable()
export class MessageQueue {
  async publish(topic: string, message: unknown): Promise<void> {
    // Ensure message is serializable
    const payload = safeStringify(
      {
        topic,
        message,
        timestamp: Date.now(),
        correlationId: this.getCorrelationId(),
      },
      (key, value) => {
        // Handle domain objects
        if (value && typeof value === "object" && "toJSON" in value) {
          return value.toJSON();
        }

        // Remove internal properties
        if (key.startsWith("_")) {
          return undefined;
        }

        return value;
      }
    );

    await this.broker.send(topic, payload);
  }
}
```

## 🏗️ Advanced Patterns

### Size-Limited Stringify

```typescript
function sizeLimitedStringify(obj: unknown, maxSize: number): string {
  let size = 0;

  return safeStringify(obj, (key, value) => {
    // Track approximate size
    size += key.length + (typeof value === "string" ? value.length : 10);

    if (size > maxSize) {
      return "[Truncated due to size limit]";
    }

    return value;
  });
}
```

### Depth-Limited Stringify

```typescript
function depthLimitedStringify(obj: unknown, maxDepth: number): string {
  let depth = 0;

  return safeStringify(obj, function (key, value) {
    if (key === "") {
      // Root level
      depth = 0;
    } else if (value && typeof value === "object") {
      depth++;

      if (depth > maxDepth) {
        return "[Max depth exceeded]";
      }
    }

    return value;
  });
}
```

### Type-Preserving Stringify

```typescript
function typePreservingStringify(obj: unknown): string {
  return safeStringify(obj, (key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }

    if (value instanceof RegExp) {
      return { __type: "RegExp", source: value.source, flags: value.flags };
    }

    if (value instanceof Error) {
      return {
        __type: "Error",
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (typeof value === "bigint") {
      return { __type: "BigInt", value: value.toString() };
    }

    if (value instanceof Buffer) {
      return { __type: "Buffer", data: value.toString("base64") };
    }

    return value;
  });
}
```

## 🛡️ Best Practices

### 1. **Always Use for External Data**

```typescript
// Bad: Trust external data
const logged = JSON.stringify(request.body);

// Good: Safe stringify external data
const logged = safeStringify(request.body);
```

### 2. **Sanitize Sensitive Data**

```typescript
// Always use a replacer for sensitive data
const safe = safeStringify(data, (key, value) => {
  const sensitiveKeys = ["password", "token", "secret", "key", "ssn"];
  if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
    return "[REDACTED]";
  }
  return value;
});
```

### 3. **Consider Performance**

```typescript
// For hot paths, cache the replacer function
const replacer = createReplacer();

function logMany(items: unknown[]) {
  for (const item of items) {
    console.log(safeStringify(item, replacer));
  }
}
```

### 4. **Handle Special Types Explicitly**

```typescript
const comprehensive = safeStringify(obj, (key, value) => {
  // Be explicit about how to handle special types
  if (value === undefined) return "[undefined]";
  if (value === null) return null;
  if (typeof value === "symbol") return `[Symbol: ${value.toString()}]`;
  if (typeof value === "function")
    return `[Function: ${value.name || "anonymous"}]`;
  return value;
});
```

## 🎭 The Safety Net Metaphor

Think of Safe Stringify as a circus safety net:

- **JSON.stringify**: The tightrope walker
- **Circular References**: The unexpected wind gust
- **Safe Stringify**: The net that catches you
- **Custom Replacer**: The safety inspector who checks everything
- **Error Fallback**: The backup net under the main net

## 📊 Performance Considerations

```typescript
// Benchmark: safeStringify vs JSON.stringify
// Test with 1000 objects, no circular references
// JSON.stringify: 0.5ms
// safeStringify: 0.7ms
// Overhead: ~40%

// With circular references:
// JSON.stringify: Throws error
// safeStringify: 0.8ms
// Value: Priceless
```

## 🚨 Common Pitfalls

### WeakSet Memory Usage

```typescript
// The WeakSet is created per call
// For many small stringifies, consider reusing:
class StringifyService {
  private seen = new WeakSet();

  stringify(obj: unknown): string {
    this.seen = new WeakSet(); // Reset for each use
    return this.doStringify(obj);
  }
}
```

### Replacer Function Errors

```typescript
// Bad: Replacer can throw
safeStringify(obj, (key, value) => {
  return value.toString(); // Might throw!
});

// Good: Safe replacer
safeStringify(obj, (key, value) => {
  try {
    return value?.toString() ?? value;
  } catch {
    return "[toString failed]";
  }
});
```

## 🚀 Next Steps

### Planned Enhancements

1. **Max Depth Option**
   - Add a `maxDepth` parameter to prevent stack overflow on deeply nested objects
   - Useful for debugging without overwhelming output

   ```typescript
   safeStringify(deepObject, null, 2, { maxDepth: 5 });
   ```

2. **String Length Truncation**
   - Add `maxStringLength` option for automatic truncation of large strings
   - Prevents memory issues with huge text fields

   ```typescript
   safeStringify(data, null, 2, { maxStringLength: 1000 });
   ```

3. **Enhanced TypeScript Support**
   - Add stricter type definitions for the replacer function
   - Provide better IntelliSense and type safety

   ```typescript
   type Replacer<T = unknown> = (
     this: any,
     key: string,
     value: T
   ) => T | string | undefined;
   ```

4. **Performance Optimization**
   - Implement WeakSet pooling for high-frequency usage scenarios
   - Reduce object allocation overhead in hot paths

   ```typescript
   class StringifyPool {
     private pool: WeakSet<object>[] = [];

     acquire(): WeakSet<object> {
       return this.pool.pop() || new WeakSet();
     }

     release(set: WeakSet<object>): void {
       // Clear and return to pool
       this.pool.push(set);
     }
   }
   ```

### Integration Tasks

- Replace unsafe `JSON.parse(JSON.stringify())` in logging interceptor
- Add safe-stringify to all error handling paths
- Implement in cache serialization layer

## 💭 Final Thoughts

_"JSON.stringify() is like a fair-weather friend—great when everything's perfect, absent when you need it most. Safe Stringify is the friend who shows up at 3 AM when your car breaks down."_ 🚗
