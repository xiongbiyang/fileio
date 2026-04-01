# 在线工具平台开发文档 (V2.0 MVP)

## 一、项目概述

开发一个**可扩展的在线工具平台**，MVP 首批上线 3 个工具：**手机 ↔ PC 文本传输**、**二维码生成与解析**、**共享剪贴板**。平台采用插件式架构，支持后续持续新增工具模块。每个工具拥有独立落地页和独立 SEO，共享统一的 Shell 框架、UI 组件库和基础设施。支持 **8 种主流语言**，每种语言独立 SEO 收录。

**核心竞争力：**

| 亮点             | 说明                                                                   |
| :--------------- | :--------------------------------------------------------------------- |
| **隐私优先**     | 所有涉及用户数据的工具默认本地处理或 E2EE 加密，主打"零信任"。        |
| **极致体验**     | 每个工具极简、即用即走，无需安装和登录。                               |
| **零成本起步**   | 基于 Cloudflare Pages + PartyKit 免费版，MVP 验证期零服务器成本。     |
| **可扩展架构**   | 插件式工具设计，新增工具不影响已有功能，独立开发、独立部署。           |
| **多语言原生**   | 8 种语言覆盖全球主流市场，每种语言独立 SEO 收录。                     |

---

## 二、品牌与域名

| 项目       | 说明                                                                                  |
| :--------- | :------------------------------------------------------------------------------------ |
| **品牌名** | **ToolPort** — 体现"工具港口/入口"定位，可扩展性强。                                  |
| **域名**   | `toolport.dev`                                                                        |
| **Slogan** | 如："Simple tools, done right." / "轻量工具，即用即走"。                              |

---

## 三、技术栈选型

| 模块           | 技术选型                                | 说明                                                            |
| :------------- | :-------------------------------------- | :-------------------------------------------------------------- |
| **前端框架**   | Nuxt 3 (内置 Vue 3 + Nitro)             | 开箱即用的 SSR/SSG，路由自动生成，极佳的开发者体验。           |
| **国际化**     | @nuxtjs/i18n                            | 完美契合 Nuxt，支持自动路由前缀、hreflang 生成及 SEO 优化。    |
| **前端展示**   | Cloudflare Pages                        | 免费、极速全球 CDN 部署，原生支持 Nuxt Nitro 引擎。            |
| **后端 API**   | Cloudflare Workers                      | 免费额度充足，按工具可拆分为独立 Worker（可由 Nitro 接管）。   |
| **实时通信**   | WebRTC (主) + PartyKit WebSocket (信令) | 首选 P2P 直连（零服务器带宽），打洞失败以 WebSocket 密文中转兜底。|
| **NAT 穿透**   | 多 STUN 候选 + Cloudflare TURN (免费 1GB/月) | STUN 多候选（Google + 腾讯 + Cloudflare）保证全球可达，TURN 做中继兜底。 |
| **前端加密**   | Web Crypto API                          | 浏览器原生 AES-256-GCM，无需第三方库。                        |
| **二维码生成** | 轻量库（如 qrcode-generator）按需懒加载 | 文本传输和二维码工具按需加载，不影响其他工具首屏。             |
| **数据追踪**   | PostHog 或 Umami 分析                   | 支持自定义事件（跨端跳转、Pro 点击转化分析），补足漏斗盲点。     |
| **潜客数据库** | Cloudflare D1 (Serverless SQLite)       | 免费额度充足，专用于接收/存储“早鸟”用户的 Waitlist 订阅邮箱。   |
| **错误监控**   | Sentry 免费版                           | 线上异常捕获与告警。                                           |
| **SEO 预渲染** | Nuxt 原生 `npm run generate`            | 零配置将多语言落地页预渲染为静态 HTML，保证搜索引擎可爬取。    |
| **单元测试**   | Vitest                                  | 与 Nuxt 原生集成，速度快。                                     |
| **E2E 测试**   | Playwright                              | 跨浏览器自动化测试，支持移动端模拟。                           |
| **CI/CD**      | GitHub Actions → Cloudflare Pages       | Push 自动构建部署；PR 自动生成预览环境。                       |

### 3.1 Cloudflare 免费额度

| 服务                 | 免费额度                             | 超限预案                                     |
| :------------------- | :----------------------------------- | :------------------------------------------- |
| **Workers**          | 10 万请求/天，10ms CPU/请求          | 监控用量，接近上限时提示稍后再试。           |
| **KV / D1**          | 足够承载大量潜客邮箱或降级中转       | D1 做业务数据持久化，KV 仅作低频降级使用。 |
| **Pages**            | 无限静态请求，500 次构建/月          | 足够 MVP 使用；合并 PR 优化构建次数。        |
| **PartyKit**         | 免费版约 20-50 并发连接（需确认最新额度） | 配合连接优化策略（见下方），MVP 初期足够；超限时降级到 KV 短轮询。 |
| **Cloudflare TURN**  | 1GB 中继流量/月                      | 仅打洞失败时走 TURN，文本传输流量极小，MVP 足够。 |
| **Analytics Engine** | 25 万事件/天                         | 埋点事件做采样。                             |
| **Sentry 免费版**    | 5000 事件/月                         | 配置采样率，仅上报错误和关键事件。           |

**成本阶梯与升级路径：**

| 阶段 | 触发条件 | 基础设施 | 月成本 |
| :--- | :------- | :------- | :----- |
| **MVP 验证期** | 日活 UV < 200，并发连接 < 30 | Pages (免费) + PartyKit Free | **$0** |
| **增长期** | 并发连接峰值连续 3 天 > 40 | Pages + Workers Paid + Durable Objects | **$5** |
| **规模期** | 日活 UV > 5000 或订阅用户 > 100 | 同上，按量费用增长 | **$5 + 按量** |

> PartyKit 免费版的并发连接需要配合优化策略节省用量（工具 A 速断、工具 C 空闲踢），详见各工具文档。增长期建议直接用 Durable Objects 替换 PartyKit（底层相同，完全可控）。

**WebSocket 连接优化策略（节省 PartyKit 免费额度）：**

核心原则：**工具 A 是引流核心，体验优先级最高，不做激进的连接限制。省连接的压力全部由工具 C 承担。**

| 优化项 | 适用工具 | 措施 | 效果 |
| :----- | :------- | :--- | :--- |
| **连接配额预留** | 全局 | 50 个并发连接中，为工具 A 预留 20 个名额，工具 C 最多使用剩余 30 个 | 确保工具 A 永远有连接可用 |
| **工具 C 空闲踢** | 工具 C | 页面不可见（`visibilitychange`）5 分钟后主动断开，回来时 REJOIN 增量同步 | 大幅减少僵尸连接 |
| **工具 C 心跳收紧** | 工具 C | 心跳 15s 一次，2 次未响应即断 | 快速清理死连接 |
| **工具 A 延迟释放** | 工具 A | P2P 建立成功且**无活跃文件传输时，空闲 30s 后断开 WebSocket**（保留热备防抖动），之后仅走 P2P | 兼顾重连体验和连接额度节省 |
| **连接数监控** | 全局 | 服务端统计连接数，工具 C 配额满时拒绝新建剪贴板房间；工具 A 配额满时才触发 E010 | 工具 A 优先 |

### 3.2 浏览器兼容性

**最低支持范围：** Chrome 80+、Safari 15+（iOS 15+）、Firefox 78+、Edge 80+。

> iOS 14 的 WebRTC DataChannel 实现不完整且不稳定，Web Share API files 参数也不支持。将最低 iOS 版本定为 **15+** 可同时解决这两个问题，且 iOS 15 覆盖率已 > 95%。

**不兼容处理：** 页面加载时检测 `window.crypto.subtle` 等关键 API，不存在则展示多语言友好提示，阻止进入工具页面。

**中国大陆网络环境：** Google STUN 服务器在大陆被墙，ICE 配置中加入 `stun.qq.com` 等国内可达的 STUN 备选。即使所有 STUN/TURN 均不可用，仍有 WebSocket（PartyKit 经 Cloudflare CDN）做密文中转兜底，功能不受影响，仅延迟略高。

**各工具关键 API 兼容性风险与降级方案：**

| API | 风险平台 | 影响工具 | 降级方案 |
| :-- | :------- | :------- | :------- |
| **WebRTC DataChannel** | iOS Safari 14（不稳定） | A | 已通过提高最低版本到 iOS 15+ 规避；打洞失败时降级到 WebSocket 中转 |
| **`navigator.share({ files })`** | 桌面 Firefox/Safari（不支持 files 参数） | A | 桌面端降级到 `<a download>` + Blob URL；仅移动端展示"分享"按钮 |
| **`<a download>` + Blob URL** | iOS Safari（部分失效） | A | 移动端优先使用 Share API，图片额外提示"长按保存"。详见 7.3 节 |
| **`ClipboardItem`（复制图片）** | Firefox（默认禁用） | A, B | 运行时检测 `typeof ClipboardItem !== 'undefined'`，不支持时隐藏"复制图片"按钮，仅保留"下载"按钮 |
| **`navigator.vibrate()`** | iOS Safari（完全不支持） | A, B | 非核心功能，iOS 上静默跳过（`navigator.vibrate?.(100)`，可选链调用） |
| **`sessionStorage`** | iOS Safari 隐私浏览模式（容量受限） | C | E2EE 密钥写入时 try-catch，失败则回退到内存变量 + 提示"隐私模式下刷新页面将丢失加密密钥" |
| **`visibilitychange`** | iOS Safari（Home 键/切 App 时偶尔不触发） | C | 辅以 `pagehide` + `beforeunload` 事件兜底，确保空闲踢逻辑生效 |
| **Service Worker 缓存** | iOS Safari（系统几天不用后自动清理 SW） | B | 非核心功能，仅优化体验；离线缓存被清理后下次联网自动重建 |
| **`getUserMedia` 摄像头** | 所有平台（需 HTTPS + 用户手势触发） | B | 仅在用户点击"扫一扫"按钮时请求权限；被拒绝时展示 E105 + 引导上传图片 |

---

## 四、多语言 (i18n) 架构

### 4.1 支持语言

| 语言代码 | 本地名称   | 覆盖市场                 | 优先级 |
| :------- | :--------- | :----------------------- | :----- |
| `en`     | English    | 全球（x-default）        | P0 MVP |
| `zh-CN`  | 简体中文   | 中国大陆、新加坡         | P0 MVP |
| `zh-TW`  | 繁體中文   | 台湾、香港、澳门         | P0 MVP |
| `ja`     | 日本語     | 日本                     | P1     |
| `ko`     | 한국어     | 韩国                     | P1     |
| `es`     | Español    | 西班牙、拉丁美洲         | P2     |
| `fr`     | Français   | 法国、非洲法语区、加拿大 | P2     |
| `de`     | Deutsch    | 德国、奥地利、瑞士       | P2     |

> P0 在 MVP 完成；P1 上线后 1-2 周补充；P2 根据流量数据决定。

### 4.2 类型定义

```typescript
type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de';
type LocaleText = Record<Locale, string>;
const DEFAULT_LOCALE: Locale = 'en';  // 英文，根路径承载，x-default
```

### 4.3 技术方案

| 模块         | 方案                                                                                        |
| :----------- | :------------------------------------------------------------------------------------------ |
| **i18n 库**  | `@nuxtjs/i18n` (底层基于 vue-i18n)，自动配置 Nuxt 路由机制。                               |
| **语言检测** | 基于 Nuxt i18n：URL 路径前缀 > Cookie/localStorage 偏好 > `navigator.language` > 默认 `en`。|
| **切换方式** | 导航栏语言下拉菜单，切换后 URL 同步变更，偏好存入 Cookie，由 SSR 优先读取。                 |
| **繁简转换** | 繁体中文独立翻译，不使用自动简繁转换（确保用词符合台湾/港澳习惯）。                        |
| **Fallback** | `zh-TW → zh-CN → en`，`zh-CN → en`，`ja/ko/es/fr/de → en`。                                |
| **懒加载**   | `@nuxtjs/i18n` 自动懒加载 (Lazy-load translations)，按需拉取当前所需语言包。                |

---

## 五、平台架构设计

### 5.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    Platform Shell                     │
│  ┌───────────┬──────────┬───────────┬─────────────┐  │
│  │  顶部导航  │  工具目录  │  主题切换  │  语言切换   │  │
│  └───────────┴──────────┴───────────┴─────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Tool Container (插槽)               │  │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐         │  │
│  │   │ Tool A  │  │ Tool B  │  │ Tool C  │  ...    │  │
│  │   └─────────┘  └─────────┘  └─────────┘         │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Shared Services（共享层）            │  │
│  │  i18n │ 加密 │ WebSocket │ 主题 │ 埋点 │ 错误   │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 5.2 工具插件规范

```typescript
interface ToolDefinition {
  id: string;                          // 唯一标识，如 "text-transfer"
  name: LocaleText;                    // 多语言名称
  description: LocaleText;             // 多语言描述（SEO + 工具目录）
  icon: string;                        // 工具图标
  route: string;                       // 路由路径，如 "/tools/text-transfer"
  category: ToolCategory;              // 分类
  tags: Record<Locale, string[]>;      // 多语言搜索标签
  component: () => Promise<Component>; // 懒加载组件
  services?: ('websocket' | 'crypto' | 'clipboard' | 'qrcode' | 'file' | 'storage')[];
  relatedTools?: string[];             // 关联工具 ID，用于交叉推荐
}

type ToolCategory = 'transfer' | 'format' | 'convert' | 'encrypt' | 'generate' | 'other';
```

### 5.3 新增工具流程

1. **创建工具目录：** `src/tools/<tool-id>/` 下包含组件、逻辑。
2. **注册工具：** 在 `src/tools/registry.ts` 中添加 `ToolDefinition`。
3. **提供语言包 + SEO 数据：** 在 `src/i18n/locales/<locale>/` 下添加工具文案，在 `seo.ts` 中填写多语言 SEO。框架自动生成 Meta Tags、Sitemap 条目和落地页。

### 5.4 项目目录结构

```
src/
├── i18n/
│   ├── index.ts                       # vue-i18n 初始化 + 懒加载
│   ├── locales/
│   │   ├── en/                        # 英文语言包
│   │   │   ├── common.json            # 平台级通用文案
│   │   │   └── text-transfer.json     # 工具私有文案
│   │   ├── zh-CN/ ...                 # 简体中文
│   │   ├── zh-TW/ ...                 # 繁体中文
│   │   ├── ja/ ...                    # 日文
│   │   ├── ko/ ...                    # 韩文
│   │   ├── es/ ...                    # 西班牙文
│   │   ├── fr/ ...                    # 法文
│   │   └── de/ ...                    # 德文
│   └── utils.ts                       # 语言检测、fallback
├── tools/
│   ├── registry.ts                    # 工具注册表
│   ├── text-transfer/                 # 工具 A
│   │   ├── index.vue
│   │   ├── components/
│   │   ├── composables/
│   │   └── seo.ts                     # 多语言 SEO 数据
│   ├── qr-code-tools/                 # 工具 B（二维码生成与解析）
│   │   ├── index.vue
│   │   ├── components/
│   │   └── seo.ts
│   └── online-clipboard/             # 工具 C（共享剪贴板）
│       ├── index.vue
│       ├── components/
│       ├── composables/
│       └── seo.ts
├── shared/
│   ├── components/                    # 公共 UI 组件
│   ├── composables/                   # 公共逻辑（加密、WebSocket、主题、埋点）
│   ├── layouts/                       # Shell、导航、页脚
│   └── styles/                        # 全局样式、CSS 变量、暗色模式
├── pages/
│   ├── index.vue                      # 首页
│   ├── privacy.vue                    # 隐私政策
│   └── [...slug].vue                  # 动态路由捕获
└── App.vue
```

### 5.5 共享服务层

| 共享模块       | 说明                                               | 使用举例              |
| :------------- | :------------------------------------------------- | :-------------------- |
| **i18n**       | 语言切换、懒加载语言包、fallback 链                | 全局                  |
| **crypto**     | AES-256-GCM 加解密、HKDF 密钥派生                 | 文本传输、共享剪贴板(E2EE) |
| **webrtc/ws**  | WebRTC P2P 数据通道管理（首选），WebSocket 信令与降级 | 文本传输、共享剪贴板  |
| **clipboard**  | 一键复制（兼容 Clipboard API 和 fallback）         | 几乎所有工具          |
| **theme**      | 暗色/亮色切换、CSS 变量注入                        | 全局                  |
| **analytics**  | 匿名事件埋点上报                                   | 全局                  |
| **error**      | 错误捕获与上报（Sentry）                           | 全局                  |
| **qrcode**     | 二维码生成（懒加载）                               | 文本传输、二维码工具  |
| **storage**    | localStorage 封装（带隔离与 TTL 过期机制，如 7 天静默清理缓存防溢出） | 需要本地持久化的工具  |
| **file**       | 文件读取、下载、拖拽上传                           | 二维码工具、图片压缩  |

---

## 六、路由与页面设计

### 6.1 多语言路由策略

**根路径 `/` 直接承载英文版内容**（x-default），其他语言使用路径前缀：

```
/              → 英文首页（x-default，canonical）
/zh-CN/        → 简体中文
/zh-TW/        → 繁体中文
/ja/           → 日本語
/ko/           → 한국어
/es/           → Español
/fr/           → Français
/de/           → Deutsch

注意：不存在 /en/ 路径，英文版就是根路径。
```

> **为什么根路径承载英文？** 根域名天然拥有最高权重（外链最集中），直接承载内容能最大化 SEO 优势。英文作为 x-default 覆盖全球最大用户群体，DeepL、Canva、Vercel 等均采用此模式。

### 6.2 语言推荐提示

非英语用户访问 `/` 时，为了降低用户点击摩擦力，不使用突兀的顶部横幅干扰，而是在核心操作区（如 Start 按钮上下）直接提供醒目的一键切换入口：

```
┌────────────────────────────────────────────────────────────┐
│      [Start]        🚀 开启简体中文版                         │
└────────────────────────────────────────────────────────────┘
```

* 按钮文案自动识别浏览器 `Accept-Language` 显示对应语言。
* 只有首次无 Cookie 访问且为非英文用户时显示，点击后跳转对应路径，偏好存入 localStorage。
* 如 localStorage 已有非英文偏好，直接向对应前缀隐式跳转。

### 6.3 完整路由结构

```
# 英文（根路径）
/                                      → 英文首页
/privacy                               → 英文隐私政策
/tools/                                → 英文工具目录

# 工具 A：文本传输
/tools/text-transfer                   → 落地页
/tools/text-transfer/app               → 使用页（noindex）
/tools/text-transfer/r/:roomId         → 手机端房间页（noindex）

# 工具 B：二维码
/tools/qr-code                         → 落地页
/tools/qr-code/app                     → 使用页（noindex）

# 工具 C：共享剪贴板
/tools/clipboard                       → 落地页
/tools/clipboard/r/:roomId             → 房间页（noindex）

# SEO 别名路由（301 重定向到对应工具落地页）
/tools/phone-to-pc                     → 301 → /tools/text-transfer
/tools/cross-device-clipboard          → 301 → /tools/text-transfer
/tools/send-text-to-computer           → 301 → /tools/text-transfer
/tools/send-file-to-computer           → 301 → /tools/text-transfer
/tools/share-files                     → 301 → /tools/text-transfer
/tools/scan-to-paste                   → 301 → /tools/text-transfer
/tools/qr-generator                    → 301 → /tools/qr-code
/tools/qr-scanner                      → 301 → /tools/qr-code
/tools/wifi-to-qr                      → 301 → /tools/qr-code
/tools/shared-notepad                  → 301 → /tools/clipboard
/tools/copy-paste-online               → 301 → /tools/clipboard
/tools/clipboard-sync                  → 301 → /tools/clipboard

# 其他语言（带前缀，:locale = zh-CN | zh-TW | ja | ko | es | fr | de）
/:locale/                              → 各语言首页
/:locale/privacy                       → 各语言隐私政策
/:locale/tools/                        → 各语言工具目录
/:locale/tools/text-transfer           → 各语言工具落地页（其余子路由同上）
/:locale/tools/qr-code                 → 各语言工具落地页
/:locale/tools/clipboard               → 各语言工具落地页

# 长尾 SEO 路由（可索引，详见 10.6 节）
/how-to/:slug                          → 场景教程页（如 send-text-iphone-to-windows）
/:locale/how-to/:slug                  → 各语言场景教程页
/alternatives/:slug                    → 竞品替代品评测页（如 snapdrop-alternative）
/:locale/alternatives/:slug            → 各语言竞品评测页

# 错误页面
/404                                   → 英文 404
/:locale/404                           → 各语言 404
```

### 6.4 SEO 索引规则

| 路由模式                           | SEO 策略  | 说明                                  |
| :--------------------------------- | :-------- | :------------------------------------ |
| `/`、`/:locale/`                   | 可索引    | 各语言首页，核心着陆页                |
| `/tools/`、`/:locale/tools/`       | 可索引    | 工具目录页                            |
| `/tools/:id`、`/:locale/tools/:id` | 可索引    | 工具落地页，独立 SEO                  |
| `*/app`                            | `noindex` | 工具使用页                            |
| `*/r/:roomId`                      | `noindex` | 动态房间页                            |
| `/how-to/*`、`/:locale/how-to/*`   | 可索引    | 场景教程页，长尾关键词引流            |
| `/alternatives/*`、`/:locale/alternatives/*` | 可索引 | 竞品替代品评测，品牌词截流          |
| `/privacy`、`/:locale/privacy`     | 可索引    | 隐私政策                              |
| `/404`、`/:locale/404`             | `noindex` | 404 页面                              |

### 6.5 404 错误页面

* 根据 URL 前缀或浏览器偏好决定语言。
* 内容：友好插画 + "页面未找到"提示 + 返回首页按钮 + 热门工具推荐。
* 返回 HTTP 404 状态码。

### 6.6 导航设计

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] ToolPort    Tools ▾          🌙/☀️   English ▾   │
│                     ├─ Transfer              ├─ English   │
│                     │   ├─ Phone-PC Text     ├─ 简体中文  │
│                     │   └─ Online Clipboard  ├─ 繁體中文  │
│                     ├─ Convert               ├─ 日本語    │
│                     │   └─ QR Code Tools     ├─ 한국어    │
│                     └─ More tools...         ├─ Español   │
│                                              ├─ Français  │
│                                              └─ Deutsch   │
└──────────────────────────────────────────────────────────┘
```

* 导航菜单和语言列表从配置动态生成，文案跟随当前语言。
* 语言切换时 URL 前缀同步变更（英文 → 其他：`/tools/x` → `/zh-CN/tools/x`；反之亦然）。
* 移动端收起为汉堡菜单。

---

## 七、工具 A：手机 ↔ PC 文本传输（MVP 首发）

> 后续工具参照此结构编写独立文档。

### 7.1 工具注册信息

```typescript
{
  id: 'text-transfer',
  name: {
    'zh-CN': '手机PC文本传输',     'zh-TW': '手機電腦文字傳輸',
    en: 'Phone-PC Text Transfer',   ja: 'スマホ↔PC テキスト転送',
    ko: '휴대폰-PC 텍스트 전송',    es: 'Transferencia de texto Móvil-PC',
    fr: 'Transfert de texte Téléphone-PC', de: 'Handy-PC Textübertragung',
  },
  description: {
    'zh-CN': '跨设备剪贴板，扫码即可在手机和电脑之间安全传输文字、图片和文件。免费在线复制粘贴，端到端加密，无需登录。',
    'zh-TW': '跨裝置剪貼簿，掃碼即可在手機和電腦之間安全傳輸文字、圖片和檔案。免費線上複製貼上，端對端加密，無需登入。',
    en: 'Cross-device clipboard — scan a QR code to transfer text, images and files between phone and PC. Free, E2E encrypted, no login.',
    ja: 'デバイス間クリップボード — QRコードでスマホとPC間でテキスト・画像・ファイルを安全に転送。無料、E2E暗号化。',
    ko: '기기 간 클립보드 — QR 코드로 휴대폰과 PC 간에 텍스트, 이미지, 파일을 안전하게 전송. 무료, E2E 암호화.',
    es: 'Portapapeles entre dispositivos — escanea un QR para transferir texto, imágenes y archivos. Gratis, cifrado E2E.',
    fr: 'Presse-papiers multi-appareils — scannez un QR pour transférer texte, images et fichiers. Gratuit, chiffré E2E.',
    de: 'Geräteübergreifende Zwischenablage — QR-Code scannen für Text-, Bild- und Dateitransfer. Kostenlos, E2E-verschlüsselt.',
  },
  route: '/tools/text-transfer',
  category: 'transfer',
  services: ['websocket', 'crypto', 'qrcode', 'file', 'clipboard'],
  relatedTools: ['online-clipboard', 'qr-code-tools'],
}
```

### 7.2 E2EE 加密流程

**密钥规范：**
* `crypto.getRandomValues()` 生成 **256 位** AES 密钥。
* 密钥经 Base64URL 编码放入 URL Hash（`#` 后），浏览器不会将 Hash 发送到服务器。
* 手机端加载后立即 `history.replaceState` 清除 Hash，防止泄露到历史记录或云同步。
* 全程 UTF-8：加密前 `TextEncoder`，解密后 `TextDecoder`，Emoji/CJK/韩文谚文/拉丁扩展字符全链路无损。

**加密模块 (Web Crypto API)：**
* 算法：AES-256-GCM（自带认证标签，保证完整性）。
* 每条消息使用独立随机 IV（12 字节），与密文一起传输。
* 消息格式：`序号 | IV | 密文 | AuthTag`，接收方校验序号递增，防重放。
* 配对码派生：`HKDF(AES-Key, salt="pairing", info="code") → 取前 4 位数字`。

### 7.3 操作流程

**PC 端生成与等待：**
1. 点击 **Start** 进入工具使用页。
2. 前端生成随机 `RoomID`（6 位字母数字）+ AES-256 密钥。
3. 生成二维码：`https://toolport.dev/tools/text-transfer/r/<RoomID>#<密钥>`（不含语言前缀）。
4. （优化）提供 **一键分享 (Web Share API)**：手机端通过 `navigator.share()` 原生弹窗分享长链接，替代门槛极高的人工短码。
5. （免扫码反向直连）**历史设备一键唤起**：若用户曾在手机和某 PC 连通，在手机端首页同网络下会留存设备历史，如“💻 MacBook Pro (近在咫尺)”。点击后向服务器发起配对，PC 端通过 ServiceWorker 或闲置连线极速唤醒接收框，实现免去 PC 上端再重新创建分享码的极短交互。
6. 连接 WebSocket 信令服务器，等待对端连入。

**二维码规范：**
* 纠错等级：**Level M**（15%），平衡容量与容错。品牌 Logo 叠加时提升至 **Level H**（30%）。
* 添加“点击清晰/蒙版化”防误扫屏机制，并支持点击定时刷新防远距偷扫。

**手机端扫码与直连：**
1. 扫码、点击分享链接或手动输入（针对手动输入场景，前端必须通过 `.toLowerCase().trim()` 清除系统输入法首字母大写和尾部空格），提取 `RoomID` 和 `AES-Key`。
2. `history.replaceState` 立即清除 Hash 防止泄露到历史记录。UI 语言根据自身偏好解析。
3. 通过 WebSocket 发送加入房间及 WebRTC SDP 握手信号。
4. **快速连接：** 鉴于扫码和局域网本身具备物理信任属性，默认扫码即连（无需对端二次人工确认）。
5. \**(仅严苛模式可选)* 双方本地从密钥独立派生 4 位配对码（HKDF），供高密级人员手动核对。

**WebRTC 连接建立（NAT 穿透三级降级）：**

```
WebSocket 信令交换 SDP Offer/Answer
    │
    ├─ ICE 候选收集（并行尝试多个 STUN，保证全球可达）：
    │   ├─ 1. Host 候选（局域网直连）           → 同 Wi-Fi 下几乎必成
    │   ├─ 2. STUN 候选（并行多源）：
    │   │       ├─ stun.l.google.com             → 海外用户优先
    │   │       ├─ stun.qq.com                   → 中国大陆用户优先（Google STUN 被墙）
    │   │       └─ Cloudflare STUN               → 全球可达备选
    │   │       （任一 STUN 成功即可获取公网 IP 进行打洞）
    │   └─ 3. TURN 候选（Cloudflare TURN）      → 对称 NAT / 全部 STUN 失败时中继兜底
    │
    ├─ P2P DataChannel 建立成功？
    │   ├─ 是 → P2P 稳定且无活跃传输时，空闲 30s 后断开 WebSocket 信令（见下方说明）
    │   └─ 否（所有 ICE 候选均失败）→ 降级到 WebSocket 密文中转
    │
    └─ 降级到 WebSocket 中转时，保持 WebSocket 连接不断开
```

> **关于公网 IP**：用户设备不需要有公网 IP。STUN 服务器负责发现 NAT 网关的公网 IP 并协助打洞，TURN 在打洞失败时做中继转发，WebSocket 做最终兜底。三级降级保证任何网络环境（含中国大陆 GFW 内）都能正常使用。

> **为何延迟 30s 断开 WebSocket**：P2P 刚建立的前 30 秒内连接可能不稳定（如用户正在切换网络），保留 WebSocket 作为热备可以实现亚秒级恢复。30 秒后连接稳定了再释放 WebSocket，节省 PartyKit 连接额度。P2P 断线时自动重建 WebSocket → 重新握手 → P2P 恢复后再次延迟 30s 断开。

**双向加密传输：**
* 优先通过 P2P DataChannel 传输（同局域网 ~99% 成功，跨网络 ~70-80%，TURN 兜底后 ~95%+）。极端情况降级到 WebSocket 密文中转。
* 手机 ↔ PC：输入文本/粘贴图片/选择文件 → 本地加密 → P2P/中转发送 → 对端解密 → 前端渲染反馈（不可强制刷写剪贴板以免受限）。
* **文件传输**：支持任意文件格式（不做白名单限制），单文件上限 **10MB**，超过 SCTP 256KB 单消息限制时自动分片传输（chunked transfer），对用户透明。超过 10MB 引导到 V2.1 专业文件传输工具。
* **截图/图片粘贴**：基于 Clipboard API 侦听 `paste` 事件直接提取截图，转 Blob 走 P2P 传送，与文件传输共享 10MB 上限。
* 本地缓存 (Local History)：未发送或成功发送的临近记录在前端本地强加密暂存，以防出现误刷新导致数据丢失。

**接收端按 MIME 类型分三档展示：**

| 分类 | MIME 匹配 | 接收端展示 |
| :--- | :-------- | :--------- |
| **图片** | `image/*` | 缩略图预览 + [保存]；移动端小字提示"长按上方图片可保存到相册"（务必确保图片未被设置 `pointer-events: none` 从而阻断系统的保存图像菜单） |
| **可读文本** | `text/*`、`application/json`、`application/xml` | 内容预览（截取前 500 字）+ [复制] + [保存] |
| **其他文件** | 其余所有 MIME 类型 | 文件图标 + 文件名 + 大小 + [下载] |

**文件保存兼容性处理（重点：iOS Safari）：**

iOS Safari 对 `<a download>` 和 Blob URL 下载支持不完整，需采用分级降级策略：

```
接收到文件/图片
    │
    ├─ 检测 navigator.share 是否可用且支持 files？
    │       │
    │       ├─ 可用（iOS 15+、Android）
    │       │   └─ 主按钮显示 [保存/分享]
    │       │       调用 navigator.share({ files: [file] })
    │       │       → 弹出系统原生分享面板（保存到文件/相册/AirDrop 等）
    │       │       ✅ iOS 上最可靠的文件保存方式
    │       │
    │       └─ 不可用（桌面浏览器 / 旧版移动端）
    │           └─ 使用 <a download> + Blob URL 触发下载
    │
    └─ 图片额外处理：页面内直接展示预览，无需下载即可使用
```

| 平台 | 保存方式 | 注意事项 |
| :--- | :------- | :------- |
| **iOS Safari** | Web Share API（主） | `<a download>` 经常被忽略，必须用 Share API |
| **Android Chrome** | `<a download>`（主）/ Share API | 均可正常工作 |
| **桌面浏览器** | `<a download>` + Blob URL | 所有主流浏览器均支持 |
| **macOS Safari** | `<a download>` | PDF 等可能内联预览，需引导用户右键另存为 |

### 7.4 连接状态机

| 状态               | 说明                                             |
| :----------------- | :----------------------------------------------- |
| **WAITING**        | 展示二维码/短码，等待连接。                      |
| **PAIRING**        | 手机已连入，等待配对码确认。                     |
| **CONNECTED**      | 配对成功，双方可互发消息/文件。界面切换到收发区域。 |
| **TRANSFERRING**   | 文件传输中（分片进行中）。界面显示进度条，禁止关闭页面（`beforeunload` 拦截）。 |
| **SUCCESS**        | 对方成功接收并确认（ACK）。此时触发向**工具 C (共享记事本)** 的转化弹窗：”传输已完成，该连接即将断开。需要长久保存或多次对话？👉 [开启免费的共享记事本(工具C)]”。 |
| **TRANSFER_FAILED**| 文件传输中断。显示”发送失败” + [重发] 按钮。     |
| **DISCONNECTED**   | 断线，触发自动重连；失败则提示重新扫码。         |

### 7.5 WebSocket 心跳与重连

**WebSocket 信令阶段（P2P 建立前）：**
* 心跳：**30 秒**一次 Ping，连续 3 次无响应（90s）判定断线。
* 重连：指数退避（1s → 2s → 4s → 8s），最多 5 次后提示重新扫码。
* 降级：WebSocket 不可用时自动切到 KV 短轮询（1-2s 延迟），界面提示。

**P2P 建立后（延迟断开策略）：**
* WebRTC DataChannel 建立成功并且**当前无活跃文件传输任务时**，启动 **30 秒空闲倒计时**，倒计时结束后断开 WebSocket 信令连接，释放 PartyKit 连接额度。如果有活跃传输则挂起该倒计时。
* 30 秒内如 P2P 发生抖动/断线，可立即通过仍存活的 WebSocket 重新握手，用户无感恢复。
* 30 秒后 WebSocket 断开，后续消息收发全部走 P2P 直连。
* P2P 断线时：重建 WebSocket（~1s）→ 重新 SDP 握手（~1-2s）→ P2P 恢复 → 再次启动 30s 倒计时后断开 WebSocket。
* 如 P2P 打洞始终失败（降级到 WebSocket 中转模式），则全程保持 WebSocket 连接不断开。

### 7.6 UI 布局

| 终端       | 核心元素                                                                   | 交互反馈                                                         |
| :--------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **PC 端**  | E2EE 安全徽章、二维码 + 手动码、配对码弹窗、连接状态灯、文本/文件收发区域。 | 收到内容高亮闪烁，每条消息旁边带独立 **[复制]** 按钮；可发送文本/文件到手机。 |
| **手机端** | 全屏输入框（自动聚焦）、底部固定发送按钮 + 文件选择按钮、接收消息区域。     | 发送成功按钮变绿 2 秒；收到 PC 消息时顶部通知。                 |

**连接成功过渡态：**
* 扫码连接成功瞬间，二维码区域平滑收起（动画 300ms），展开文本/文件收发区域。
* 手机端显示绿色横幅 "已连接到 PC，可以开始传输" 持续 3 秒后消失，输入框自动聚焦弹出键盘。
* PC 端状态灯变绿 + "已连接"，二维码区域缩小到角落（方便再扫），主区域切换为消息列表。

**文件传输进度反馈：**
* 文本消息：即时发送，无进度条。
* 文件/图片（>100KB）：发送端显示进度条（百分比 + 已传/总量），接收端显示"接收中..."骨架占位。
* 进度条在气泡内部渲染，完成后平滑过渡为文件预览/图片缩略图。
* **端到端确认**：接收端收到完整文件并校验后，回传 `ACK` 确认消息，发送端气泡从"发送中"变为"已送达"。

**文件传输中断与恢复：**

| 中断场景 | 处理方式 | 用户感知 |
| :------- | :------- | :------- |
| **P2P 传输中网络抖动（几秒恢复）** | WebRTC DataChannel 自带 SCTP 重传机制，短暂抖动自动恢复，进度条暂停后继续 | 进度条暂停几秒后继续，无需操作 |
| **P2P 传输中彻底断线** | 中止当前传输 → 走重连流程 → 重连成功后提示"文件传输中断，是否重新发送？"+ [重发] 按钮 | 气泡显示红色"发送失败" + [重发] |
| **发送端关闭页面** | 接收端检测到 P2P 断开 → 丢弃未完成的分片 → 显示"对方已离开，文件接收中断" | 骨架占位消失，显示系统提示 |
| **接收端关闭页面** | 发送端收不到 ACK → 超时后气泡显示"对方可能未收到" | 气泡变灰色 + 警告图标 |
| **手机息屏/锁屏** | **防断扫优化**：文件传输开始时，前端调用 `Wake Lock API` (`navigator.wakeLock.request('screen')`) 强制保持屏幕常亮，传输结束后释放。若系统不支持，则降级检测 `visibilityState` 暂停队列，并提示"请保持屏幕常亮以完成传输" | 传输流畅且不会因系统自动黑屏而断连（体验直逼原生应用） |
| **Wi-Fi 切 4G（IP 变化）** | ICE Restart：检测到连接断开 → 重新收集 ICE 候选 → 不重建 WebSocket 直接更新 SDP → P2P 恢复 | 进度条暂停 2-3 秒后自动继续 |

> **MVP 不做断点续传**：断线后重发完整文件而非续传。文件上限 10MB，重传成本可接受。断点续传留给 V2.1 专业文件传输工具。

**多文件发送队列与防崩溃：**
* **单次限制与流式分片**：单次最多允许选择 10 个文件，以防用户框选过多文件导致浏览器 OOM (内存溢出) 崩溃。发送大文件时必须使用 `Blob.slice()` 结合 FileReader 进行流式分片读取投递，严格禁止一次性将整个文件直接读入内存。
* 用户连续选择多个文件时，按选择顺序排队发送（串行），不并行。
* 队列在发送区域展示为列表：当前传输中的显示进度条，排队中的显示"等待中..."。同时提供显眼的 `[✕ 取消发送]` 按钮，允许用户随时中止正排队中的误传文件。
* 队列中任一文件失败不阻塞后续：标记失败 + [重发]，继续发送下一个。

### 7.7 错误场景

| 错误码 | 场景             | 提示文案（简中示例，各语言独立翻译）                         |
| :----- | :--------------- | :----------------------------------------------------------- |
| E001   | 浏览器不兼容     | "浏览器版本过低，请使用 Chrome/Safari/Firefox 最新版本。"    |
| E002   | 房间已满         | "该房间已有两台设备连接，请重新生成二维码。"                 |
| E003   | 房间已过期       | "连接已过期，请重新生成二维码。"                             |
| E004   | 配对码不一致     | "配对码不匹配，请确认扫描了正确的二维码。"                   |
| E005   | 解密失败         | "消息解密失败，请重新扫码连接。"                             |
| E006   | 文本超过大小限制 | "文本过长（上限 64KB），请缩短后重试。"                      |
| E011   | 文件超过大小限制 | "文件过大（上限 10MB）。需要传输更大的文件？敬请期待专业文件传输工具。" |
| E007   | 发送频率超限     | "发送过于频繁，请稍后再试。"                                 |
| E008   | 连接中断         | "连接中断，正在重新连接...（第 N/5 次）"                    |
| E009   | 重连失败         | "无法恢复连接，请重新生成二维码。"                           |
| E010   | 并发房间达上限   | "当前使用人数较多，请稍后再试。"                             |
| E012   | 文件传输中断     | "文件传输中断，请检查网络连接。" + [重新发送] 按钮           |
| E013   | 对方未确认接收   | "对方可能未收到此文件，请确认对方设备在线。"                 |

### 7.8 SEO 数据（seo.ts）

**各语言 `<title>` 标签：**

```typescript
title: {
  en: 'Free Cross-Device Transfer — Send Text, Images & Files Between Phone & PC | ToolPort',
  'zh-CN': '免费跨设备传输 — 手机电脑互传文字、图片和文件，扫码即用 | ToolPort',
  'zh-TW': '免費跨裝置傳輸 — 手機電腦互傳文字、圖片和檔案，掃碼即用 | ToolPort',
  ja: '無料デバイス間転送 — スマホ↔PCでテキスト・画像・ファイルを送信 | ToolPort',
  ko: '무료 기기 간 전송 — 휴대폰↔PC 텍스트·이미지·파일 전송 | ToolPort',
  es: 'Transferencia entre dispositivos gratis — Texto, imágenes y archivos Móvil↔PC | ToolPort',
  fr: 'Transfert multi-appareils gratuit — Texte, images et fichiers Téléphone↔PC | ToolPort',
  de: 'Kostenloser geräteübergreifender Transfer — Text, Bilder & Dateien Handy↔PC | ToolPort',
}
```

> Title 策略：前半段命中"跨设备剪贴板"高搜索量词，后半段命中"手机电脑传文字"精准长尾词，用 `—` 分隔保证两侧都能被搜索引擎独立匹配。

**HowTo 结构化数据（Google 富摘要）：**

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Transfer Text and Files Between Phone and PC",
  "description": "Use ToolPort to securely send text, images and files across devices in 3 steps. No app, no login.",
  "totalTime": "PT30S",
  "tool": { "@type": "HowToTool", "name": "Any modern web browser" },
  "step": [
    {
      "@type": "HowToStep",
      "name": "Open ToolPort on your PC",
      "text": "Visit toolport.dev/tools/text-transfer and click Start. A QR code will appear.",
      "url": "https://toolport.dev/tools/text-transfer"
    },
    {
      "@type": "HowToStep",
      "name": "Scan with your phone",
      "text": "Open your phone camera and scan the QR code. The two devices connect instantly."
    },
    {
      "@type": "HowToStep",
      "name": "Copy and paste across devices",
      "text": "Type text, paste images, or select files on either device. Content appears on the other side in real time, end-to-end encrypted."
    }
  ]
}
```

**落地页内容区块（工具 A 专属）：**

| 区块 | 具体内容 | 命中关键词 |
| :--- | :------- | :--------- |
| **Hero** | "跨设备传输 — 手机电脑互传文字、图片和文件" + 副标题 "扫码连接，端到端加密，免费无需登录" + **Start** + 动态演示 GIF | 跨设备传输、手机电脑互传 |
| **3 步图解** | ① PC 打开网页 → ② 手机扫码连接 → ③ 互传文字自动同步 | alt 标签：`手机扫码传文字到电脑`、`cross device text transfer` |
| **使用场景** | 见下方场景表 | 场景长尾词 |
| **安全原理** | E2EE 流程图 + "你的文字只有你能看到" + WebRTC P2P 直连说明 | `encrypted text transfer`、`安全传输` |
| **竞品对比** | 见下方对比表 | 竞品品牌词引流 |
| **FAQ** | 见下方 FAQ 表 | 长尾问答词 + Schema 富摘要 |
| **相关工具** | 共享剪贴板 + 二维码工具 ToolCard | 内链 + 工具 C 导流 |

**使用场景区块（中英文示例）：**

| 场景 | 描述（中文） | 描述（英文） |
| :--- | :----------- | :----------- |
| **会议速记** | 手机上记的笔记一键传到电脑整理 | Transfer meeting notes from phone to PC instantly |
| **地址/验证码** | 手机收到的验证码、地址直接传到电脑填表 | Send verification codes or addresses to your computer |
| **代码片段** | 电脑上的代码传到手机调试 | Share code snippets from PC to phone for testing |
| **文件快传** | 手机收到的 PDF/文档/压缩包传到电脑 | Send PDF, docs or zip files from phone to PC |
| **跨平台复制** | Mac 和 Android、iPhone 和 Windows 互传 | Copy-paste between any OS: iOS↔Windows, Android↔Mac |
| **无需安装** | 不想装 App，打开网页就能传 | No app needed — works in any browser |

**竞品对比区块：**

| 维度 | ToolPort | AirDrop | Snapdrop | Pushbullet | KDE Connect |
| :--- | :------- | :------ | :------- | :--------- | :---------- |
| **跨系统** | 任意设备 | 仅 Apple | 仅局域网 | 需注册 | 仅 Android+Linux |
| **跨网络** | 任意网络 | 仅局域网 | 仅局域网 | 需账号 | 仅局域网 |
| **安装** | 不需要 | 系统内置 | 不需要 | 需安装 App | 需安装 App |
| **加密** | E2EE | 端设备级 | 无 | 传输层 | 传输层 |
| **登录** | 不需要 | Apple ID | 不需要 | 需要 | 不需要 |
| **免费** | 完全免费 | 免费 | 免费 | 部分免费 | 免费 |

> 竞品对比不同语言版本可替换为当地更知名的竞品（如简中版对比"快牙"、"茄子快传"，日文版对比"AirMore"）。

**FAQ 区块（中英双语示例，各语言独立翻译并适配本地搜索习惯）：**

| 问题（中文） | 问题（英文） | 回答要点 |
| :----------- | :----------- | :------- |
| 手机传文字到电脑需要安装软件吗？ | Do I need to install an app to send text to my computer? | 不需要，打开浏览器即可使用 |
| 跨设备复制粘贴安全吗？ | Is cross-device copy-paste secure? | E2EE 端到端加密，服务器无法读取内容 |
| iPhone 和 Windows 电脑之间能互传吗？ | Can I transfer between iPhone and Windows? | 支持任意设备组合，只要有浏览器 |
| 传输的文字大小有限制吗？ | Is there a size limit for text transfer? | 文本最大 64KB（约 2 万汉字），文件/图片最大 10MB |
| 传输速度快吗？ | How fast is the transfer? | P2P 直连，同局域网几乎瞬时 |
| 不在同一个 Wi-Fi 下能用吗？ | Does it work on different networks? | 支持，WebRTC 可跨网络传输 |
| 传输记录会被保存吗？ | Are my transferred texts stored anywhere? | 不保存，房间过期后自动销毁 |
| 支持传什么类型的文件？ | What file types are supported? | 任意格式，PDF、文档、图片、压缩包等都可以，不限类型，只限大小（10MB） |
| 和在线剪贴板有什么区别？ | How is this different from an online clipboard? | 一次性加密传输 vs 持续共享，隐私更强；需要持续共享可用我们的共享剪贴板工具 |

> 最后一条 FAQ 故意引导到工具 C，形成自然内链导流。

### 7.9 SEO 别名路由（长尾搜索拦截）

**程序化 SEO 矩阵 (pSEO OS Matrix)**

通过提取多维度的关键词，排列组合后利用 Nuxt 批量虚拟出独立的 `<title>`、Meta 配置和网页排版，从而实现长尾查询词的**“降维拦截” (Programmatic SEO 策略)**：

**维度 1：双端设备与系统矩阵 (Devices & OS)**
*   `/how-to/transfer-text-from-ios-to-windows` (击中最高频“苹果+微软”割裂痛点，落地页动态加载双阵营 Logo)
*   `/how-to/send-files-from-android-to-mac` (击中“安卓+苹果计算机”的壁垒痛点)
*   `/how-to/copy-paste-between-iphone-and-pc` (解决跨系统无缝剪贴板的搜索)
*   `/how-to/share-links-from-phone-to-laptop` (面向非技术人群的高频白话搜索)

**维度 2：传输内容与动词矩阵 (Content & Intents)**
*   `/tools/send-text-to-computer` (核心需求：发文本/网址到电脑)
*   `/tools/send-large-video-from-phone-to-pc` (长尾需求：传大视频/原画视频)
*   `/tools/transfer-photos-without-losing-quality` (强诉求：原图传输不压画质)
*   `/tools/scan-qr-code-to-send-text` (具象化动作：扫码发字)

**维度 3：否定词与痛点约束矩阵 (Constraints - "Without")**
*这类词的转化率极高，因为用户明确表达了对某类高门槛操作的厌恶，而我们全能满足：*
*   `/how-to/transfer-files-without-usb-cable` (免数据线)
*   `/how-to/send-files-from-phone-to-pc-without-app` (免装原生 App，纯网页)
*   `/how-to/share-text-online-without-login` (免去恶心的强制注册登录邮箱步骤)
*   `/how-to/transfer-files-over-wifi-only` (强调只走内网不走公网流量)

**维度 4：竞品认知截流矩阵 (Alternatives Hijacking)**
*针对老牌竞品的软肋，定向制作“为什么我们更好”的平替推荐落地页：*
*   `/alternatives/airdrop-for-windows` (解决 AirDrop 被限死在果粉生态里的痛点)
*   `/alternatives/snapdrop-alternative` (主打：我们能跨网络 4G 穿透，而 SnapDrop 跨网即死)
*   `/alternatives/pushbullet-alternative-free` (主打：我们永不强迫付费且无账号绑架)
*   `/alternatives/shareit-alternative-no-ads` (主打：纯净零广告，拒绝印度/东南亚市场的流氓广告软件)
*   `/alternatives/localsend-alternative-web` (主打：无需双端安装庞大客户端，即用即走)

---

## 八、安全与防滥用机制

### 8.1 平台级

| 机制           | 规则                                                                     |
| :------------- | :----------------------------------------------------------------------- |
| **CSP 安全头** | 严格 `Content-Security-Policy`，仅允许自身域名脚本和连接。               |
| **SRI 校验**   | 外部 CDN 资源添加 Subresource Integrity hash。                          |
| **HTTPS 强制** | 全站 HTTPS + HSTS。                                                     |
| **频率限制**   | Workers 层面全局 IP 频率限制，防滥用脚本白嫖中转信令。                    |
| **人机验证**   | 当单一 IP 出现异常高频的 RoomID 创建/请求时，自动触发 Cloudflare Turnstile。|

### 8.2 文本传输工具

| 机制             | 规则                                                                           |
| :--------------- | :----------------------------------------------------------------------------- |
| **房间人数限制** | 每 Room 限 2 个连接，第三个拒绝（E002）。                                     |
| **配对确认**     | HKDF 派生配对码，用户目视确认，防抢连/中间人。                                |
| **消息防重放**   | 递增序号，接收方校验连续性。                                                   |
| **密钥保护**     | 加载后立即清除 URL Hash。                                                     |
| **生命周期**     | 初始 15 分钟；活跃时自动续期（最长 60 分钟），无操作超时销毁。UI 在剩余 2 分钟时顶部黄色横幅提示"连接即将过期，发送任意内容可续期"，过期后提示 E003。 |
| **并发上限**     | 活跃房间达上限时拒绝新建（E010）。                                            |
| **载荷限制**     | 纯文本最大 64KB；文件/图片最大 10MB（P2P 直连，不经服务器），不限格式。       |
| **频率限制**     | 单 Room 每秒最多 5 条消息。                                                   |
| **空内容防护**   | 输入为空时发送按钮 disabled。                                                 |
| **断线恢复**     | 未发送内容暂存 localStorage，重连后可恢复。                                   |

---

## 九、测试策略与 CI/CD

### 9.1 测试分层

| 层级           | 工具                    | 覆盖范围                                                         | 运行时机       |
| :------------- | :---------------------- | :--------------------------------------------------------------- | :------------- |
| **单元测试**   | Vitest                  | 加密/解密、HKDF 配对码、消息序号、语言检测、URL Hash 解析。      | 每次 Push / PR |
| **组件测试**   | Vitest + Vue Test Utils | CopyButton、StatusBadge、LocaleSwitcher 等公共组件。             | 每次 Push / PR |
| **E2E 测试**   | Playwright              | PC 生成二维码 → 扫码 → 配对 → 发送 → 接收 → 复制 全流程。      | PR 合并前      |
| **跨浏览器**   | Playwright              | Chromium + Firefox + WebKit；移动端模拟 iPhone Safari + Android。 | PR 合并前      |
| **多语言快照** | Vitest 快照             | 8 种语言落地页 HTML 快照，防翻译缺失或 key 遗漏。               | 每次 Push / PR |

### 9.2 关键测试用例

```
# 加密模块（单元测试）
✓ 加密后解密还原（含 Emoji、CJK、换行符）
✓ 不同 IV 产生不同密文
✓ 错误密钥解密失败并抛出明确错误
✓ HKDF 配对码：同一密钥两端结果一致
✓ 乱序/重复消息被正确拒绝

# 核心流程（E2E 测试）
✓ 二维码 URL 包含正确的 RoomID 和 Hash
✓ 手机端 URL Hash 被清除
✓ 配对码一致 → CONNECTED
✓ 双向文字收发 + 正确解密
✓ 一键复制 → 剪贴板正确
✓ 断线 → 重连 → 继续发送
✓ 房间超时 → E003

# 文件传输（E2E 测试）
✓ 发送 <256KB 小文件 → 不分片 → 接收端正确预览/下载
✓ 发送 5MB 文件 → 自动分片 → 进度条正确 → 接收端完整接收
✓ 发送 >10MB 文件 → 拒绝 + E011 提示
✓ 传输中断线 → 重连后提示 E012 + [重发] 按钮
✓ 接收端确认 ACK → 发送端气泡变为"已送达"
✓ 接收端关闭页面 → 发送端超时显示 E013
✓ 多文件队列：连续选 3 个文件 → 串行发送 → 各自独立进度条
✓ 队列中取消：点击 [✕ 取消] → 跳过该文件 → 继续下一个
✓ iOS Safari 文件保存：Share API 正确弹出系统面板
✓ 图片接收：缩略图预览正确 + 长按可保存

# 多语言（快照测试）
✓ 8 种语言 common.json 所有 key 完整
✓ 各语言落地页渲染无空白文案
```

### 9.3 CI/CD 流程

```
Push to any branch  → GitHub Actions: lint + 单元/组件/多语言快照测试
Pull Request        → GitHub Actions: 全量测试（含 E2E 跨浏览器）
                    → Cloudflare Pages: 自动生成 PR 预览环境
Merge to main       → Cloudflare Pages: 自动构建 → 部署生产
                    → Lighthouse CI 跑分，卡 Core Web Vitals
```

---

## 十、SEO 策略

### 10.1 架构

每个工具 × 每种语言 = 一个独立 SEO 落地页。框架自动生成：

```
工具 seo.ts × 8 语言 → <title> / <meta> / OG / hreflang / JSON-LD / Sitemap
```

**URL 规范化 (Canonical & Trailing Slash) 陷阱规避：**
强制 Nuxt 采用**无末尾斜杠（或统一加斜杠）**标准。由于 `/tools/text` 和 `/tools/text/` 会被谷歌视为两个重复页面从而互相稀释权重，配置中必须全站 301 重定向到统一标准，并确保 `<link rel="canonical" href="...">` 中的地址格式完全精准匹配。

### 10.2 hreflang（自动生成）

```html
<!-- 以文本传输工具为例 -->
<link rel="alternate" hreflang="en"      href="https://toolport.dev/tools/text-transfer" />
<link rel="alternate" hreflang="zh-Hans" href="https://toolport.dev/zh-CN/tools/text-transfer" />
<link rel="alternate" hreflang="zh-Hant" href="https://toolport.dev/zh-TW/tools/text-transfer" />
<link rel="alternate" hreflang="ja"      href="https://toolport.dev/ja/tools/text-transfer" />
<link rel="alternate" hreflang="ko"      href="https://toolport.dev/ko/tools/text-transfer" />
<link rel="alternate" hreflang="es"      href="https://toolport.dev/es/tools/text-transfer" />
<link rel="alternate" hreflang="fr"      href="https://toolport.dev/fr/tools/text-transfer" />
<link rel="alternate" hreflang="de"      href="https://toolport.dev/de/tools/text-transfer" />
<link rel="alternate" hreflang="x-default" href="https://toolport.dev/tools/text-transfer" />
```

> hreflang 使用 `zh-Hans`/`zh-Hant`（Google 推荐 BCP 47）。英文在根路径，同时作为 `x-default`。

### 10.3 平台首页 SEO 数据

**各语言首页 `<title>`：**

```typescript
// 首页 title 要同时命中”在线工具”品类词和”隐私/免费”差异化词
homepageTitle: {
  en: 'ToolPort — Free Online Tools, Privacy First | Text Transfer, QR Code & More',
  'zh-CN': 'ToolPort — 免费在线工具集，隐私优先 | 跨设备传文字、二维码生成、共享剪贴板',
  'zh-TW': 'ToolPort — 免費線上工具集，隱私優先 | 跨裝置傳文字、QR Code 生成、共享剪貼簿',
  ja: 'ToolPort — 無料オンラインツール集、プライバシー重視 | テキスト転送・QRコード・クリップボード',
  ko: 'ToolPort — 무료 온라인 도구 모음, 프라이버시 우선 | 텍스트 전송・QR 코드・클립보드',
  es: 'ToolPort — Herramientas online gratuitas, privacidad primero',
  fr: 'ToolPort — Outils en ligne gratuits, confidentialité avant tout',
  de: 'ToolPort — Kostenlose Online-Tools, Datenschutz zuerst',
}
```

> Title 策略：品牌名 + 品类词”在线工具集” + 差异化”隐私优先/免费” + 3 个 MVP 工具名列举（命中长尾搜索）。

**Open Graph & Twitter Card：**

```html
<meta property=”og:title” content=”ToolPort — Free Online Tools, Privacy First” />
<meta property=”og:description” content=”Privacy-first free online tools: cross-device text transfer, QR code generator & scanner, shared clipboard. No login, no tracking.” />
<meta property=”og:image” content=”https://toolport.dev/og-home.png” />
<meta property=”og:locale” content=”en_US” />
<meta property=”og:locale:alternate” content=”zh_CN” />
<!-- ... 其余 6 种语言 -->
<meta name=”twitter:card” content=”summary_large_image” />
```

**首页 JSON-LD（WebSite + SearchAction）：**

```json
{
  “@context”: “https://schema.org”,
  “@type”: “WebSite”,
  “name”: “ToolPort”,
  “url”: “https://toolport.dev”,
  “description”: “Privacy-first free online tools”,
  “inLanguage”: [“en”, “zh-CN”, “zh-TW”, “ja”, “ko”, “es”, “fr”, “de”],
  “potentialAction”: {
    “@type”: “SearchAction”,
    “target”: “https://toolport.dev/tools/?q={search_term_string}”,
    “query-input”: “required name=search_term_string”
  }
}
```

> `SearchAction` 可让 Google 在搜索结果中直接展示站内搜索框（Sitelinks Search Box），提升品牌搜索的点击率。

### 10.4 工具落地页 Schema 模板

**每个工具落地页自动注入以下 3 种 Schema：**

**① WebApplication（工具基本信息）：**

```json
{
  “@context”: “https://schema.org”,
  “@type”: “WebApplication”,
  “name”: “{{tool.name[locale]}}”,
  “description”: “{{tool.description[locale]}}”,
  “url”: “https://toolport.dev{{tool.route}}”,
  “applicationCategory”: “UtilitiesApplication”,
  “operatingSystem”: “Web”,
  “offers”: { “@type”: “Offer”, “price”: “0”, “priceCurrency”: “USD” },
  “inLanguage”: “{{locale}}”
}
```

**② BreadcrumbList（面包屑导航）：**

```json
{
  “@context”: “https://schema.org”,
  “@type”: “BreadcrumbList”,
  “itemListElement”: [
    { “@type”: “ListItem”, “position”: 1, “name”: “Home”, “item”: “https://toolport.dev” },
    { “@type”: “ListItem”, “position”: 2, “name”: “Tools”, “item”: “https://toolport.dev/tools/” },
    { “@type”: “ListItem”, “position”: 3, “name”: “{{tool.name[locale]}}”, “item”: “https://toolport.dev{{tool.route}}” }
  ]
}
```

> 面包屑让 Google 在搜索结果中显示层级路径 `toolport.dev > Tools > Text Transfer`，比裸 URL 点击率高 10-15%。

**③ HowTo（使用步骤，各工具独立定义）：**
* 工具 A：见 7.8 节 HowTo Schema（3 步：打开 → 扫码 → 互传）
* 工具 B：生成模式 2 步（输入文本 → 下载二维码），读取模式 2 步（上传图片 → 获取结果）
* 工具 C：3 步（新建房间 → 分享链接 → 多端同步）

**④ FAQPage（FAQ 结构化数据）：**

```json
{
  “@context”: “https://schema.org”,
  “@type”: “FAQPage”,
  “mainEntity”: [
    {
      “@type”: “Question”,
      “name”: “{{question[locale]}}”,
      “acceptedAnswer”: { “@type”: “Answer”, “text”: “{{answer[locale]}}” }
    }
  ]
}
```

> FAQ Schema 能让搜索结果直接展开问答折叠面板，单条搜索结果可占据 3-5 行高度，挤压竞品展示空间。

### 10.5 robots.txt & Sitemap（自动生成）

```txt
User-agent: *
Allow: /
Allow: /zh-CN/
Allow: /zh-TW/
Allow: /ja/
Allow: /ko/
Allow: /es/
Allow: /fr/
Allow: /de/
Disallow: /tools/*/app
Disallow: /tools/*/r/
Disallow: /*/tools/*/app
Disallow: /*/tools/*/r/
Sitemap: https://toolport.dev/sitemap.xml
```

Sitemap 中每个 `<url>` 包含完整 8 语言 `xhtml:link` hreflang 互指，由框架根据 `registry.ts` 自动生成。

### 10.6 工具 A 各语言目标关键词（工具 B/C 见各自文档）

| 语言     | 核心关键词（传输场景）                                          | 扩展关键词（剪贴板 + 文件分享场景）                                                       |
| :------- | :-------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| English  | `phone to pc text transfer`, `send text to computer`            | `cross device clipboard`, `send file from phone to pc`, `free file sharing`, `share files online no login` |
| 简体中文 | `手机传文字到电脑`、`扫码传文本`                                | `跨设备复制粘贴`、`手机传文件到电脑`、`免费文件分享`、`在线共享文件`、`免登录文件传输`     |
| 繁體中文 | `手機傳文字到電腦`、`掃碼傳文字`                                | `跨裝置複製貼上`、`手機傳檔案到電腦`、`免費檔案分享`、`線上共享檔案`                      |
| 日本語   | `スマホからPCにテキスト送信`                                    | `デバイス間クリップボード`、`スマホからPCにファイル送信`、`無料ファイル共有`、`オンラインファイル転送` |
| 한국어   | `핸드폰에서 PC로 텍스트 전송`                                   | `기기간 클립보드`、`핸드폰에서 PC로 파일 전송`、`무료 파일 공유`、`온라인 파일 전송`      |
| Español  | `transferir texto del móvil al PC`                              | `enviar archivo del móvil al PC`、`compartir archivos gratis`、`transferencia de archivos online` |
| Français | `transférer texte téléphone PC`                                 | `partage de fichiers gratuit`、`envoyer fichier téléphone vers PC`、`presse-papiers multi-appareils` |
| Deutsch  | `Text vom Handy zum PC senden`                                  | `Datei vom Handy zum PC senden`、`kostenlos Dateien teilen`、`Zwischenablage geräteübergreifend`   |

### 10.7 落地页内容策略

**平台首页（每种语言独立）：** Hero + 工具卡片网格 + 平台优势 + FAQ。

**工具落地页（每工具 × 每语言独立）：**

| 区块           | 内容                                                 | SEO 价值                   |
| :------------- | :--------------------------------------------------- | :------------------------- |
| **Hero**       | 工具名 + 一句话说明 + **Start** + 动态演示截图       | 核心关键词命中             |
| **使用步骤**   | 3 步图解                                             | alt 标签命中长尾词         |
| **使用场景**   | 适用场景举例                                         | 场景关键词                 |
| **长尾场景库** | 针对该工具衍生的大量具体需求短篇（如："iPhone给电脑传文本"） | **极高**：吃尽自然搜索长尾流量 |
| **安全原理**   | E2EE / P2P WebRTC 加密流程图解本地背书               | 增强页面权威性与信任感     |
| **竞品对比**   | 与同类工具对比（各地区可用不同竞品）                 | 竞品关键词引流             |
| **FAQ**        | 专属 FAQ（批量借助 AI 针对各语言做母语级优化）       | 长尾词 + Schema 富摘要     |
| **相关工具**   | 3-4 张 ToolCard 交叉推荐                             | 内链网络 + PageRank 传递   |

> **高阶 SEO 流量护城河与“竞品截流”策略：**
> 1. **长尾词教程式落地页 (How-to & Use cases)：** 利用工具 A 极简的“扫码即连”特性，在 Nuxt 中通过 `pages/how-to/[slug].vue` 动态路由，生成几百个独立静态落地页，吃尽各种边缘搜索场景流量。页面只需根据 URL 的 slug 替换 `H1` 标题和几行痛点提示，主体全复用同一套发送组件。
>    * **系统跨端词**：`/how-to/send-text-iphone-to-windows`, `/how-to/connect-android-to-mac-wireless`
>    * **剪贴板动作词**：`/how-to/copy-paste-between-phone-and-pc`, `/how-to/share-clipboard-across-devices`
>    * **痛点反感词**：`/how-to/transfer-text-without-app`, `/how-to/send-files-without-usb-cable`, `/how-to/share-files-without-login`
>    * **内容细分词**：`/how-to/send-pdf-from-phone-to-pc`, `/how-to/transfer-photos-without-losing-quality`
> 2. **痛点竞品降维截流 (Alternative-To / Competitor Hijacking)：** 针对全球成千上万被巨头商业化或技术债折磨的用户，精准建立对应竞品的引流对标页面，把别人培养好的用户池洗过来。
>    * `/alternatives/airdrop-for-windows-and-android` — 承接苦寻 AirDrop PC 方案的大批流量。
>    * `/alternatives/snapdrop-alternative` — 核心标语：“SnapDrop 只能局域网？我们支持 4G/5G/异地 Wi-Fi 无死角直连”。
>    * `/alternatives/pushbullet-alternative` — 核心标语：“厌倦了 Pushbullet 的强制注册和高昂月费？试试我们”。
>    * `/alternatives/shareit-alternative` / `/alternatives/xender-alternative` — 核心标语：“没有恶心的广告推荐，没有任何弹窗，纯净传文件”。
>    * `/alternatives/localsend-alternative` — 核心标语：“不想为传一张图就在电脑和手机上各装一个巨大的 App？浏览器即开即走”。

> FAQ 和使用场景应由母语者或高质量 AI 翻译并人工审校。

### 10.8 隐私政策页

核心要点（各语言独立翻译）：

**各工具隐私处理方式：**

| 工具 | 数据处理方式 | 服务端可见性 |
| :--- | :----------- | :----------- |
| **文本传输** | 强制 E2EE 端到端加密，优先 WebRTC P2P 直连 | 服务器仅转发密文和信令，零知识 |
| **二维码工具** | 100% 浏览器本地处理，零网络请求 | 服务端完全不参与，无任何数据上传 |
| **共享剪贴板** | 默认 WSS 传输层加密；可选 E2EE 模式 | 默认模式下服务端可见消息（仅暂存用于历史回放，不做分析）；E2EE 模式下零知识 |

**通用隐私承诺：**
* 不收集、不存储任何用户内容。所有工具的临时数据在使用完毕或过期后自动彻底销毁。
* 不使用 Cookie，不追踪用户。数据分析使用 PostHog / Umami（自部署或隐私友好模式），仅采集匿名行为事件，不采集个人标识。
* **P2P 及 IP 暴露免责声明（文本传输工具）：** WebRTC P2P 点对点通道会让通信两端互相暴露真实公网或内网 IP。对匿名度有极高要求的人士需注意此特性。
* **共享剪贴板默认模式声明：** 默认模式下消息经 WSS 加密传输，但服务端可见明文内容（仅用于暂存回放）。如需端到端加密，请在创建房间时启用 E2EE 选项。

**GDPR/CCPA 严格合规化：** 完全不处理个人真实关联数据资产、全站禁流外部 Tracking Cookie、不做无意义的用户长偏好画像追踪。由于无追踪诉求，本应用彻底免疫于 Cookie Banner 同意弹窗强制要求（只须在隐私页显著告知理由即可）。底部预留法务合规及数据控制者专线联系邮箱。

### 10.9 搜索引擎提交

| 平台                      | 动作                                                    |
| :------------------------ | :------------------------------------------------------ |
| **Google Search Console** | DNS 验证；提交 sitemap.xml；监控索引状态。              |
| **Bing Webmaster Tools**  | 验证；提交 sitemap；可同步 Google Search Console 数据。 |
| **百度搜索资源平台**      | 提交简中 sitemap。                                      |
| **Naver Webmaster**       | P1 韩文上线后提交。                                     |

### 10.10 性能 (Core Web Vitals)

* 工具代码 + 语言包按需懒加载，未访问的不加载。
* 落地页预渲染为静态 HTML（每语言 × 每工具独立生成）。
* 目标：**LCP < 2.5s**、**FID < 100ms**、**CLS < 0.1**。

---

## 十一、UI/UX 体验规范

### 11.1 公共组件

| 组件               | 说明                                             | 复用场景               |
| :----------------- | :----------------------------------------------- | :--------------------- |
| **CopyButton**     | 一键复制，成功显示反馈                           | 几乎所有工具           |
| **FileDropZone**   | 拖拽/点击上传                                    | 二维码工具、图片压缩   |
| **CodeBlock**      | 等宽字体代码展示，支持语法高亮                   | 文本传输、共享剪贴板   |
| **StatusBadge**    | 状态指示灯 + 文字标签                            | 文本传输、共享剪贴板   |
| **ToolCard**       | 工具卡片（图标 + 名称 + 描述）                   | 首页、目录、推荐区     |
| **RelatedTools**   | 相关工具推荐栏（横向卡片列表）                   | 落地页底部、使用页     |
| **ErrorMessage**   | 统一错误提示                                     | 全局                   |
| **LocaleSwitcher** | 语言切换下拉菜单                                 | 导航栏                 |

> 所有组件文案从 i18n 语言包加载，不硬编码文字。

### 11.2 工具间交叉推荐

**推荐数据来源：** `ToolDefinition.relatedTools` 手动关联 → 同 `category` 自动补充 → 热门兜底。

| 展示位置               | 方式                                          | 时机               |
| :--------------------- | :-------------------------------------------- | :----------------- |
| **落地页底部**         | "相关工具"区块，3-4 张 ToolCard               | 页面加载即展示     |
| **使用页完成操作后**   | "试试其他工具"，2-3 张小卡片                  | 首次完成后浮现     |
| **404 页面**           | "热门工具"推荐                                | 页面加载即展示     |

推荐卡片使用 `<a>` 标签，确保爬虫可抓取，形成内链网络。

**MVP 三工具互跳关系：**

```
        text-transfer
        ↗            ↖
       ↙              ↘
qr-code-tools ←→ online-clipboard
```

| 当前工具               | 推荐跳转                                                       | 推荐话术示例（简中）                           |
| :--------------------- | :------------------------------------------------------------- | :--------------------------------------------- |
| **文本传输**           | 共享剪贴板、二维码工具                                         | "需要持续共享？试试共享剪贴板"                 |
| **二维码工具**         | 文本传输、共享剪贴板                                           | "需要跨设备发送文本？试试文本传输"             |
| **共享剪贴板**         | 文本传输、二维码工具                                           | "需要加密传输？试试文本传输"                   |

**跳转触发点（4 个位置）：**
1. **落地页底部** — RelatedTools 卡片区块，始终展示另外 2 个工具的 ToolCard。
2. **使用页顶部** — 轻量工具切换标签栏（`文本传输 | 二维码 | 共享剪贴板`），高亮当前工具，点击跳转。**防误触**：工具 A 在 CONNECTED/SENDING 状态时，点击其他标签弹出确认"当前连接将断开，确定离开？"；工具 B/C 无活跃连接时直接跳转。
3. **操作完成后** — 浮现 "试试其他工具" 小卡片推荐。
4. **导航菜单** — Tools 下拉菜单中列出所有工具，按 category 分组。

### 11.3 响应式断点

| 断点   | 宽度      | 布局                                         |
| :----- | :-------- | :------------------------------------------- |
| **xs** | < 640px   | 单列，全宽组件，底部固定按钮。               |
| **sm** | 640-767px | 单列，增加内边距。                           |
| **md** | 768-1023px | 双列，工具卡片 2 列。                       |
| **lg** | 1024-1279px | 居中最大宽度，卡片 3 列。                  |
| **xl** | ≥ 1280px  | 居中 1200px，卡片 4 列。                     |

* 最小触摸目标 **44 × 44px**。
* 二维码区域在手机端隐藏。

### 11.4 加载态

* **工具懒加载：** 骨架屏（Skeleton），模拟布局占位，避免 CLS。
* **语言切换：** 保持旧语言内容可见，加载完成后无缝切换。
* **二维码生成：** 固定 200×200px 占位 + 加载动画。
* **WebSocket 连接：** 状态灯脉冲动画 + "连接中..."。

### 11.5 暗色模式

* 默认跟随系统 `prefers-color-scheme`，CSS 变量统一管理。
* 手动切换开关放入 V2.1。

### 11.6 操作反馈

* **手机端：** 成功触发短震动 `navigator.vibrate(100)`（iOS 优雅降级）。
* **PC 端：** 可选轻提示音（默认关闭）。

### 11.7 PWA

| 项目               | 规范                                                             |
| :----------------- | :--------------------------------------------------------------- |
| **manifest.json**  | `name`/`short_name`/`description` 跟随当前语言。                |
| **图标**           | 192×192 + 512×512（PNG），另备 maskable 版本。                  |
| **离线提示**       | 友好提示页（多语言）。                                          |

**Service Worker 缓存策略：**

| 资源               | 策略                     | 备注说明 |
| :----------------- | :----------------------- | :------- |
| 落地页 HTML        | Stale While Revalidate   |          |
| CSS / JS / 字体    | Cache First              |          |
| 语言包 JSON        | Stale While Revalidate   |          |
| 纯前端工具层级     | Cache First              | **此特性将作为营销痛点宣传，纯前端工具可完全离线使用（如二维码生成与解析工具）。** |
| API / WebRTC 信令  | Network Only             | 弱网不重试缓存 |

### 11.8 无障碍 (a11y)

* 所有可交互元素添加 `aria-label`（跟随语言）。
* 状态指示同时靠颜色 + 文字标签。
* WCAG 2.1 AA 级对比度。
* `<html lang>` 跟随当前语言。

---

## 十二、数据埋点与效果度量

使用 **PostHog 或 Umami**（支持自定义事件、漏斗分析、Pro 转化追踪）。

### 12.1 核心指标

**平台级指标：**

| 指标             | 说明                              | 衡量目标          |
| :--------------- | :-------------------------------- | :---------------- |
| **平台 UV**      | 每日独立访客数                    | SEO/推广效果      |
| **语言分布**     | 各语言 UV 占比                    | 翻译优先级        |
| **工具使用率**   | Start 点击数 / UV                 | 工具吸引力        |
| **工具完成率**   | 完成数 / Start 数                 | 工具体验          |
| **跨工具跳转率** | 工具间推荐点击数 / 展示数         | 交叉推荐效果      |
| **错误分布**     | 各错误码频次                      | 优化方向          |

**各工具专属指标：**

| 工具 | 指标 | 说明 | 衡量目标 |
| :--- | :--- | :--- | :------- |
| **A 文本传输** | 扫码成功率 | 配对数 / 生成二维码数 | 核心流程通畅 |
| **A 文本传输** | P2P 直连率 | P2P 成功数 / 总连接数 | WebRTC 打洞成功率 |
| **A 文本传输** | A→C 转化率 | 点击"升级为共享房间"数 / SUCCESS 状态触发数 | 漏斗转化 |
| **B 二维码** | 生成/解析比 | 生成次数 vs 解析次数 | 功能使用偏好 |
| **B 二维码** | 预设类型分布 | 各预设（纯文本/URL/Wi-Fi/vCard）使用占比 | 功能优先级 |
| **B 二维码** | 嵌入微件引用量 | embed iframe 外部加载次数 | 外链诱饵效果 |
| **C 共享剪贴板** | 房间创建数 | 每日新建房间数 | 需求热度 |
| **C 共享剪贴板** | 房间活跃时长 | 从创建到最后一条消息的时间跨度 | 留存质量 |
| **C 共享剪贴板** | Pro 功能点击率 | 置灰 Pro 按钮点击数 / 房间页 PV | 付费意愿验证 |
| **C 共享剪贴板** | Waitlist 提交率 | 邮箱提交数 / Pro 弹窗展示数 | 转化漏斗 |

### 12.2 埋点方式

* 页面级：PostHog / Umami 自动采集页面访问。
* 事件级：自定义事件上报（`tool_start`、`tool_complete`、`error_code`、`pro_click`、`waitlist_submit`），支持漏斗和转化分析。
* 事件携带 `toolId` + `locale`。不采集用户内容或个人标识。

---

## 十三、开发任务拆分

| 阶段                 | 目标              | 核心任务                                                                                                                                              |
| :------------------- | :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1 (1.5天)**  | 平台骨架 + 通道   | Nuxt 3 + @nuxtjs/i18n；Vitest + Playwright + GitHub Actions CI；Platform Shell（导航、主题、语言切换、骨架屏）；工具注册 + 懒加载路由；多语言路由（根路径英文 + 前缀 + 语言横幅）；PartyKit WebSocket + 心跳；文本传输基础收发；KV 降级；浏览器兼容检测。 |
| **Phase 2 (1天)**    | 安全与体验        | 加密模块（AES-256-GCM + HKDF）+ 单元测试；配对确认；消息序号防重放；状态机；一键复制；空内容防护；错误提示（E001-E010）；404 页面。                   |
| **Phase 3 (1天)**    | 功能完善          | 双向传输；格式保留；断线恢复 + localStorage；手动输入码；暗色模式；Sentry；Analytics 埋点；E2E 测试覆盖核心流程。                                     |
| **Phase 4 (2天)**    | 多语言 + SEO + 上线 | MVP 三语翻译（简中、繁中、英文）+ 多语言快照测试；落地说明页（场景、对比表、FAQ）；隐私政策（含 GDPR）；SEO 自动生成（Meta/OG/hreflang/JSON-LD/Sitemap）；Google/Bing 注册提交；CSP/SRI；PWA；响应式；无障碍；部署 Cloudflare；域名。 |
| **Phase 5 (1天)**    | P1 语言           | 日文 + 韩文翻译与审校；补充 SEO 关键词和落地页内容；提交百度 + Naver。                                                                                |
| **Phase 6 (1天)**    | P2 语言           | 西班牙文 + 法文 + 德文翻译与审校；根据流量数据决定优先级。                                                                                            |
| **Phase 7 (持续)**   | 扩展新工具        | 每工具 0.5-1 天 + 0.5 天多语言翻译，复用共享层，同步补充测试。                                                                                       |

---

## 十四、上线推广计划

| 渠道                  | 动作                                                          | 语言 |
| :-------------------- | :------------------------------------------------------------ | :--- |
| **Product Hunt**      | 英文介绍 + 截图/GIF，周二至周四发布                           | EN   |
| **Hacker News**       | Show HN，强调隐私优先 + 可扩展工具集                         | EN   |
| **V2EX**              | "分享创造"节点                                                | 简中 |
| **PTT / Dcard**       | 科技板块                                                      | 繁中 |
| **GitHub 开源**       | 开源前端，中英双语 README + 在线演示链接                      | 双语 |
| **少数派 / 小众软件** | 投稿推荐                                                      | 简中 |
| **社交媒体**          | 15 秒演示短视频，Twitter/X、小红书、Threads                   | 多语 |
| **Qiita / Zenn**      | 技术文章介绍 E2EE 实现                                       | JA   |

---

## 十五、商业模式与工具定位

### 15.1 MVP 工具定位

| 工具 | 定位 | 收费策略 | 说明 |
| :--- | :--- | :------- | :--- |
| **A 文本传输** | **引流工具** | 永久免费 | 高频刚需、SEO 长尾词丰富，用于吸引自然搜索流量和口碑传播。 |
| **B 二维码** | **引流工具** | 永久免费 | 纯前端零成本，竞品多但体验差（广告多），差异化竞争力强。 |
| **C 共享剪贴板** | **增值工具** | 免费体验 → 订阅制 | MVP 阶段完全免费建立用户习惯；有流量后引入 Pro 订阅。 |

### 15.2 共享剪贴板 Pro 订阅规划（有流量后实施）

**免费版限制（引导升级）：**

| 限制项 | 免费版 | Pro 版 |
| :----- | :----- | :----- |
| 房间有效期 | 24 小时 | 7 天 / 30 天 / 永久 |
| 历史消息条数 | 最近 20 条 | 最近 500 条 |
| 同时活跃房间 | 1 个 | 10 个 |
| 纯文本大小 | 64KB | 1MB |
| 图片大小 | 200KB（前端压缩） | 5MB（原图，走 R2 对象存储） |
| 房间成员数 | 3 台设备 | 10 台设备 |
| E2EE 加密 | 不支持 | 支持 |
| 房间密码保护 | 不支持 | 支持 |
| 自定义房间号 | 不支持 | 支持（如 `/clipboard/r/my-team`） |

> **定价参考：** $3-5/月 或 $30-50/年，对标同类产品（如 cl1p.net Pro、Pastebin Pro）。MVP 阶段不实现付费功能，仅在 UI 上预留"升级 Pro"入口做需求验证。

**实施节奏：**
1. **MVP 阶段**：工具 C 完全免费，无任何限制（当前文档中的 100 条/10 设备/24h 规格）。
2. **验证阶段**：当日活 UV > 500 时，在 UI 上放置"Pro 即将上线"预告 + 邮件收集，测试付费意愿。
3. **上线阶段**：降低免费版规格（见上表），上线 Pro 订阅。需接入支付（Stripe / LemonSqueezy）和账户系统。

### 15.3 引流漏斗

```
SEO 自然流量 / 社交推广
        │
        ▼
  工具 A（文本传输）← 高频刚需，搜索量大
  工具 B（二维码）  ← 竞品体验差，差异化引流
        │
        │  交叉推荐 + 使用页顶部工具切换栏
        ▼
  工具 C（共享剪贴板）← 体验后留存
        │
        │  免费版限制 + Pro 升级引导
        ▼
  Pro 订阅（$3-5/月）
```

---

## 十六、后续规划 (V2.1+)

### 16.1 候选工具

| 工具           | 分类     | 复杂度 | 复用共享模块             |
| :------------- | :------- | :----- | :----------------------- |
| JSON 格式化    | format   | 低     | clipboard, theme         |
| Base64 编解码  | convert  | 低     | clipboard, theme         |
| URL 编解码     | convert  | 低     | clipboard, theme         |
| 图片压缩       | convert  | 中     | file, clipboard, theme   |
| 密码生成器     | generate | 低     | crypto, clipboard, theme |
| 文本加密记事本 | encrypt  | 中     | crypto, storage, theme   |
| 文件加密传输   | transfer | 高     | crypto, websocket, file  |
| Markdown 预览  | format   | 中     | clipboard, theme         |
| 正则表达式测试 | other    | 中     | clipboard, theme         |

### 16.2 平台级迭代

* **同一局域网免扫快连：** 基于 IP 的设备特征库自动扫描同个 Wi-Fi 下的用户列表，如 Apple AirDrop/Snapdrop 一样免连。
* **共享剪贴板 Pro 上线：** 实施订阅制（见第十五章），接入 Stripe/LemonSqueezy 支付 + 轻量账户系统。
* **持久化历史跨端同步：** 云化基于主密码离线解密的同步能力。
* **手动暗色切换：** 页面内主题切换按钮。
* **工具收藏/常用：** 首页展示最常使用的工具。
* **浏览器扩展：** Chrome/Firefox 扩展，快速唤起任意工具。
* **更多语言：** 根据流量数据按需新增（葡萄牙语、阿拉伯语等）。
* **API 接口：** 开放部分工具的 API 供开发者集成。
