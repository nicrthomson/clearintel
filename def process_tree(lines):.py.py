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
        
        if '└' in line or '├' in line:
            name = name[2:]  # Remove the tree symbols
            
        if name and not name.startswith('│') and not name.startswith('─'):
            current_path.append(name)
            
            # If it's a file (doesn't end with /)
            if not line.strip().endswith('/'):
                full_path = '/'.join(current_path)
                commands.append(f"/add {full_path}")
    
    return commands

# Your directory structure as a string (copy-paste the structure here)
tree_str = """app
├── api
│   ├── auth
...
"""  # Your full tree structure here

# Process the tree
commands = process_tree(tree_str.split('\n'))

# Print the commands
for cmd in commands:
    print(cmd)