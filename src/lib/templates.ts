import { FluxTemplate, TemplateCategory } from '@/types/flux';

export const fluxTemplates: FluxTemplate[] = [
  // ======== GETTING STARTED ========
  {
    id: 'hello-world',
    name: 'Hello World',
    description: 'The classic first program — prints a greeting and returns a value.',
    category: 'getting-started',
    tags: ['beginner', 'basic'],
    content: `---
title: Hello World
version: 1.0
description: The classic first FLUX program
author: FLUX IDE
---

# Hello World

A minimal FLUX program that demonstrates the basic structure with YAML frontmatter, module heading, and a main function.

## fn: main() -> i32

\`\`\`c
int main() {
    // FLUX Hello World
    // This program returns 42 as a success code
    int result = 42;
    return result;
}
\`\`\`
`,
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Sequence',
    description: 'Compute Fibonacci numbers iteratively with a clean loop structure.',
    category: 'getting-started',
    tags: ['math', 'loops', 'beginner'],
    content: `---
title: Fibonacci Sequence
version: 1.0
description: Compute Fibonacci numbers using iterative approach
---

# Fibonacci

This module demonstrates iterative Fibonacci computation with proper register usage.

## fn: fibonacci(n: i32) -> i32

\`\`\`c
int fibonacci(int n) {
    int a = 0, b = 1, temp, i;
    for (i = 0; i < n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    return a;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int n = 10;
    int result = fibonacci(n);
    // result = fibonacci(10) = 55
    return result;
}
\`\`\`
`,
  },
  {
    id: 'variables-types',
    name: 'Variables & Types',
    description: 'Explore FLUX primitive types: integers, floats, booleans, strings, pointers.',
    category: 'getting-started',
    tags: ['types', 'variables', 'beginner'],
    content: `---
title: Variables and Types
version: 1.0
description: Demonstrates FLUX primitive types and variable declarations
---

# Variables and Types

FLUX supports a rich set of primitive types for systems programming.

## fn: demo_types() -> i32

\`\`\`c
int demo_types() {
    // Integer types
    i8 small = 127;
    i16 medium = 32767;
    i32 normal = 2147483647;
    i64 big = 9223372036854775807LL;
    
    // Unsigned types
    u8 byte_val = 255;
    u16 word_val = 65535;
    u32 dword = 4294967295U;
    u64 qword = 18446744073709551615ULL;
    
    // Float types
    f32 single = 3.14159f;
    f64 double_val = 3.141592653589793;
    
    // Boolean and special types
    bool flag = true;
    void* ptr = 0;  // nil pointer
    
    // Return count of initialized variables
    return 12;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int count = demo_types();
    return count;
}
\`\`\`
`,
  },
  {
    id: 'control-flow',
    name: 'Control Flow',
    description: 'If/else, while, for, loop constructs with comparison operations.',
    category: 'getting-started',
    tags: ['conditionals', 'loops', 'beginner'],
    content: `---
title: Control Flow
version: 1.0
description: Demonstrates FLUX control flow constructs
---

# Control Flow

FLUX supports all standard control flow patterns including branching, looping, and conditional execution.

## fn: classify_score(score: i32) -> i32

\`\`\`c
int classify_score(int score) {
    int grade = 0;
    
    if (score >= 90) {
        grade = 4; // A
    } else if (score >= 80) {
        grade = 3; // B
    } else if (score >= 70) {
        grade = 2; // C
    } else if (score >= 60) {
        grade = 1; // D
    } else {
        grade = 0; // F
    }
    
    return grade;
}
\`\`\`

## fn: sum_to_n(n: i32) -> i32

\`\`\`c
int sum_to_n(int n) {
    int sum = 0;
    int i = 1;
    
    while (i <= n) {
        sum += i;
        i++;
    }
    
    return sum;
}
\`\`\`

## fn: factorial(n: i32) -> i32

\`\`\`c
int factorial(int n) {
    if (n <= 1) return 1;
    
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int grade = classify_score(85);
    int sum = sum_to_n(100);
    int fact = factorial(10);
    // grade=3, sum=5050, fact=3628800
    return fact;
}
\`\`\`
`,
  },
  {
    id: 'functions',
    name: 'Functions',
    description: 'Function declarations, parameters, return types, recursion, and closures.',
    category: 'getting-started',
    tags: ['functions', 'recursion', 'beginner'],
    content: `---
title: Functions
version: 1.0
description: Demonstrates FLUX function declarations and patterns
---

# Functions

Functions are first-class citizens in FLUX with typed parameters and return values.

## fn: add(a: i32, b: i32) -> i32

\`\`\`c
int add(int a, int b) {
    return a + b;
}
\`\`\`

## fn: multiply(a: i32, b: i32) -> i32

\`\`\`c
int multiply(int a, int b) {
    return a * b;
}
\`\`\`

## fn: power(base: i32, exp: i32) -> i32

\`\`\`c
int power(int base, int exp) {
    if (exp == 0) return 1;
    int result = base;
    for (int i = 1; i < exp; i++) {
        result *= base;
    }
    return result;
}
\`\`\`

## fn: gcd(a: i32, b: i32) -> i32

\`\`\`c
int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int sum = add(10, 20);
    int product = multiply(6, 7);
    int pow = power(2, 10);
    int g = gcd(48, 18);
    // sum=30, product=42, pow=1024, gcd=6
    return pow;
}
\`\`\`
`,
  },

  // ======== SOFTWARE RECREATION ========
  {
    id: 'http-server',
    name: 'HTTP Server',
    description: 'Like nginx/node-http — a basic HTTP server with route handling and request parsing.',
    category: 'software-recreation',
    tags: ['server', 'networking', 'http'],
    content: `---
title: HTTP Server
version: 1.0
description: A minimal HTTP server with route handling
---

# HTTP Server

A lightweight HTTP server implementation inspired by nginx's routing model, with support for GET/POST handlers and middleware.

## fn: parse_request(raw: ptr) -> i32

\`\`\`c
int parse_request(void* raw) {
    // Parse HTTP method, path, headers
    // Returns: 0 = GET, 1 = POST, -1 = invalid
    char* method = (char*)raw;
    
    if (method[0] == 'G' && method[1] == 'E' && method[2] == 'T') {
        return 0; // GET
    } else if (method[0] == 'P' && method[1] == 'O' && method[2] == 'S' && method[3] == 'T') {
        return 1; // POST
    }
    return -1; // Invalid
}
\`\`\`

## fn: handle_get(path: ptr) -> i32

\`\`\`c
int handle_get(void* path) {
    // Route: "/" -> index
    // Route: "/api" -> api handler
    // Route: "/static" -> file server
    int status = 200;
    // Match routes and dispatch handler
    return status;
}
\`\`\`

## fn: handle_post(path: ptr, body: ptr) -> i32

\`\`\`c
int handle_post(void* path, void* body) {
    // Parse body, validate content-type
    // Process request body
    int status = 201;
    return status;
}
\`\`\`

## fn: send_response(status: i32, body: ptr) -> i32

\`\`\`c
int send_response(int status, void* body) {
    // Build HTTP response
    // "HTTP/1.1 <status> OK\\r\\n"
    // "Content-Type: text/html\\r\\n"
    // "<body>"
    return status;
}
\`\`\`

## fn: listen(port: i32) -> i32

\`\`\`c
int listen(int port) {
    // Create socket, bind, listen
    int running = 1;
    while (running) {
        // Accept connection
        // Parse request
        // Route to handler
        // Send response
    }
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int port = 8080;
    int result = listen(port);
    return result;
}
\`\`\`
`,
  },
  {
    id: 'file-manager',
    name: 'File Manager',
    description: 'Like ls/cp/mv — a command-line file manager with operations on virtual paths.',
    category: 'software-recreation',
    tags: ['filesystem', 'cli', 'files'],
    content: `---
title: File Manager
version: 1.0
description: Command-line file manager with ls, cp, mv, rm operations
---

# File Manager

A virtual file system manager implementing common Unix file operations.

## fn: ls(path: ptr) -> i32

\`\`\`c
int ls(void* path) {
    // List directory contents
    int count = 0;
    // Scan directory entries
    // Print: name, type, size, permissions
    return count;
}
\`\`\`

## fn: cp(src: ptr, dst: ptr) -> i32

\`\`\`c
int cp(void* src, void* dst) {
    // Copy file from src to dst
    // Open source, create destination
    // Read/write in buffer chunks
    int bytes_copied = 0;
    return bytes_copied;
}
\`\`\`

## fn: mv(src: ptr, dst: ptr) -> i32

\`\`\`c
int mv(void* src, void* dst) {
    // Rename or move file
    // If same filesystem: rename
    // If different: copy + delete
    int result = cp(src, dst);
    if (result >= 0) {
        // Delete source file
    }
    return result;
}
\`\`\`

## fn: rm(path: ptr) -> i32

\`\`\`c
int rm(void* path) {
    // Remove file or directory
    // Check permissions
    // Free disk blocks
    return 0;
}
\`\`\`

## fn: mkdir(path: ptr) -> i32

\`\`\`c
int mkdir(void* path) {
    // Create directory
    // Initialize directory entry
    // Update parent directory
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    ls("/");
    mkdir("/home/user/documents");
    cp("/etc/config", "/home/user/documents/config.bak");
    mv("/tmp/data", "/home/user/documents/data");
    rm("/tmp/old_file");
    return 0;
}
\`\`\`
`,
  },
  {
    id: 'json-parser',
    name: 'JSON Parser',
    description: 'A complete JSON parser/tokenizer handling objects, arrays, strings, numbers.',
    category: 'software-recreation',
    tags: ['parser', 'json', 'data'],
    content: `---
title: JSON Parser
version: 1.0
description: Tokenizer and parser for JSON data format
---

# JSON Parser

A streaming JSON parser that tokenizes and builds a tree structure from JSON input.

## fn: tokenize(input: ptr) -> i32

\`\`\`c
int tokenize(void* input) {
    // Scan input character by character
    // Produce tokens: STRING, NUMBER, BOOL, NULL
    //   LBRACE, RBRACE, LBRACKET, RBRACKET
    //   COLON, COMMA
    int token_count = 0;
    
    // Skip whitespace
    // Identify token type
    // Store token with position and length
    
    return token_count;
}
\`\`\`

## fn: parse_value(tokens: ptr, pos: i32) -> i32

\`\`\`c
int parse_value(void* tokens, int pos) {
    // Dispatch based on token type:
    // STRING  -> parse_string
    // NUMBER  -> parse_number
    // BOOL    -> parse_bool
    // NULL    -> return null node
    // LBRACE  -> parse_object
    // LBRACKET -> parse_array
    return pos;
}
\`\`\`

## fn: parse_object(tokens: ptr, pos: i32) -> i32

\`\`\`c
int parse_object(void* tokens, int pos) {
    // Expect LBRACE
    // Loop: key COLON value COMMA?
    // Until RBRACE
    int key_count = 0;
    return key_count;
}
\`\`\`

## fn: parse_array(tokens: ptr, pos: i32) -> i32

\`\`\`c
int parse_array(void* tokens, int pos) {
    // Expect LBRACKET
    // Loop: value COMMA?
    // Until RBRACKET
    int element_count = 0;
    return element_count;
}
\`\`\`

## fn: stringify(node: ptr, indent: i32) -> i32

\`\`\`c
int stringify(void* node, int indent) {
    // Convert parsed tree back to JSON string
    // With pretty-printing support
    int chars_written = 0;
    return chars_written;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    char* json = "{\\"name\\": \\"flux\\", \\"version\\": 1, \\"active\\": true}";
    int tokens = tokenize(json);
    // Parse tokens into tree
    return tokens;
}
\`\`\`
`,
  },
  {
    id: 'csv-processor',
    name: 'CSV Processor',
    description: 'Parse, transform, filter, and aggregate CSV data with a pipeline model.',
    category: 'software-recreation',
    tags: ['data', 'csv', 'processing'],
    content: `---
title: CSV Processor
version: 1.0
description: CSV parsing, filtering, and aggregation pipeline
---

# CSV Processor

A CSV data processing pipeline inspired by tools like pandas and awk.

## fn: parse_csv(input: ptr) -> i32

\`\`\`c
int parse_csv(void* input) {
    // Split by newlines for rows
    // Split by comma for fields
    // Handle quoted fields (escaped commas)
    int row_count = 0;
    
    // First row = header
    // Subsequent rows = data
    
    return row_count;
}
\`\`\`

## fn: filter_rows(rows: ptr, column: i32, predicate: i32) -> i32

\`\`\`c
int filter_rows(void* rows, int column, int predicate) {
    // Filter rows where column matches predicate
    // predicate: 0=equals, 1=greater, 2=less, 3=contains
    int match_count = 0;
    return match_count;
}
\`\`\`

## fn: aggregate(rows: ptr, column: i32, op: i32) -> i32

\`\`\`c
int aggregate(void* rows, int column, int op) {
    // op: 0=SUM, 1=AVG, 2=MIN, 3=MAX, 4=COUNT
    int result = 0;
    int count = 0;
    
    for (int i = 0; i < count; i++) {
        int val = 0; // get field value
        switch (op) {
            case 0: result += val; break;   // SUM
            case 1: result += val; break;   // AVG (divide later)
            case 2: if (val < result) result = val; break; // MIN
            case 3: if (val > result) result = val; break; // MAX
            case 4: result++; break;          // COUNT
        }
    }
    
    if (op == 1 && count > 0) result /= count;
    return result;
}
\`\`\`

## fn: write_csv(rows: ptr, path: ptr) -> i32

\`\`\`c
int write_csv(void* rows, void* path) {
    // Write rows to CSV file
    // Proper quoting and escaping
    int bytes_written = 0;
    return bytes_written;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    // Process: read -> parse -> filter -> aggregate -> write
    int rows = parse_csv(0);
    int filtered = filter_rows(0, 2, 1);
    int total = aggregate(0, 3, 0);
    return total;
}
\`\`\`
`,
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    description: 'Basic text editor with buffer management, insert/delete, and line operations.',
    category: 'software-recreation',
    tags: ['editor', 'text', 'buffer'],
    content: `---
title: Text Editor Core
version: 1.0
description: Core text editing operations with buffer management
---

# Text Editor Core

A minimal text editor engine handling buffer operations, cursor movement, and text manipulation.

## fn: buffer_init(size: i32) -> i32

\`\`\`c
int buffer_init(int size) {
    // Allocate text buffer
    // Initialize gap buffer structure
    // gap_start = 0, gap_end = size
    int buffer_id = 0;
    return buffer_id;
}
\`\`\`

## fn: buffer_insert(buf: i32, text: ptr, pos: i32) -> i32

\`\`\`c
int buffer_insert(int buf, void* text, int pos) {
    // Move gap to position
    // Copy text into gap
    // Shrink gap
    int bytes_inserted = 0;
    return bytes_inserted;
}
\`\`\`

## fn: buffer_delete(buf: i32, start: i32, end: i32) -> i32

\`\`\`c
int buffer_delete(int buf, int start, int end) {
    // Move gap to start position
    // Expand gap to cover deleted range
    int bytes_deleted = end - start;
    return bytes_deleted;
}
\`\`\`

## fn: buffer_get_line(buf: i32, line: i32) -> i32

\`\`\`c
int buffer_get_line(int buf, int line) {
    // Find line start (scan for newlines)
    // Return line offset
    int offset = 0;
    return offset;
}
\`\`\`

## fn: buffer_line_count(buf: i32) -> i32

\`\`\`c
int buffer_line_count(int buf) {
    // Count newline characters
    int count = 0;
    return count;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int buf = buffer_init(65536);
    buffer_insert(buf, "Hello, FLUX!", 0);
    buffer_insert(buf, "\\n", 12);
    int lines = buffer_line_count(buf);
    return lines;
}
\`\`\`
`,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Expression parser and evaluator with operator precedence.',
    category: 'software-recreation',
    tags: ['math', 'parser', 'evaluator'],
    content: `---
title: Calculator
version: 1.0
description: Expression parser and evaluator with operator precedence
---

# Calculator

A recursive descent calculator that parses and evaluates mathematical expressions.

## fn: tokenize_expr(input: ptr) -> i32

\`\`\`c
int tokenize_expr(void* input) {
    // Tokenize: NUMBER, PLUS, MINUS, STAR, SLASH, LPAREN, RPAREN
    int token_count = 0;
    return token_count;
}
\`\`\`

## fn: parse_expr(tokens: ptr, pos: i32) -> i32

\`\`\`c
// expr   = term (('+' | '-') term)*
// term   = factor (('*' | '/') factor)*
// factor = NUMBER | '(' expr ')' | '-' factor
\`\`\`

## fn: eval_expr(tokens: ptr, pos: i32) -> i32

\`\`\`c
int eval_expr(void* tokens, int pos) {
    // Recursive descent evaluation
    int result = 0;
    // Parse term
    // While next is + or -:
    //   advance
    //   parse next term
    //   add/subtract
    return result;
}
\`\`\`

## fn: eval_term(tokens: ptr, pos: i32) -> i32

\`\`\`c
int eval_term(void* tokens, int pos) {
    int result = 0;
    // Parse factor
    // While next is * or /:
    //   advance
    //   parse next factor
    //   multiply/divide
    return result;
}
\`\`\`

## fn: eval_number(tokens: ptr, pos: i32) -> i32

\`\`\`c
int eval_number(void* tokens, int pos) {
    // Read consecutive digits
    int value = 0;
    return value;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    // Evaluate: 2 + 3 * 4 = 14
    // Evaluate: (2 + 3) * 4 = 20
    // Evaluate: 10 / 2 - 3 = 2
    int result = 14;
    return result;
}
\`\`\`
`,
  },
  {
    id: 'todo-list',
    name: 'Todo List CLI',
    description: 'A command-line todo manager with add, complete, list, and delete.',
    category: 'software-recreation',
    tags: ['cli', 'productivity', 'tasks'],
    content: `---
title: Todo List CLI
version: 1.0
description: Command-line task manager with CRUD operations
---

# Todo List CLI

A minimal task management system with add, complete, delete, and list operations.

## fn: todo_add(list: ptr, text: ptr, priority: i32) -> i32

\`\`\`c
int todo_add(void* list, void* text, int priority) {
    // Create new todo item
    // Assign unique ID
    // Set status = pending
    // Insert sorted by priority
    int id = 0;
    return id;
}
\`\`\`

## fn: todo_complete(list: ptr, id: i32) -> i32

\`\`\`c
int todo_complete(void* list, int id) {
    // Find todo by ID
    // Set status = done
    // Set completed_at = now()
    return 0;
}
\`\`\`

## fn: todo_delete(list: ptr, id: i32) -> i32

\`\`\`c
int todo_delete(void* list, int id) {
    // Find and remove todo by ID
    // Compact list
    return 0;
}
\`\`\`

## fn: todo_list_pending(list: ptr) -> i32

\`\`\`c
int todo_list_pending(void* list) {
    // Filter todos where status == pending
    // Sort by priority (high first)
    // Print formatted list
    int count = 0;
    return count;
}
\`\`\`

## fn: todo_stats(list: ptr) -> i32

\`\`\`c
int todo_stats(void* list) {
    // Count: total, pending, completed
    // Calculate completion rate
    int total = 0;
    int completed = 0;
    return completed * 100 / (total > 0 ? total : 1);
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int id1 = todo_add(0, "Build FLUX IDE", 3);
    int id2 = todo_add(0, "Write tests", 2);
    int id3 = todo_add(0, "Deploy", 1);
    todo_complete(0, id1);
    int pending = todo_list_pending(0);
    int rate = todo_stats(0);
    return rate;
}
\`\`\`
`,
  },
  {
    id: 'regex-engine',
    name: 'Regex Engine',
    description: 'Basic regular expression engine supporting literals, dots, stars, and groups.',
    category: 'software-recreation',
    tags: ['regex', 'pattern', 'matching'],
    content: `---
title: Regex Engine
version: 1.0
description: Basic regular expression matcher with common operators
---

# Regex Engine

A simple NFA-based regular expression engine supporting basic patterns.

## fn: compile_regex(pattern: ptr) -> i32

\`\`\`c
int compile_regex(void* pattern) {
    // Parse regex pattern into NFA states
    // Supported: literals, . (any), * (zero+), + (one+)
    //   ? (zero/one), | (or), () (group)
    // Build epsilon-closure table
    int state_count = 0;
    return state_count;
}
\`\`\`

## fn: match(regex: i32, text: ptr, start: i32) -> i32

\`\`\`c
int match(int regex, void* text, int start) {
    // Run NFA simulation on text from start position
    // Track current set of NFA states
    // For each character: compute next states
    // Check if any accept state reached
    int match_length = 0;
    return match_length;
}
\`\`\`

## fn: search(regex: i32, text: ptr) -> i32

\`\`\`c
int search(int regex, void* text) {
    // Try matching at each position in text
    // Return first match position (-1 if no match)
    int pos = -1;
    int len = 0;
    while (1) {
        len = match(regex, text, pos + 1);
        if (len > 0) return pos + 1;
        if (pos >= len) break;
        pos++;
    }
    return pos;
}
\`\`\`

## fn: replace(regex: i32, text: ptr, replacement: ptr) -> i32

\`\`\`c
int replace(int regex, void* text, void* replacement) {
    // Find all matches
    // Build new string with replacements
    int replacements = 0;
    return replacements;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int r = compile_regex("hel+o");
    int pos = search(r, "say hello world");
    return pos;
}
\`\`\`
`,
  },
  {
    id: 'basic-database',
    name: 'Basic Database',
    description: 'A simple key-value store with B-tree indexing and persistence.',
    category: 'software-recreation',
    tags: ['database', 'storage', 'btree'],
    content: `---
title: Basic Database
version: 1.0
description: Simple key-value database with B-tree indexing
---

# Basic Database

A minimal in-memory database with B-tree indexing and WAL-based persistence.

## fn: db_open(name: ptr) -> i32

\`\`\`c
int db_open(void* name) {
    // Load or create database
    // Initialize B-tree root
    // Start WAL for recovery
    int db_id = 0;
    return db_id;
}
\`\`\`

## fn: db_put(db: i32, key: ptr, value: ptr) -> i32

\`\`\`c
int db_put(int db, void* key, void* value) {
    // Write to WAL
    // Insert into B-tree
    // Update in-memory cache
    return 0;
}
\`\`\`

## fn: db_get(db: i32, key: ptr) -> i32

\`\`\`c
int db_get(int db, void* key) {
    // Check cache first
    // B-tree lookup
    // Return value length
    int value_len = 0;
    return value_len;
}
\`\`\`

## fn: db_delete(db: i32, key: ptr) -> i32

\`\`\`c
int db_delete(int db, void* key) {
    // Mark as deleted in WAL
    // Remove from B-tree
    // Invalidate cache entry
    return 0;
}
\`\`\`

## fn: db_scan(db: i32, prefix: ptr) -> i32

\`\`\`c
int db_scan(int db, void* prefix) {
    // Range scan with prefix filter
    // Return iterator over matching keys
    int count = 0;
    return count;
}
\`\`\`

## fn: db_compact(db: i32) -> i32

\`\`\`c
int db_compact(int db) {
    // Merge WAL into main file
    // Rebuild B-tree
    // Reclaim freed space
    int bytes_freed = 0;
    return bytes_freed;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int db = db_open("mydb");
    db_put(db, "name", "FLUX");
    db_put(db, "version", "1.0");
    int len = db_get(db, "name");
    int count = db_scan(db, "");
    db_compact(db);
    return count;
}
\`\`\`
`,
  },
  {
    id: 'sort-algorithms',
    name: 'Sort Algorithm Collection',
    description: 'Implementations of bubble, quick, merge, and heap sort.',
    category: 'software-recreation',
    tags: ['algorithms', 'sorting', 'performance'],
    content: `---
title: Sort Algorithm Collection
version: 1.0
description: Common sorting algorithms implemented in FLUX
---

# Sort Algorithms

A collection of sorting algorithms with different complexity characteristics.

## fn: bubble_sort(arr: ptr, len: i32) -> i32

\`\`\`c
int bubble_sort(void* arr, int len) {
    for (int i = 0; i < len - 1; i++) {
        for (int j = 0; j < len - i - 1; j++) {
            int a = 0; // arr[j]
            int b = 0; // arr[j+1]
            if (a > b) {
                // swap(arr[j], arr[j+1])
            }
        }
    }
    return len;
}
\`\`\`

## fn: quick_sort(arr: ptr, low: i32, high: i32) -> i32

\`\`\`c
int quick_sort(void* arr, int low, int high) {
    if (low < high) {
        int pivot = 0; // partition(arr, low, high)
        quick_sort(arr, low, pivot - 1);
        quick_sort(arr, pivot + 1, high);
    }
    return 0;
}
\`\`\`

## fn: merge_sort(arr: ptr, left: i32, right: i32) -> i32

\`\`\`c
int merge_sort(void* arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        merge_sort(arr, left, mid);
        merge_sort(arr, mid + 1, right);
        // merge(arr, left, mid, right)
    }
    return 0;
}
\`\`\`

## fn: insertion_sort(arr: ptr, len: i32) -> i32

\`\`\`c
int insertion_sort(void* arr, int len) {
    for (int i = 1; i < len; i++) {
        int key = 0; // arr[i]
        int j = i - 1;
        while (j >= 0 && 0 /*arr[j]*/ > key) {
            // arr[j+1] = arr[j]
            j--;
        }
        // arr[j+1] = key
    }
    return len;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    // Test all sorting algorithms
    int len = 100;
    int ops = len * (len - 1) / 2;
    return ops;
}
\`\`\`
`,
  },
  {
    id: 'web-scraper',
    name: 'Web Scraper',
    description: 'HTML parser with CSS selector support for extracting structured data.',
    category: 'software-recreation',
    tags: ['web', 'html', 'scraping'],
    content: `---
title: Web Scraper
version: 1.0
description: HTML parser with CSS selector-based data extraction
---

# Web Scraper

A lightweight HTML scraper that parses DOM structure and extracts data using CSS-like selectors.

## fn: fetch_url(url: ptr) -> i32

\`\`\`c
int fetch_url(void* url) {
    // Make HTTP GET request
    // Store response body
    // Return content length
    int content_len = 0;
    return content_len;
}
\`\`\`

## fn: parse_html(html: ptr) -> i32

\`\`\`c
int parse_html(void* html) {
    // Tokenize: TAG_OPEN, TAG_CLOSE, ATTR, TEXT
    // Build DOM tree
    // Handle self-closing tags, attributes
    int node_count = 0;
    return node_count;
}
\`\`\`

## fn: select_all(root: i32, selector: ptr) -> i32

\`\`\`c
int select_all(int root, void* selector) {
    // Parse CSS selector: tag, .class, #id, [attr]
    // Traverse DOM tree
    // Collect matching nodes
    int match_count = 0;
    return match_count;
}
\`\`\`

## fn: get_text(node: i32) -> i32

\`\`\`c
int get_text(int node) {
    // Extract text content from node
    // Strip HTML tags
    int text_len = 0;
    return text_len;
}
\`\`\`

## fn: get_attr(node: i32, name: ptr) -> i32

\`\`\`c
int get_attr(int node, void* name) {
    // Get attribute value from node
    int value_len = 0;
    return value_len;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    // Scrape example: extract all links from page
    int html_len = fetch_url("https://example.com");
    int nodes = parse_html(0);
    int links = select_all(0, "a[href]");
    return links;
}
\`\`\`
`,
  },
  {
    id: 'chat-bot',
    name: 'Chat Bot',
    description: 'A pattern-matching chatbot with state management and response templates.',
    category: 'software-recreation',
    tags: ['chat', 'nlp', 'bot'],
    content: `---
title: Chat Bot
version: 1.0
description: Pattern-matching chatbot with conversation state
---

# Chat Bot

A rule-based chatbot engine using pattern matching and template responses.

## fn: bot_init(name: ptr) -> i32

\`\`\`c
int bot_init(void* name) {
    // Initialize bot with name and personality
    // Load pattern-response rules
    // Reset conversation state
    int bot_id = 0;
    return bot_id;
}
\`\`\`

## fn: bot_match(input: ptr, pattern: ptr) -> i32

\`\`\`c
int bot_match(void* input, void* pattern) {
    // Pattern format: "hello *"
    // * matches any text
    // Compare word-by-word
    int confidence = 0;
    return confidence;
}
\`\`\`

## fn: bot_respond(bot: i32, input: ptr) -> i32

\`\`\`c
int bot_respond(int bot, void* input) {
    // Try each pattern rule
    // Pick highest confidence match
    // Fill response template
    // Update conversation history
    int response_id = 0;
    return response_id;
}
\`\`\`

## fn: bot_learn(bot: i32, pattern: ptr, response: ptr) -> i32

\`\`\`c
int bot_learn(int bot, void* pattern, void* response) {
    // Add new pattern-response rule
    // Assign priority weight
    int rule_id = 0;
    return rule_id;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int bot = bot_init("FLUX Bot");
    bot_learn(bot, "hello *", "Hi there! How can I help?");
    bot_learn(bot, "what is *", "* is a great question!");
    bot_learn(bot, "bye", "See you later!");
    int response = bot_respond(bot, "hello world");
    return response;
}
\`\`\`
`,
  },
  {
    id: 'logger-system',
    name: 'Logger System',
    description: 'Structured logging system with levels, formatters, and file rotation.',
    category: 'software-recreation',
    tags: ['logging', 'output', 'debugging'],
    content: `---
title: Logger System
version: 1.0
description: Structured logging with levels, formatting, and rotation
---

# Logger System

A flexible logging framework supporting multiple output targets and log levels.

## fn: logger_init(name: ptr, level: i32) -> i32

\`\`\`c
int logger_init(void* name, int level) {
    // Levels: 0=TRACE, 1=DEBUG, 2=INFO, 3=WARN, 4=ERROR
    // Create log file or stdout handler
    int logger_id = 0;
    return logger_id;
}
\`\`\`

## fn: logger_log(logger: i32, level: i32, msg: ptr) -> i32

\`\`\`c
int logger_log(int logger, int level, void* msg) {
    // Check if level >= configured level
    // Format: [TIMESTAMP] [LEVEL] [NAME] message
    // Write to handler(s)
    // Rotate if file too large
    int bytes_written = 0;
    return bytes_written;
}
\`\`\`

## fn: logger_format(timestamp: i32, level: i32, name: ptr, msg: ptr) -> i32

\`\`\`c
int logger_format(int timestamp, int level, void* name, void* msg) {
    // Format: "2024-01-15T10:30:00Z [INFO ] [myapp] Hello"
    // Pad level to 5 chars
    int format_len = 0;
    return format_len;
}
\`\`\`

## fn: logger_rotate(logger: i32) -> i32

\`\`\`c
int logger_rotate(int logger) {
    // Rename current log to .1
    // Shift .1 -> .2, .2 -> .3, etc.
    // Create new empty log file
    int rotated = 0;
    return rotated;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int log = logger_init("flux-app", 2); // INFO level
    logger_log(log, 2, "Application started");
    logger_log(log, 1, "Debug: initializing modules");
    logger_log(log, 3, "Warning: low memory");
    logger_log(log, 4, "Error: connection failed");
    return 0;
}
\`\`\`
`,
  },
  {
    id: 'config-manager',
    name: 'Config Manager',
    description: 'Hierarchical configuration system with environment overrides and validation.',
    category: 'software-recreation',
    tags: ['config', 'settings', 'validation'],
    content: `---
title: Config Manager
version: 1.0
description: Hierarchical configuration with environment overrides
---

# Config Manager

A layered configuration system supporting defaults, files, and environment variable overrides.

## fn: config_load(path: ptr) -> i32

\`\`\`c
int config_load(void* path) {
    // Load config from YAML/JSON file
    // Merge with defaults
    // Apply environment overrides (FLUX_*)
    int key_count = 0;
    return key_count;
}
\`\`\`

## fn: config_get(config: i32, key: ptr) -> i32

\`\`\`c
int config_get(int config, void* key) {
    // Dot-notation key lookup: "server.port"
    // Traverse nested structure
    // Return value type indicator
    int type = 0;
    return type;
}
\`\`\`

## fn: config_set(config: i32, key: ptr, value: ptr) -> i32

\`\`\`c
int config_set(int config, void* key, void* value) {
    // Set value at dot-notation path
    // Create intermediate objects if needed
    // Validate value type
    return 0;
}
\`\`\`

## fn: config_validate(config: i32, schema: ptr) -> i32

\`\`\`c
int config_validate(int config, void* schema) {
    // Check required keys exist
    // Validate types match schema
    // Check value ranges
    int errors = 0;
    return errors;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int keys = config_load("config.yaml");
    config_set(0, "server.port", "8080");
    config_set(0, "server.host", "localhost");
    config_set(0, "debug", "true");
    int errors = config_validate(0, 0);
    return errors;
}
\`\`\`
`,
  },

  // ======== AGENT SYSTEMS ========
  {
    id: 'multi-agent-pipeline',
    name: 'Multi-Agent Pipeline',
    description: 'A data processing pipeline with multiple agents in series.',
    category: 'agent-systems',
    tags: ['agents', 'pipeline', 'data'],
    content: `---
title: Multi-Agent Pipeline
version: 1.0
description: Data processing pipeline using multiple agents
---

# Multi-Agent Pipeline

A multi-agent system where data flows through a series of processing agents, each performing a specific transformation.

## agent: ingester

\`\`\`python
def run():
    """Ingest raw data from source"""
    return {
        "status": "ingested",
        "records": 1000,
        "source": "input_stream"
    }
\`\`\`

## agent: validator

\`\`\`python
def on_receive(msg):
    """Validate ingested data"""
    valid = msg.get("records", 0) > 0
    return {
        "status": "validated" if valid else "rejected",
        "records": msg.get("records", 0),
        "valid": valid
    }
\`\`\`

## agent: transformer

\`\`\`python
def on_receive(msg):
    """Transform validated data"""
    return {
        "status": "transformed",
        "records": msg.get("records", 0),
        "schema": "v2",
        "columns": ["id", "name", "value"]
    }
\`\`\`

## agent: aggregator

\`\`\`python
def on_receive(msg):
    """Aggregate and summarize results"""
    return {
        "status": "aggregated",
        "total_records": msg.get("records", 0),
        "summary": "Pipeline complete"
    }
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    // SPAWN agents
    // TELL ingester -> run
    // TELL validator <- ingester result
    // TELL transformer <- validator result
    // TELL aggregator <- transformer result
    return 0;
}
\`\`\`
`,
  },
  {
    id: 'a2a-handshake',
    name: 'A2A Handshake Protocol',
    description: 'Secure agent-to-agent handshake with capability exchange and trust verification.',
    category: 'agent-systems',
    tags: ['a2a', 'security', 'handshake'],
    content: `---
title: A2A Handshake Protocol
version: 1.0
description: Secure agent-to-agent handshake with trust verification
---

# A2A Handshake Protocol

Implements a secure handshake between agents with capability exchange, trust checks, and session establishment.

## agent: initiator

\`\`\`python
def run():
    """Initiate handshake with target agent"""
    return {
        "type": "HELLO",
        "agent_id": "initiator-001",
        "capabilities": ["read", "write", "compute"],
        "nonce": 42
    }
\`\`\`

## agent: responder

\`\`\`python
def on_receive(msg):
    """Respond to handshake initiation"""
    if msg.get("type") == "HELLO":
        # TRUST_CHECK on initiator
        # CAP_GRANT for requested capabilities
        return {
            "type": "ACK",
            "agent_id": "responder-002",
            "capabilities": ["read", "query"],
            "nonce": msg.get("nonce", 0) + 1
        }
    return {"type": "ERROR", "reason": "unexpected message"}
\`\`\`

## agent: trust_validator

\`\`\`python
def on_receive(msg):
    """Validate trust level of agent"""
    agent_id = msg.get("agent_id", "")
    # Check trust database
    # Verify capability permissions
    trust_level = 3  # 0-5 scale
    return {
        "agent_id": agent_id,
        "trust_level": trust_level,
        "allowed": trust_level >= 2
    }
\`\`\`

## fn: handshake_init(target: ptr) -> i32

\`\`\`c
int handshake_init(void* target) {
    // 1. SPAWN initiator agent
    // 2. TELL initiator -> send HELLO
    // 3. ASK trust_validator -> check target
    // 4. CAP_GRANT based on trust level
    // 5. Establish session
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int result = handshake_init("responder-002");
    return result;
}
\`\`\`
`,
  },
  {
    id: 'trust-delegation',
    name: 'Trust & Delegation Network',
    description: 'Agent trust network with delegation chains and capability propagation.',
    category: 'agent-systems',
    tags: ['trust', 'delegation', 'capabilities'],
    content: `---
title: Trust & Delegation Network
version: 1.0
description: Agent trust network with delegation chains
---

# Trust & Delegation Network

A trust management system where agents can delegate tasks and propagate capabilities through a trust network.

## agent: root_authority

\`\`\`python
def on_receive(msg):
    """Root trust authority - issues base capabilities"""
    request = msg.get("request", "")
    if request == "grant":
        return {
            "capability": msg.get("capability"),
            "trust_chain": ["root"],
            "depth": 0,
            "expires": "1h"
        }
    return {"error": "unknown request"}
\`\`\`

## agent: team_lead

\`\`\`python
def run():
    """Team lead - receives delegated authority from root"""
    return {
        "role": "team_lead",
        "subordinates": ["worker_1", "worker_2"],
        "max_delegation_depth": 2
    }

def on_receive(msg):
    """Delegate tasks to workers"""
    if msg.get("type") == "task":
        # DELEGATE to worker
        return {"status": "delegated", "worker": "worker_1"}
    return {"status": "unknown"}
\`\`\`

## agent: worker

\`\`\`python
def on_receive(msg):
    """Worker agent - executes delegated tasks"""
    # Verify trust chain
    # Execute within granted capabilities
    return {
        "status": "completed",
        "result": 42
    }
\`\`\`

## fn: delegate_task(from_agent: ptr, to_agent: ptr, task: ptr) -> i32

\`\`\`c
int delegate_task(void* from_agent, void* to_agent, void* task) {
    // 1. TRUST_CHECK on from_agent
    // 2. Verify delegation depth
    // 3. DELEGATE task to to_agent
    // 4. CAP_GRANT restricted capabilities
    // 5. BARRIER on completion
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    delegate_task("root_authority", "team_lead", "manage_team");
    delegate_task("team_lead", "worker", "process_data");
    return 0;
}
\`\`\`
`,
  },
  {
    id: 'barrier-sync',
    name: 'Barrier Synchronization',
    description: 'Parallel agent synchronization using barriers for coordinated execution.',
    category: 'agent-systems',
    tags: ['sync', 'barrier', 'parallel'],
    content: `---
title: Barrier Synchronization
version: 1.0
description: Parallel agent synchronization using barrier primitives
---

# Barrier Synchronization

A parallel computation system where multiple agents work on data partitions and synchronize at barriers.

## agent: partition_worker_0

\`\`\`python
def run():
    """Process partition 0"""
    return {
        "partition": 0,
        "processed": 250,
        "status": "ready"
    }
\`\`\`

## agent: partition_worker_1

\`\`\`python
def run():
    """Process partition 1"""
    return {
        "partition": 1,
        "processed": 250,
        "status": "ready"
    }
\`\`\`

## agent: partition_worker_2

\`\`\`python
def run():
    """Process partition 2"""
    return {
        "partition": 2,
        "processed": 250,
        "status": "ready"
    }
\`\`\`

## agent: partition_worker_3

\`\`\`python
def run():
    """Process partition 3"""
    return {
        "partition": 3,
        "processed": 250,
        "status": "ready"
    }
\`\`\`

## agent: reducer

\`\`\`python
def on_receive(results):
    """Reduce all partition results"""
    total = sum(r.get("processed", 0) for r in results)
    return {
        "total_processed": total,
        "partitions": 4,
        "status": "complete"
    }
\`\`\`

## fn: parallel_process(data: ptr, partitions: i32) -> i32

\`\`\`c
int parallel_process(void* data, int partitions) {
    // 1. SPAWN partition workers
    // 2. DELEGATE data chunks
    // 3. BARRIER - wait for all workers
    // 4. REDUCE results
    // 5. Return combined result
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int result = parallel_process(0, 4);
    return result;
}
\`\`\`
`,
  },
  {
    id: 'broadcast-reduce',
    name: 'Broadcast/Reduce Pattern',
    description: 'Distributed computation using broadcast dispatch and result reduction.',
    category: 'agent-systems',
    tags: ['broadcast', 'reduce', 'distributed'],
    content: `---
title: Broadcast Reduce Pattern
version: 1.0
description: Distributed computation with broadcast and reduce
---

# Broadcast Reduce Pattern

A map-reduce style pattern where work is broadcast to agents and results are aggregated.

## agent: coordinator

\`\`\`python
def run():
    """Coordinate the broadcast/reduce cycle"""
    return {
        "phase": "broadcast",
        "payload": {"query": "count_items", "params": {}}
    }

def on_receive(result):
    """Collect results from workers"""
    return {"status": "collected", "from": "worker"}
\`\`\`

## agent: map_worker_alpha

\`\`\`python
def on_receive(msg):
    """Map phase: process subset of data"""
    if msg.get("phase") == "broadcast":
        return {
            "worker": "alpha",
            "result": 128,
            "items_processed": 50
        }
    return {}
\`\`\`

## agent: map_worker_beta

\`\`\`python
def on_receive(msg):
    """Map phase: process subset of data"""
    if msg.get("phase") == "broadcast":
        return {
            "worker": "beta",
            "result": 96,
            "items_processed": 50
        }
    return {}
\`\`\`

## agent: map_worker_gamma

\`\`\`python
def on_receive(msg):
    """Map phase: process subset of data"""
    if msg.get("phase") == "broadcast":
        return {
            "worker": "gamma",
            "result": 226,
            "items_processed": 50
        }
    return {}
\`\`\`

## fn: broadcast_reduce(query: ptr, workers: i32) -> i32

\`\`\`c
int broadcast_reduce(void* query, int workers) {
    // 1. BROADCAST query to all workers
    // 2. Each worker processes its partition
    // 3. BARRIER - wait for all results
    // 4. REDUCE - combine results
    // 5. Return final result
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int result = broadcast_reduce("count_items", 3);
    return result;
}
\`\`\`
`,
  },

  // ======== NOVEL TOOLS ========
  {
    id: 'agent-orchestra',
    name: 'Agent Orchestra',
    description: 'A multi-agent conductor that orchestrates complex workflows with timing and cues.',
    category: 'novel-tools',
    tags: ['orchestration', 'workflow', 'conductor'],
    content: `---
title: Agent Orchestra
version: 1.0
description: Multi-agent conductor for complex workflow orchestration
---

# Agent Orchestra

A conductor agent that orchestrates multiple "musician" agents in a coordinated workflow, with timing, cues, and dynamic reconfiguration.

## agent: conductor

\`\`\`python
def run():
    """The conductor orchestrates the workflow symphony"""
    return {
        "phase": "overture",
        "tempo": "moderato",
        "score": [
            {"cue": 1, "agent": "researcher", "action": "discover"},
            {"cue": 2, "agent": "analyst", "action": "evaluate"},
            {"cue": 3, "agent": "writer", "action": "compose"},
            {"cue": 4, "agent": "reviewer", "action": "critique"},
        ]
    }

def on_receive(status):
    """Handle agent status updates"""
    return {"acknowledged": True, "next_cue": "auto"}
\`\`\`

## agent: researcher

\`\`\`python
def on_receive(cue):
    """Discover and gather information"""
    if cue.get("action") == "discover":
        return {
            "agent": "researcher",
            "findings": ["topic_a", "topic_b", "topic_c"],
            "sources": 15
        }
    return {}
\`\`\`

## agent: analyst

\`\`\`python
def on_receive(cue):
    """Analyze and evaluate research findings"""
    if cue.get("action") == "evaluate":
        return {
            "agent": "analyst",
            "recommendations": ["topic_a", "topic_c"],
            "confidence": 0.85
        }
    return {}
\`\`\`

## agent: writer

\`\`\`python
def on_receive(cue):
    """Compose output based on analysis"""
    if cue.get("action") == "compose":
        return {
            "agent": "writer",
            "draft": "composed_document",
            "word_count": 2500
        }
    return {}
\`\`\`

## agent: reviewer

\`\`\`python
def on_receive(cue):
    """Review and provide feedback"""
    if cue.get("action") == "critique":
        return {
            "agent": "reviewer",
            "verdict": "approved",
            "suggestions": 3
        }
    return {}
\`\`\`

## fn: orchestrate(score: ptr) -> i32

\`\`\`c
int orchestrate(void* score) {
    // 1. SPAWN conductor
    // 2. SPAWN musician agents
    // 3. TELL conductor -> begin score
    // 4. Loop: conductor cues each agent
    // 5. BARRIER between phases
    // 6. Return final result
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int result = orchestrate(0);
    return result;
}
\`\`\`
`,
  },
  {
    id: 'memory-sandbox',
    name: 'Memory Region Sandbox',
    description: 'Isolated memory regions with capability-based access control.',
    category: 'novel-tools',
    tags: ['memory', 'security', 'sandbox'],
    content: `---
title: Memory Region Sandbox
version: 1.0
description: Isolated memory regions with capability-based access control
---

# Memory Region Sandbox

A memory management system with isolated regions, capability checks, and safe cross-region data transfer.

## region: secure_data

## region: temp_workspace

## region: shared_buffer

## fn: region_create(name: ptr, size: i32) -> i32

\`\`\`c
int region_create(void* name, int size) {
    // Allocate memory region with bounds
    // Set default capabilities: owner=read,write
    // Initialize guard pages
    int region_id = 0;
    return region_id;
}
\`\`\`

## fn: region_write(region: i32, offset: i32, data: ptr, len: i32) -> i32

\`\`\`c
int region_write(int region, int offset, void* data, int len) {
    // CAP_GRANT check: does caller have write access?
    // Bounds check: offset + len <= region size
    // Copy data to region
    // Set dirty flag
    return len;
}
\`\`\`

## fn: region_read(region: i32, offset: i32, len: i32) -> i32

\`\`\`c
int region_read(int region, int offset, int len) {
    // CAP_GRANT check: does caller have read access?
    // Bounds check
    // Return bytes read
    return len;
}
\`\`\`

## fn: region_transfer(src: i32, dst: i32, offset: i32, len: i32) -> i32

\`\`\`c
int region_transfer(int src, int dst, int offset, int len) {
    // Cross-region copy with capability check
    // Both regions must grant transfer permission
    // Atomic operation
    return len;
}
\`\`\`

## fn: region_destroy(region: i32) -> i32

\`\`\`c
int region_destroy(int region) {
    // Zero-fill region (security)
    // Release memory pages
    // Revoke all capabilities
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int r1 = region_create("secure", 4096);
    int r2 = region_create("temp", 2048);
    region_write(r1, 0, "secret data", 11);
    region_transfer(r1, r2, 0, 11);
    region_destroy(r2);
    return 0;
}
\`\`\`
`,
  },
  {
    id: 'tile-compositor',
    name: 'Tile Compositor',
    description: 'A tile-based composition system for building complex programs from reusable tiles.',
    category: 'novel-tools',
    tags: ['tiles', 'composition', 'modules'],
    content: `---
title: Tile Compositor
version: 1.0
description: Tile-based program composition system
---

# Tile Compositor

A system for composing complex programs from reusable "tiles" — self-contained units of functionality that can be wired together.

## tile: input_reader

\`\`\`flux
#!tile reads input from various sources
tile input_reader {
    source: "stdin|file|network"
    format: "text|binary|json"
}
\`\`\`

\`\`\`python
def run():
    return {"data": "input_stream", "bytes_read": 1024}
\`\`\`

## tile: processor

\`\`\`flux
#!tile transforms data
tile processor {
    pipeline: "filter -> map -> reduce"
    parallelism: 4
}
\`\`\`

\`\`\`python
def on_receive(data):
    # Apply transformation pipeline
    return {"processed": True, "items": 50}
\`\`\`

## tile: output_writer

\`\`\`flux
#!tile writes output to targets
tile output_writer {
    target: "stdout|file|network"
    format: "text|json|binary"
}
\`\`\`

\`\`\`python
def on_receive(data):
    return {"written": True, "bytes": 512}
\`\`\`

## tile: error_handler

\`\`\`flux
#!tile handles errors in the pipeline
tile error_handler {
    strategy: "retry|fallback|log|abort"
    max_retries: 3
}
\`\`\`

\`\`\`python
def on_receive(error):
    return {"handled": True, "retry": True}
\`\`\`

## fn: compose_pipeline(tiles: ptr, count: i32) -> i32

\`\`\`c
int compose_pipeline(void* tiles, int count) {
    // Wire tiles together in sequence
    // input_reader -> processor -> output_writer
    // error_handler attached to each
    // Verify interface compatibility
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int pipeline = compose_pipeline(0, 4);
    return pipeline;
}
\`\`\`
`,
  },
  {
    id: 'capability-security',
    name: 'Capability Security Manager',
    description: 'Fine-grained capability-based security system for agent operations.',
    category: 'novel-tools',
    tags: ['security', 'capabilities', 'access-control'],
    content: `---
title: Capability Security Manager
version: 1.0
description: Capability-based access control for agent operations
---

# Capability Security Manager

A fine-grained security system using capability tokens to control what agents can access and do.

## agent: security_manager

\`\`\`python
def on_receive(request):
    """Process security requests"""
    req_type = request.get("type", "")
    
    if req_type == "check":
        # TRUST_CHECK on requesting agent
        agent = request.get("agent", "")
        capability = request.get("capability", "")
        allowed = check_capability(agent, capability)
        return {"allowed": allowed, "capability": capability}
    
    elif req_type == "grant":
        # CAP_GRANT - issue capability token
        agent = request.get("agent", "")
        caps = request.get("capabilities", [])
        token = issue_token(agent, caps)
        return {"token": token, "expires": "1h"}
    
    elif req_type == "revoke":
        # Revoke capability
        return {"revoked": True}

def check_capability(agent, capability):
    """Verify agent has required capability"""
    return True  # simplified

def issue_token(agent, capabilities):
    """Issue a signed capability token"""
    return f"token_{agent}_{len(capabilities)}"
\`\`\`

## agent: resource_guard

\`\`\`python
def on_receive(request):
    """Guard access to protected resources"""
    token = request.get("token", "")
    resource = request.get("resource", "")
    # Validate token with security_manager
    # Check resource-level permissions
    return {"access": "granted", "resource": resource}
\`\`\`

## fn: cap_check(agent: ptr, resource: ptr, operation: i32) -> i32

\`\`\`c
int cap_check(void* agent, void* resource, int operation) {
    // 1. ASK security_manager -> check capability
    // 2. Verify token signature
    // 3. Check operation permissions (READ=0, WRITE=1, EXEC=2)
    // 4. Return: 0=denied, 1=granted
    return 1;
}
\`\`\`

## fn: cap_grant(agent: ptr, resource: ptr, perms: i32) -> i32

\`\`\`c
int cap_grant(void* agent, void* resource, int perms) {
    // Issue capability token
    // perms bitmask: bit0=READ, bit1=WRITE, bit2=EXEC
    // Store in trust database
    // Return token ID
    int token_id = 0;
    return token_id;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int token = cap_grant("worker", "database", 3); // READ|WRITE
    int access = cap_check("worker", "database", 1); // WRITE
    return access;
}
\`\`\`
`,
  },
  {
    id: 'hotswap-ab-tester',
    name: 'Hot-Swap A/B Tester',
    description: 'Runtime A/B testing with hot-swappable implementations and metric collection.',
    category: 'novel-tools',
    tags: ['testing', 'ab-test', 'hotswap'],
    content: `---
title: Hot-Swap A/B Tester
version: 1.0
description: Runtime A/B testing with hot-swappable implementations
---

# Hot-Swap A/B Tester

A runtime experimentation framework that allows hot-swapping between implementations and collecting comparative metrics.

## agent: traffic_splitter

\`\`\`python
def run():
    """Split traffic between variants"""
    return {
        "strategy": "weighted_random",
        "variant_a_weight": 50,
        "variant_b_weight": 50,
        "total_requests": 10000
    }

def on_receive(request):
    """Route request to appropriate variant"""
    import random
    variant = "a" if random.random() < 0.5 else "b"
    return {"routed_to": variant, "request_id": request.get("id")}
\`\`\`

## agent: variant_a

\`\`\`python
def on_receive(request):
    """Implementation variant A"""
    return {
        "variant": "a",
        "latency_ms": 45,
        "success": True,
        "result": "processed_by_a"
    }
\`\`\`

## agent: variant_b

\`\`\`python
def on_receive(request):
    """Implementation variant B"""
    return {
        "variant": "b",
        "latency_ms": 32,
        "success": True,
        "result": "processed_by_b"
    }
\`\`\`

## agent: metrics_collector

\`\`\`python
def on_receive(result):
    """Collect and aggregate metrics"""
    return {
        "recorded": True,
        "variant": result.get("variant"),
        "latency": result.get("latency_ms"),
        "success": result.get("success")
    }
\`\`\`

## fn: ab_test_start(variant_a: ptr, variant_b: ptr, traffic_pct: i32) -> i32

\`\`\`c
int ab_test_start(void* variant_a, void* variant_b, int traffic_pct) {
    // 1. SPAWN traffic_splitter
    // 2. SPAWN variant_a and variant_b agents
    // 3. SPAWN metrics_collector
    // 4. BARRIER on initialization
    // 5. Begin routing traffic
    return 0;
}
\`\`\`

## fn: ab_test_swap(new_variant: ptr) -> i32

\`\`\`c
int ab_test_swap(void* new_variant) {
    // Hot-swap variant B with new implementation
    // EMERGENCY_STOP on old variant
    // SPAWN new variant
    // Resume traffic
    return 0;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int test = ab_test_start("impl_v1", "impl_v2", 50);
    return test;
}
\`\`\`
`,
  },
];

export const templateCategories: { id: TemplateCategory; name: string; icon: string }[] = [
  { id: 'getting-started', name: 'Getting Started', icon: '🎓' },
  { id: 'software-recreation', name: 'Software Recreation', icon: '🔧' },
  { id: 'agent-systems', name: 'Agent Systems', icon: '🤖' },
  { id: 'novel-tools', name: 'Novel Tools', icon: '✨' },
];

export function getTemplatesByCategory(category: TemplateCategory): FluxTemplate[] {
  return fluxTemplates.filter(t => t.category === category);
}

export function searchTemplates(query: string): FluxTemplate[] {
  const lower = query.toLowerCase();
  return fluxTemplates.filter(t =>
    t.name.toLowerCase().includes(lower) ||
    t.description.toLowerCase().includes(lower) ||
    t.tags.some(tag => tag.toLowerCase().includes(lower))
  );
}
