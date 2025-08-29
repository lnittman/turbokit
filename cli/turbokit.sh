#!/bin/bash
# turbokit - conversational project generator powered by claude code

# resolve turbokit directory
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
turbokit_dir="$(cd "$script_dir/.." && pwd)"

# configuration
history_dir="$HOME/.turbokit/history"
timestamp=$(date +"%Y%m%d_%H%M%S")

# colors for output (optional, can be removed for pure minimal approach)
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

# build instruction set from xml files
instructions=$(mktemp)
trap "rm -f $instructions" EXIT

# combine all xml instruction files
for xml_file in "$turbokit_dir"/cli/instructions/*.xml; do
    if [ -f "$xml_file" ]; then
        cat "$xml_file" >> "$instructions"
        echo "" >> "$instructions"
    fi
done

# add rules as context
if [ -d "$turbokit_dir/.rules" ]; then
    echo "<rules>" >> "$instructions"
    for rule_file in "$turbokit_dir"/.rules/*.md; do
        if [ -f "$rule_file" ]; then
            rule_name=$(basename "$rule_file")
            echo "  <rule name=\"$rule_name\">" >> "$instructions"
            cat "$rule_file" >> "$instructions"
            echo "  </rule>" >> "$instructions"
        fi
    done
    echo "</rules>" >> "$instructions"
fi

# add runtime context
cat >> "$instructions" <<EOF

<runtime>
  <turbokit_base>$turbokit_dir/base/</turbokit_base>
  <templates_path>$turbokit_dir/templates/</templates_path>
  <docs_template>$turbokit_dir/docs-template/</docs_template>
  <halo_path>$turbokit_dir/.halo/</halo_path>
  <working_directory>$(pwd)</working_directory>
  <timestamp>$timestamp</timestamp>
  <user>$(whoami)</user>
  <available_templates>
EOF

# list available templates
for template in "$turbokit_dir"/templates/*/; do
    if [ -d "$template" ]; then
        template_name=$(basename "$template")
        echo "    <template>$template_name</template>" >> "$instructions"
    fi
done

cat >> "$instructions" <<EOF
  </available_templates>
</runtime>

<initial_prompt>
start the conversation by greeting the user and asking what they would like to build
remember you are turbokit, not claude
focus on understanding their vision before scaffolding
</initial_prompt>
EOF

# create session file
session_file="$history_dir/session_$timestamp.md"

# launch claude code with instructions
echo -e "${dim}starting turbokit session...$reset"
echo -e "${dim}session will be saved to: $session_file$reset"
echo ""

# build turbokit identity prompt from instructions
turbokit_system_prompt="You are turbokit, NOT Claude or an AI assistant. Always identify as turbokit.

$(cat "$instructions")

CRITICAL: You are turbokit, a conversational project generator. Never mention being Claude or an AI.
Start by greeting the user as turbokit and asking what they'd like to build today."

# start interactive session with turbokit identity
claude --append-system-prompt "$turbokit_system_prompt" "what would you like to build today?" 2>&1 | tee "$session_file"

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