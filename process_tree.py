def process_tree(lines):
    commands = []
    current_path = []
    
    for line in lines:
        # Skip empty lines
        if not line.strip():
            continue
            
        # Count the indentation level (number of spaces)
        indent = len(line) - len(line.lstrip())
        name = line.strip().rstrip('/')
        
        # Adjust the current path based on indentation
        current_path = current_path[:int(indent/2)]
        
        # Skip lines that are just tree structure symbols
        if name in ['├', '│', '└', '─'] or name.startswith('│'):
            continue
            
        if '└' in line or '├' in line:
            name = name[2:]  # Remove the tree symbols
            
        # Clean up the name by removing any remaining tree symbols
        name = name.replace('├', '').replace('└', '').replace('│', '').replace('─', '').strip()
        
        if name:
            current_path.append(name)
            
            # If it's a file (contains an extension like .ts, .tsx, .css)
            if any(ext in name for ext in ['.ts', '.tsx', '.css', '.tsx']):
                full_path = '/'.join(current_path)
                commands.append(f"/add {full_path}")
            
            # If it's a directory, don't create a command
            if not any(ext in name for ext in ['.ts', '.tsx', '.css', '.tsx']):
                continue
    
    return commands

# Your actual directory structure - copy and paste the entire tree here
tree_str = """app
├── api
│   ├── auth
│   │   ├── [...nextauth]
│   │   │   └── route.ts
│   │   └── register
│   │       └── route.ts
│   ├── cases
│   │   ├── [id]
│   │   │   ├── custody-actions
│   │   │   │   ├── [actionId]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── qa-responses
│   │   │   │   ├── [responseId]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   └── tasks
│   │   │       ├── [taskId]
│   │   │       │   └── route.ts
│   │   │       └── route.ts
│   │   └── route.ts
│   ├── debug
│   │   ├── fix-user
│   │   │   └── route.ts
│   │   └── session
│   │       └── route.ts
│   ├── evidence
│   │   ├── [id]
│   │   │   ├── custody
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── delete
│   │   │   └── route.ts
│   │   ├── files
│   │   │   └── [...path]
│   │   │       └── route.ts
│   │   ├── route.ts
│   │   ├── types
│   │   │   ├── route.ts
│   │   │   └── seed
│   │   │       └── route.ts
│   │   └── upload
│   │       └── route.ts
│   ├── lab
│   │   ├── equipment
│   │   │   ├── [id]
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── software
│   │       ├── delete
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── notes
│   │   ├── [id]
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── organizations
│   │   └── route.ts
│   └── settings
│       ├── custody-actions
│       │   ├── [id]
│       │   │   └── route.ts
│       │   └── route.ts
│       ├── qa-checklist
│       │   ├── [id]
│       │   │   └── route.ts
│       │   └── route.ts
│       └── task-templates
│           ├── [id]
│           │   └── route.ts
│           └── route.ts
├── case
│   └── [id]
│       ├── evidence
│       │   └── [evidenceId]
│       │       └── page.tsx
│       └── page.tsx
├── cases
│   └── page.tsx
├── globals.css
├── lab
│   └── page.tsx
├── layout.tsx
├── login
│   └── page.tsx
├── page.tsx
├── register
│   └── page.tsx
└── settings
    ├── custody-actions
    │   └── page.tsx
    ├── page.tsx
    ├── qa-checklist
    │   └── page.tsx
    └── task-templates
        └── page.tsx"""

# Process the tree
commands = process_tree(tree_str.split('\n'))

# Print the commands
for cmd in commands:
    print(cmd) 