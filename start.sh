#!/usr/bin/env bash
set -e

# Navigate to project root
cd "$(dirname "$0")"

echo -e "\033[1;36m=================================================\033[0m"
echo -e "\033[1;32m Starting shrt (Full-Stack URL Shortener & Analytics)\033[0m"
echo -e "\033[1;36m=================================================\033[0m"
echo ""
echo -e "  \033[1;34mFrontend UI:\033[0m  \033[4;34mhttp://localhost:5173\033[0m"
echo -e "  \033[1;35mBackend API:\033[0m  \033[4;35mhttp://localhost:4000\033[0m"
echo ""
echo -e "\033[90mPress Ctrl+C to stop both servers.\033[0m"
echo -e "\033[1;36m=================================================\033[0m"
echo ""

# Run both servers concurrently
exec npx concurrently -k -n "server,client" -c "green,cyan" "npm run dev -w server" "npm run dev -w client"
