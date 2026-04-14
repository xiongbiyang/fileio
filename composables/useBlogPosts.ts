export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  author: string
  zhCN?: { title: string; description: string; tags: string[] }
}

export function useBlogPosts(): BlogPost[] {
  return [
    {
      slug: 'fileio-vs-localsend-comparison',
      title: 'FileIO vs LocalSend: Which Is Better for Everyday Phone-to-PC Transfer?',
      description: 'Compare FileIO and LocalSend for no-install phone-to-PC transfer vs app-based LAN sharing. Pick the better workflow for daily cross-device use.',
      date: '2026-04-03',
      tags: ['Comparison', 'LocalSend', 'File Transfer', 'Phone to PC', 'Guide'],
      author: 'FileIO Team',
      zhCN: { title: 'FileIO 与 LocalSend 对比：日常手机传文件到电脑哪个更好？', description: '对比 FileIO 免安装手机传电脑和 LocalSend 局域网应用传输，选择更适合日常跨设备使用的工作流。', tags: ['对比', 'LocalSend', '文件传输', '手机传电脑', '教程'] },
    },
    {
      slug: 'fileio-vs-wetransfer-comparison',
      title: 'FileIO vs WeTransfer: Which Is Better for Fast Device-to-Device Sharing?',
      description: 'Compare FileIO and WeTransfer for direct phone-to-PC transfer versus upload-link delivery. Find the faster workflow for everyday sharing.',
      date: '2026-04-03',
      tags: ['Comparison', 'WeTransfer', 'File Transfer', 'Phone to PC', 'Guide'],
      author: 'FileIO Team',
      zhCN: { title: 'FileIO 与 WeTransfer 对比：快速设备间传输哪个更好？', description: '对比 FileIO 直连手机传电脑和 WeTransfer 上传链接分享，找到日常分享的更快工作流。', tags: ['对比', 'WeTransfer', '文件传输', '手机传电脑', '教程'] },
    },
    {
      slug: 'fileio-vs-snapdrop-comparison',
      title: 'FileIO vs Snapdrop: Which Is Better for Cross-Device Sharing?',
      description: 'Compare FileIO and Snapdrop for same-Wi-Fi sharing and phone-to-PC workflows. See network dependency tradeoffs and choose the right tool.',
      date: '2026-04-03',
      tags: ['Comparison', 'Snapdrop', 'File Transfer', 'Phone to PC', 'Guide'],
      author: 'FileIO Team',
      zhCN: { title: 'FileIO 与 Snapdrop 对比：跨设备共享哪个更好？', description: '对比 FileIO 和 Snapdrop 的同 WiFi 共享和手机传电脑工作流，了解网络依赖差异。', tags: ['对比', 'Snapdrop', '文件传输', '手机传电脑', '教程'] },
    },
    {
      slug: 'fileio-vs-airdrop-comparison',
      title: 'FileIO vs AirDrop: Which Is Better for Phone-to-PC Transfer?',
      description: 'Compare FileIO and AirDrop for iPhone-to-Windows and cross-platform transfer. Understand Apple-only limits and choose the right workflow.',
      date: '2026-04-03',
      tags: ['Comparison', 'AirDrop', 'File Transfer', 'Phone to PC', 'Guide'],
      author: 'FileIO Team',
      zhCN: { title: 'FileIO 与 AirDrop 对比：手机传文件到电脑哪个更好？', description: '对比 FileIO 和 AirDrop 的 iPhone 传 Windows 及跨平台传输能力，了解 Apple 生态限制。', tags: ['对比', 'AirDrop', '文件传输', '手机传电脑', '教程'] },
    },
    {
      slug: 'iphone-to-windows-file-transfer-no-app-guide',
      title: 'iPhone to Windows File Transfer Without App: Fast Browser Workflow',
      description: 'Transfer files from iPhone to Windows without installing apps. Use QR pairing in browser for fast, no-signup cross-device transfer.',
      date: '2026-04-03',
      tags: ['File Transfer', 'iPhone to Windows', 'No App', 'Phone to PC', 'Guide'],
      author: 'FileIO Team',
      zhCN: { title: 'iPhone 传文件到 Windows 无需安装应用：浏览器快速传输', description: '无需安装任何应用即可从 iPhone 传文件到 Windows。使用浏览器 QR 配对实现快速跨设备传输。', tags: ['文件传输', 'iPhone 传 Windows', '免安装', '手机传电脑', '教程'] },
    },
    {
      slug: 'send-large-video-from-phone-to-pc-guide',
      title: 'Send Large Video from Phone to PC: No Cable, No Upload Delay',
      description: 'Send large videos from phone to PC without cable or cloud upload delays. Practical workflow and performance tips for stable transfer.',
      date: '2026-04-03',
      tags: ['File Transfer', 'Large Video', 'Phone to PC', 'Wireless', 'Guide'],
      author: 'FileIO Team',
      zhCN: { title: '手机发送大视频到电脑：无需数据线，无需等待上传', description: '无需数据线或等待云上传即可将大视频从手机传到电脑。实用的工作流和性能优化技巧。', tags: ['文件传输', '大视频', '手机传电脑', '无线', '教程'] },
    },
    {
      slug: 'transfer-files-phone-to-laptop-without-usb-guide',
      title: 'Transfer Files from Phone to Laptop Without USB: Simple QR Pairing',
      description: 'Learn how to transfer files from phone to laptop without USB using browser QR pairing. Works across iPhone, Android, Windows, and Mac.',
      date: '2026-04-03',
      tags: ['File Transfer', 'No USB', 'Phone to Laptop', 'QR Pairing', 'Guide'],
      author: 'FileIO Team',
      zhCN: { title: '手机传文件到笔记本无需 USB：简单 QR 配对', description: '通过浏览器 QR 配对无需 USB 即可将手机文件传到笔记本，支持 iPhone、Android、Windows 和 Mac。', tags: ['文件传输', '无 USB', '手机传笔记本', 'QR 配对', '教程'] },
    },
    {
      slug: 'best-airdrop-alternative-for-windows-2026',
      title: 'Best AirDrop Alternative for Windows in 2026 - Free, No App, No Signup',
      description: 'Looking for an AirDrop alternative for Windows? Learn a fast cross-platform workflow to transfer files from iPhone or Android to Windows with no app install and no signup.',
      date: '2026-04-01',
      tags: ['AirDrop Alternative', 'Windows', 'Phone to PC', 'File Transfer', 'No App', 'No Signup'],
      author: 'FileIO Team',
      zhCN: { title: '2026 年最佳 Windows AirDrop 替代方案 - 免费、免安装、免注册', description: '在寻找 Windows 上的 AirDrop 替代方案？学习从 iPhone 或 Android 传文件到 Windows 的快速跨平台工作流，无需安装应用或注册。', tags: ['AirDrop 替代', 'Windows', '手机传电脑', '文件传输', '免安装', '免注册'] },
    },
    {
      slug: 'best-free-ai-tools-2025',
      title: '10 Best Free AI Tools Online in 2025 — No Signup Required',
      description: 'Discover the best free AI tools you can use directly in your browser: AI image generator, background remover, writing assistant, text-to-speech, photo enhancer, translator, and more.',
      date: '2025-03-28',
      tags: ['AI Tools', 'Free', 'Online', 'AI Image Generator', 'AI Writing'],
      author: 'FileIO Team',
      zhCN: { title: '2025 年 10 款最佳免费在线 AI 工具 — 无需注册', description: '发现可以直接在浏览器中使用的最佳免费 AI 工具：AI 图片生成器、背景移除、写作助手、文字转语音、照片增强、翻译等。', tags: ['AI 工具', '免费', '在线', 'AI 图片生成', 'AI 写作'] },
    },
    {
      slug: 'how-to-transfer-files-phone-to-pc',
      title: 'How to Transfer Files from Phone to PC Wirelessly — No App, No USB',
      description: 'The fastest way to send files, photos, and text from Android or iPhone to PC without a cable or app. Free AirDrop alternative — scan a QR code, end-to-end encrypted, no signup.',
      date: '2025-03-15',
      tags: ['File Transfer', 'AirDrop Alternative', 'Phone to PC', 'No App', 'Wireless', 'No USB'],
      author: 'FileIO Team',
      zhCN: { title: '如何无线传输文件从手机到电脑 — 免安装、免数据线', description: '从 Android 或 iPhone 传文件、照片和文本到电脑的最快方法，无需数据线或应用。免费 AirDrop 替代方案 — 扫码即连，端对端加密，免注册。', tags: ['文件传输', 'AirDrop 替代', '手机传电脑', '免安装', '无线', '免数据线'] },
    },
  ]
}

/** Get localized blog post fields based on locale */
export function getLocalizedPost(post: BlogPost, locale: string): { title: string; description: string; tags: string[] } {
  if (locale === 'zh-CN' && post.zhCN) {
    return post.zhCN
  }
  return { title: post.title, description: post.description, tags: post.tags }
}
