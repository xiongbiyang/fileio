# ToolPort 平台全局 SEO 与增长架构说明书

> **文档定位**：本指南独立于各个业务线工具，专注于平台底层的全局 SEO 流水线和以增长为导向的技术最佳实践。确保即使产品没有外部营销，也能依赖原生搜索展现量（Impressions）取得高自然流量。
> 
> **核心目标**：长尾防守（pSEO）、搜索引擎霸屏（Rich Snippets）、访问极速化（Core Web Vitals）、权重防抖与防内耗（Canonicalization）。

---

## 1. 结构化数据“霸屏”计划 (Schema.org)

单纯的 Meta 标签在现代 SEO 竞争中已沦为廉价基建，高点击率（CTR）取决于抢占 Google 搜索页（SERP）上的特殊展现格式：

| Schema 类型                  | 作用与覆盖面                                                                 | 实施建议结合场景                                                                          |
| :--------------------------- | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `FAQPage`                    | 让每个工具页下的【常见问题】（FAQ）直接被抽取出显示在搜索结果下方（PAA 区域）。 | 必须写进 JSON-LD 中，且针对 8 种语言做独立翻译映射。比如：工具 A 的“局域网安全吗？”等 5 个精华问答。 |
| `WebApplication` / `SoftwareApplication` | 将工具标注为“无需安装的软件应用”，自带 `免费` 和 `浏览器应用` 标签特征。     | `<script type="application/ld+json">` 定义它是不收费的在线服务，吸引大量搜索 `free tool` 的用户。 |
| `BreadcrumbList`             | 让搜索结果中原本冷冰冰丑陋的 URL 变成分类明晰的导航面包屑节点（如：首页 > 分享类）。 | 任何子页面都要挂载，例如：`Home > Tools > File Sharing > Text Transfer`。                 |
| `HowTo`                      | 向搜索引擎申明这是一个“三步完成的任务流”。                                 | 在工具 B（扫码）的教程栏已预设接入。                                                      |

---

## 2. 多语言权重防自残 (Hreflang & Canonicalization)

多语言（8 国本地化）是全球化红利，但配置不当会导致 Google 判断网站生成大量“机器翻译的重复内容（Duplicate Content）”直接降权。

### 2.1 x-default 隐患防范
必须在全站组件头 `<head>` 中生成极其严格的备用语言标签族（`Hreflang`）：

```html
<link rel="alternate" hreflang="en" href="https://toolport.dev/tools/qr-code" />
<link rel="alternate" hreflang="zh-cn" href="https://toolport.dev/zh-CN/tools/qr-code" />
<link rel="alternate" hreflang="es" href="https://toolport.dev/es/tools/qr-code" />
<!-- 核心降维声明：当访客语言不在此列时（如阿拉伯语），请给他们英文版作为默认兜底 -->
<link rel="alternate" hreflang="x-default" href="https://toolport.dev/tools/qr-code" />
```

### 2.2 Canonical 真身绑定
在前端单页应用（SPA）中，用户生成了参数导致 URL 改变（例如：`/tools/qr-code?color=red&bg=white`）。爬虫一旦抓到这几百个杂讯 URL，由于页面主内容全一模一样，会视为内耗惩罚。
**机制**：无论 URL 被污染成什么情况，每个页面里必须咬死当前工具的“最纯粹真身”作为 `Canonical`：
```html
<link rel="canonical" href="https://toolport.dev/tools/qr-code" />
```

---

## 3. 性能预热与 LCP 极限保活 (Core Web Vitals)

作为免登录效率工具，打开网页时任何超过 2 秒的白屏或卡顿都会导致跳出率急速变高，这是最恶劣的 SEO 负面信号。

| 模块                   | 性能压榨与加载延迟策略（Lazy-load & Async）                                                                           |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **重量级前端解析库** | 例如工具 B 解析图码的 `jsQR`。因为绝多数人进来是“生成码”（不需依赖该大组件库），所以要确保只有当用户点击【去读取】Tab 时，才在后台以异步形式拉取：`const jsQR = await import('jsqr')`。 |
| **信令网关/WebRTC**    | 工具 A/C 的核心通讯库，不用在一进网页就阻塞主线程进行 `new WebSocket` 抢占网络。确保在首屏 UI（输入框+按钮）全部飞速绘制呈现给用户眼球后（`requestIdleCallback` 钩子下），再去从容建立通讯。首屏（LCP）永远必须 `< 1.2s` 且不可抖动，让视觉呈现无情领先协议。 |
| **字体加载防白屏**     | 网页字体文件在拉取回溯前，强行指定 `font-display: swap;` 保证能先用系统原生黑体展现出那 8 国翻译文字，而绝不是留白死守自定义字体下载完毕。字体在云端按兵不动，不能拖累骨架。 |

---

## 4. 动态社媒裂变图护城河 (OG Image Automation)

利用我们在工具 A 中设计的“成百上千个解决细分断层痛点的长尾链接”（即 Programmatic SEO），例如：
`https://toolport.dev/how-to/send-pdf-from-phone-to-pc`

如果用户把它转发到 X(Twitter)、Discord 或 iMessage、Facebook，如果没有特色配图便石沉大海。

**自动化边缘制图策略 (Edge OG Image Generation)**：
借助 Nuxt 3 社区的 `@nuxtjs/og-image` 等库，当各大社交平台的抓取机器人（Bot）访问这个长尾路由时：
1. Edge 服务器或无头浏览器拦截请求。
2. 提取路由里的那句 H1 标题：“免装 App：无损传递 PDF 从手机到电脑”。
3. 瞬间贴靠在深邃美丽的暗黑玻璃拟物风格模版上。
4. 返回出这么一张自带字体的封面大图。
**效果**：社媒分享转化点击率（CTR）大幅飙升 400%，海量免费的推荐流量与 Backlink 会形成疯狂对 SEO 加持的反哺。

---

## 5. 上下文密网内链与权重流转 (Contextual Internal Linking)

不要采用独立页面模式做孤岛。除了网页底部冷冰冰的“相关推荐”网格，最高贵的爬虫引导全靠“上下文嵌入式超链”。

**场景接力流水线：**
* 在工具 A（传输文本）成功后，绿色勾选旁弹一个小字推荐语："想让这段跨端文本长期留在云端防丢？试试保存入我们的 👉 **[在线共享剪贴板 (工具 C)]** "。
* 在工具 B（扫码解出长文本后），复制按钮旁闪烁："想立刻在一台陌生的电脑上把这段东西贴出来？使用 👉 **[手机极速跨端 (工具 A)]**"。

*原理*：顺水推舟的不仅是使用者的连贯情绪，更能让搜索引擎蜘蛛感知出你全平台强悍的解决需求联动性，完美传递权重汁流（Link Juice），一拖三，三抗平台。

---

## 6. sitemap & robots 严格索引管控
不要让脏数据进搜索引擎：
* **Robots.txt 禁地**：`Disallow: /*/r/` 强令所有引擎爬虫不得爬取任何形似房间号 `r/` 后缀的链接。这避免爬虫收录进含有动态废料的用户房间导致垃圾页面污染。
* **Sitemap.xml 自动编译**：Sitemap 中要全自动聚合 pSEO 长尾短文和全部 8 个小语种（`xhtml:link` 矩阵级生成）。在每次 CI/CD 部署到 Cloudflare 上时顺势提交 Google `Search Console` 敲门砖。
