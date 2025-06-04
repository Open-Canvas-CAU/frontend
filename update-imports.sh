#!/bin/bash

# components 경로 업데이트
find src -type f -name "*.{js,jsx}" -exec sed -i '' \
  -e 's|from '\''../components/auth/|from '\''../components/features/auth/|g' \
  -e 's|from '\''../components/editor/|from '\''../components/features/editor/|g' \
  -e 's|from '\''../components/landing/|from '\''../components/features/landing/|g' \
  -e 's|from '\''./components/auth/|from '\''./components/features/auth/|g' \
  -e 's|from '\''./components/editor/|from '\''./components/features/editor/|g' \
  -e 's|from '\''./components/landing/|from '\''./components/features/landing/|g' {} +

# 스타일 파일 경로 업데이트
find src -type f -name "*.{js,jsx}" -exec sed -i '' \
  -e 's|from '\''./App.css'\''|from '\''./styles/base/App.css'\''|g' \
  -e 's|from '\''./index.css'\''|from '\''./styles/base/index.css'\''|g' {} + 