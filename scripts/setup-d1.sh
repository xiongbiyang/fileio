#!/bin/bash
# ToolPort D1 数据库一键设置脚本
# 使用方式: bash scripts/setup-d1.sh

set -e

DB_NAME="toolport-db"

echo "=== ToolPort D1 Setup ==="
echo ""

# Step 1: 创建数据库
echo "1/3 创建 D1 数据库..."
CREATE_OUTPUT=$(npx wrangler d1 create "$DB_NAME" 2>&1) || true
echo "$CREATE_OUTPUT"

# 提取 database_id
DB_ID=$(echo "$CREATE_OUTPUT" | grep -o 'database_id = "[^"]*"' | head -1 | cut -d'"' -f2)

if [ -z "$DB_ID" ]; then
  echo ""
  echo "⚠️  未检测到新建的 database_id。"
  echo "   如果数据库已存在，请手动查看："
  echo "   npx wrangler d1 list"
  echo ""
  echo "   然后将 database_id 填入 wrangler.toml 的 [[d1_databases]] 段。"
  echo ""
  read -p "请输入你的 database_id: " DB_ID
  if [ -z "$DB_ID" ]; then
    echo "❌ 未提供 database_id，退出。"
    exit 1
  fi
fi

# Step 2: 更新 wrangler.toml
echo ""
echo "2/3 更新 wrangler.toml..."

# 用 sed 替换注释的 D1 配置为实际配置
sed -i.bak "s|# \[\[d1_databases\]\]|[[d1_databases]]|" wrangler.toml
sed -i.bak "s|# binding = \"DB\"|binding = \"DB\"|" wrangler.toml
sed -i.bak "s|# database_name = \"toolport-db\"|database_name = \"$DB_NAME\"|" wrangler.toml
sed -i.bak "s|# database_id = \"paste-your-id-here\"|database_id = \"$DB_ID\"|" wrangler.toml
rm -f wrangler.toml.bak

echo "   ✅ wrangler.toml 已更新 (database_id: $DB_ID)"

# Step 3: 执行迁移
echo ""
echo "3/3 执行数据库迁移..."
npx wrangler d1 migrations apply "$DB_NAME" --remote

echo ""
echo "=== ✅ D1 设置完成! ==="
echo ""
echo "数据库: $DB_NAME"
echo "ID:     $DB_ID"
echo "表:     clipboard_rooms, clipboard_room_messages, auth_users,"
echo "        pro_waitlist_leads, tool_votes, contact_submissions"
echo ""
echo "下一步: 重新部署 Cloudflare Pages"
echo "  npm run build && npx wrangler pages deploy dist"
