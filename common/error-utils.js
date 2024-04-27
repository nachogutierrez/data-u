export function serializeError(error) {
    return {
      message: error.message,    // Error message
      stack: error.stack,        // Stack trace
      name: error.name,          // Error name (e.g., ReferenceError)
      ...(error.code && { code: error.code }),  // Include code if it exists (useful for Node.js errors)
    };
  }