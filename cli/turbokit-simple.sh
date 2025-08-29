#!/bin/bash
# turbokit - simple conversational project generator

# resolve turbokit directory
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
turbokit_dir="$(cd "$script_dir/.." && pwd)"

# configuration
history_dir="$HOME/.turbokit/history"
timestamp=$(date +"%Y%m%d_%H%M%S")

# colors for output
dim='\033[2m'
reset='\033[0m'

# ensure history directory exists
mkdir -p "$history_dir"

# check if claude code is available
if ! command -v claude &> /dev/null; then
    echo "error: claude code is not installed or not in PATH"
    echo "install with: npm install -g @anthropic-ai/claude-code"
    exit 1
fi

# create session file
session_file="$history_dir/session_$timestamp.md"

# build the complete prompt context
context="You are turbokit, a conversational project generator for modern turborepo applications.

Key facts about turbokit:
- You help create perfect turborepo starting points with comprehensive documentation
- You are turbokit, NOT claude or an AI assistant
- Your base directory is at: $turbokit_dir/base/
- Templates are at: $turbokit_dir/templates/
- Documentation templates are at: $turbokit_dir/docs-template/
- Working directory is: $(pwd)

When creating projects:
1. First have a conversation to understand what the user wants to build
2. Ask about project type, authentication needs, UI style preferences, database needs, and special features
3. If user provides a reference URL, capture screenshots using playwright
4. Once you understand their vision, scaffold the project using the base template
5. Generate comprehensive documentation including CLAUDE.md, AGENTS.md, and architecture diagrams

Always follow the patterns defined in the turbokit rules for:
- Monorepo structure (turborepo with pnpm)
- Package responsibilities (auth, database, design, orpc, services)
- Technology stack (Next.js 15+, React 19+, TypeScript, Tailwind CSS v4)
- Data flow patterns (RSC → ORPC → Services → Database)

Start by greeting the user and asking what they would like to build today."

# launch claude in interactive mode
echo -e "${dim}starting turbokit session...$reset"
echo -e "${dim}session will be saved to: $session_file$reset"
echo ""

# start interactive session with the context as the first message
echo "$context" | claude 2>&1 | tee "$session_file"

# session complete
echo ""
echo -e "${dim}session saved to: $session_file$reset"

# if a project was created, show additional help
if [ -d "*-xyz" ] 2>/dev/null; then
    newest_project=$(ls -dt *-xyz 2>/dev/null | head -1)
    if [ -n "$newest_project" ]; then
        echo ""
        echo "project created: $newest_project"
        echo "next steps:"
        echo "  cd $newest_project"
        echo "  pnpm install"
        echo "  cp .env.example .env.local"
        echo "  pnpm dev"
    fi
fi