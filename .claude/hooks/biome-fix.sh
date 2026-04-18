#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ]; then exit 0; fi

# appsディレクトリ配下のTS/TSXファイルのみ対象
case "$FILE_PATH" in
  */apps/*.ts|*/apps/*.tsx)
    pnpm --dir /home/takenokoman/projects/matry biome check --fix "$FILE_PATH" 2>/dev/null || true
    ;;
esac
