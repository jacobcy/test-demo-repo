#!/bin/bash

# Script to process a SillyTavern JSONL chat file and launch the React viewer.

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Check if an input file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_jsonl_file>"
  exit 1
fi

INPUT_JSONL_FILE=$1
PYTHON_SCRIPT_PATH="$SCRIPT_DIR/extract_sillytavern_chat.py"
REACT_APP_DIR="$SCRIPT_DIR/chat-reader-react"
PROCESSED_JSON_OUTPUT_DIR="$REACT_APP_DIR/public"
PROCESSED_JSON_FILENAME="processed_chat.json"
PROCESSED_JSON_FULL_PATH="$PROCESSED_JSON_OUTPUT_DIR/$PROCESSED_JSON_FILENAME"

# Ensure the output directory for processed_chat.json exists
mkdir -p "$PROCESSED_JSON_OUTPUT_DIR"

# Step 1: Run the Python script to process the JSONL file
echo "Processing $INPUT_JSONL_FILE with $PYTHON_SCRIPT_PATH..."

if [ ! -f "$PYTHON_SCRIPT_PATH" ]; then
  echo "Error: Python script not found at $PYTHON_SCRIPT_PATH"
  ls -la "$SCRIPT_DIR"
  exit 1
fi

python3 "$PYTHON_SCRIPT_PATH" "$INPUT_JSONL_FILE" "$PROCESSED_JSON_FULL_PATH"

if [ $? -ne 0 ]; then
  echo "Error: Python script failed to process the file."
  exit 1
fi

echo "Successfully processed chat data to $PROCESSED_JSON_FULL_PATH"

# Step 2: Navigate to the React app directory
if [ ! -d "$REACT_APP_DIR" ]; then
  echo "Error: React app directory '$REACT_APP_DIR' not found."
  exit 1
fi
cd "$REACT_APP_DIR" || exit

# Step 3: Start the Vite development server
echo "Starting Vite development server... (Press Ctrl+C to stop)"

# 根据可用的包管理器启动服务
if [ -f "package-lock.json" ]; then
  # npm
  npm run dev
elif [ -f "pnpm-lock.yaml" ]; then
  # pnpm
  pnpm run dev
elif [ -f "yarn.lock" ]; then
  # yarn
  yarn dev
else
  # 尝试使用npm
  npm run dev
fi

# Script will terminate when server is stopped (Ctrl+C)
echo "Server stopped." 