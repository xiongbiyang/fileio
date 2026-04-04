# ToolPort 部署流程（Cloudflare Pages + PartyKit）

这份文档是当前项目的单一部署入口，按顺序执行即可。

## 1. 部署前检查

```bash
npm ci
npm run lint
npm run test -- --run
npm run build
```

构建成功后应生成 `dist/`，且可看到提示：
- `npx wrangler pages dev dist`
- `npx wrangler pages deploy dist`

## 2. Cloudflare Pages 项目

`wrangler.toml` 关键配置：
- `pages_build_output_dir = "dist"`
- `compatibility_flags = ["nodejs_compat"]`

推荐方式：
1. GitHub 连接 Cloudflare Pages（自动部署）
2. Build command: `npm run build`
3. Output directory: `dist`

也可手动 CLI 部署：
```bash
npx wrangler pages deploy dist
```

## 3. 环境变量（Pages）

至少配置（生产环境）：

```bash
NUXT_PUBLIC_PARTYKIT_HOST=your-app.your-name.partykit.dev
NUXT_AUTH_SESSION_SECRET=replace-with-long-random-secret
NUXT_PUBLIC_OAUTH_ENABLED=false
```

可选（按功能开启）：

```bash
# TURN（跨网传输稳定性）
NUXT_CLOUDFLARE_TURN_KEY_ID=
NUXT_CLOUDFLARE_TURN_API_TOKEN=

# OAuth
NUXT_PUBLIC_OAUTH_ENABLED=true
NUXT_OAUTH_GOOGLE_CLIENT_ID=
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=
NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
```

说明：
- 如果不开 OAuth，保持 `NUXT_PUBLIC_OAUTH_ENABLED=false`。
- `NUXT_AUTH_SESSION_SECRET` 建议始终配置，避免后续启用登录时出错。

## 4. PartyKit 部署（文本传输/实时能力）

项目包含 PartyKit（`partykit.json`）：
- `party/clipboard.ts`
- `party/signal.ts`

部署：
```bash
npm run party:deploy
```

部署后把生成的 PartyKit 域名填回 Pages 环境变量：
- `NUXT_PUBLIC_PARTYKIT_HOST`

## 5. D1 数据库（可选但强烈建议）

当前与 D1 相关：
- 迁移文件：`db/migrations/0001_clipboard.sql`、`0002_auth.sql`、`0003_waitlist.sql`
- 接口在未配置 D1 时会降级返回 `*_NOT_CONFIGURED`，但登录/云剪贴板/候补名单将不可用。

示例步骤：
1. 创建 D1 数据库（Cloudflare 控制台或 CLI）
2. 在 `wrangler.toml` 中启用 `[[d1_databases]]` 绑定 `DB`
3. 依次执行迁移：

```bash
npx wrangler d1 migrations apply <YOUR_DB_NAME> --remote
```

## 6. OAuth 回调地址（仅开启 OAuth 时）

必须与平台配置完全一致：
- `https://YOUR_DOMAIN/api/auth/callback/google`
- `https://YOUR_DOMAIN/api/auth/callback/github`

详细见：`docs/oauth-setup.md`

## 7. 上线后验收清单

1. 站点可访问：`/`、`/tools/qr-code`、`/tools/text-transfer`、`/tools/clipboard`
2. SEO 文件可访问：`/robots.txt`、`/sitemap_index.xml`
3. 博客页检查：canonical 与当前语言路径一致
4. 若启用 OAuth：`/auth/signin` 可正常跳转第三方并回调
5. 若启用 D1：注册/登录、云剪贴板房间、waitlist 提交正常
6. 若启用 PartyKit：跨设备连接与传输正常

## 8. 常见故障

- 症状：跨设备无法建立实时连接  
  检查：`NUXT_PUBLIC_PARTYKIT_HOST` 是否是线上可访问域名。

- 症状：登录报错或 503  
  检查：`NUXT_AUTH_SESSION_SECRET` 是否已配置。

- 症状：登录/云剪贴板返回 `*_NOT_CONFIGURED`  
  检查：D1 `DB` 绑定与迁移是否完成。

- 症状：OAuth 按钮可点但回调失败  
  检查：回调 URL 与 OAuth 平台配置是否逐字符一致。
