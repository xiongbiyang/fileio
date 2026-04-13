# 安全待办事项

> 以下问题在当前阶段风险可控，计划在对应功能上线前修复。

## 开启 OAuth / 注册登录时必须修复

### 1. OAuth 缺少 PKCE 流程
- **文件**: `server/utils/oauth.ts`
- **风险**: 攻击者可在公共网络拦截授权码完成登录
- **修复方案**: 实现完整 PKCE 流程（code_challenge / code_verifier）
- **前提**: `NUXT_PUBLIC_OAUTH_ENABLED=true` 时生效

### 2. Signup 409 导致账号枚举
- **文件**: `server/api/auth/signup.post.ts` (line 30)
- **风险**: 攻击者可慢速探测已注册邮箱（已有速率限制，风险已降低）
- **修复方案**: 注册时无论邮箱是否存在都返回统一响应，通过邮件验证流程确认

### 3. 密码缺少复杂度要求
- **文件**: `server/utils/auth.ts`
- **当前**: 仅要求 8 字符最低长度
- **建议**: 上线注册功能时考虑增加大小写 + 数字要求

## 可在后续迭代中改进

### 4. 剪贴板消息明文存储 D1
- **文件**: `server/api/clipboard/rooms/[roomId]/messages.put.ts`
- **风险**: D1 被攻破时泄露用户消息（消息 24h 过期，降低影响）
- **修复方案**: 在服务端存储前用 per-room key 加密，或强制客户端 E2EE 后再上传

### 5. 无 CSRF Token
- **当前缓解**: SameSite=Lax cookie 已防护大部分场景
- **修复方案**: 添加 double-submit cookie 或 Nitro 中间件级 CSRF 验证

### 6. localStorage 存储敏感数据未加密
- **文件**: `composables/useAuthState.ts`
- **风险**: XSS 攻击可读取 auth 状态和房间历史
- **修复方案**: 改用 sessionStorage 或用 transient key 加密

### 7. 缺少 HSTS Header
- **文件**: `public/_headers`
- **风险**: Cloudflare 默认强制 HTTPS，实际风险极低
- **修复**: 添加 `Strict-Transport-Security: max-age=31536000; includeSubDomains`
