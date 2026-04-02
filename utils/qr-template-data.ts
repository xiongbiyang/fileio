export interface QrTemplate {
  key: string
  title: string
  desc: string
  value: string
}

type TranslateFn = (key: string) => string
type BiTranslateFn = (zh: string, en: string) => string

export const TEMPLATE_PRIORITY: Record<string, number> = {
  pdf: 1,
  wifi: 2,
  instagram: 3,
  maps: 4,
  vcard: 5,
  review: 6,
  menu: 7,
  app: 8,
  payment: 9,
  whatsapp: 10,
  email: 11,
  sms: 12,
  form: 13,
  event: 14,
}

export function getQrTemplates(t: TranslateFn, tr: BiTranslateFn): QrTemplate[] {
  return [
    { key: 'wifi', title: t('toolB.templateWifiTitle'), desc: t('toolB.templateWifiDesc'), value: 'WIFI:T:WPA;S:Cafe_WiFi;P:12345678;;' },
    { key: 'vcard', title: t('toolB.templateVcardTitle'), desc: t('toolB.templateVcardDesc'), value: 'BEGIN:VCARD\nVERSION:3.0\nN:Chen;Sarah;;;\nFN:Sarah Chen\nTEL:+15551234567\nEMAIL:sarah@example.com\nEND:VCARD' },
    { key: 'review', title: t('toolB.templateReviewTitle'), desc: t('toolB.templateReviewDesc'), value: 'https://g.page/r/your-business/review' },
    { key: 'menu', title: t('toolB.templateMenuTitle'), desc: t('toolB.templateMenuDesc'), value: 'https://your-restaurant.com/menu' },
    { key: 'payment', title: t('toolB.templatePaymentTitle'), desc: t('toolB.templatePaymentDesc'), value: 'https://paypal.me/yourname' },
    { key: 'whatsapp', title: t('toolB.templateWhatsappTitle'), desc: t('toolB.templateWhatsappDesc'), value: 'https://wa.me/15550101' },
    { key: 'pdf', title: tr('PDF 二维码', 'PDF QR Code'), desc: tr('用于菜单、手册、宣传册等 PDF 链接。', 'Link to a PDF menu, brochure, or document.'), value: 'https://yourdomain.com/files/menu.pdf' },
    { key: 'maps', title: tr('地图位置二维码', 'Google Maps QR'), desc: tr('用于门店导航和线下引流。', 'Send users to your location on maps.'), value: 'https://maps.google.com/?q=Times+Square+New+York' },
    { key: 'app', title: tr('App 下载二维码', 'App Download QR'), desc: tr('用于 iOS/Android 下载落地页。', 'Route users to your app download landing page.'), value: 'https://yourdomain.com/app-download' },
    { key: 'instagram', title: tr('Instagram 二维码', 'Instagram QR'), desc: tr('用于社媒主页和线下引流。', 'Direct users to your Instagram profile.'), value: 'https://instagram.com/yourbrand' },
    { key: 'email', title: tr('邮箱二维码', 'Email QR'), desc: tr('扫码后可快速发邮件。', 'Open email compose with subject/body.'), value: 'mailto:hello@yourdomain.com?subject=Hello&body=Hi%20there' },
    { key: 'sms', title: tr('短信二维码', 'SMS QR'), desc: tr('扫码后快速发短信。', 'Open SMS with prefilled number/message.'), value: 'sms:+15551234567?body=Hi%20ToolPort' },
    { key: 'event', title: tr('活动日历二维码', 'Event Calendar QR'), desc: tr('用于活动报名与日历添加。', 'Share event details in calendar format.'), value: 'BEGIN:VEVENT\nSUMMARY:ToolPort Meetup\nDTSTART:20260710T090000Z\nDTEND:20260710T103000Z\nLOCATION:Online\nDESCRIPTION:Join our product launch.\nEND:VEVENT' },
    { key: 'form', title: tr('表单问卷二维码', 'Form / Survey QR'), desc: tr('用于收集反馈、报名和线索。', 'Drive users to a form or survey page.'), value: 'https://forms.gle/your-survey-id' },
  ]
}

export function getTemplateGuide(templateKey: string | null, isZh: boolean) {
  if (!templateKey) return null
  const title = isZh ? '填写指引' : 'How to Fill This Template'
  const guideMap: Record<string, { summary: string; steps: string[] }> = {
    wifi: { summary: isZh ? '替换 WiFi 名称和密码，保持格式不变。' : 'Replace WiFi name/password and keep the format unchanged.', steps: isZh ? ['1. 修改 S: 后的 WiFi 名称', '2. 修改 P: 后的密码', '3. T: 为加密类型（WPA/WEP/开放）'] : ['1. Replace WiFi name after S:', '2. Replace password after P:', '3. T: is security type (WPA/WEP/open)'] },
    vcard: { summary: isZh ? '按 vCard 规范填写姓名、电话、邮箱。' : 'Fill name, phone, and email using vCard format.', steps: isZh ? ['1. FN: 显示姓名', '2. TEL: 电话（建议带国家区号）', '3. EMAIL: 联系邮箱'] : ['1. FN: display name', '2. TEL: phone number with country code', '3. EMAIL: contact email'] },
    review: { summary: isZh ? '粘贴你的 Google 评价链接即可。' : 'Paste your Google review URL directly.', steps: isZh ? ['1. 复制评价链接', '2. 替换示例 URL', '3. 手机扫码验证跳转'] : ['1. Copy review URL from business profile', '2. Replace sample URL', '3. Test scan on phone'] },
    menu: { summary: isZh ? '填入线上菜单页面链接（建议 https）。' : 'Use your online menu page URL (https recommended).', steps: isZh ? ['1. 粘贴菜单链接', '2. 确认手机可访问', '3. 菜单更新尽量保持同一 URL'] : ['1. Paste your menu URL', '2. Ensure it works on mobile', '3. Keep same URL for future updates'] },
    payment: { summary: isZh ? '替换为你的支付链接（PayPal/收款页）。' : 'Replace with your payment URL (PayPal/payment page).', steps: isZh ? ['1. 粘贴收款链接', '2. 先做小额测试', '3. 再用于正式场景'] : ['1. Paste payment link', '2. Run a small test payment', '3. Use in production'] },
    whatsapp: { summary: isZh ? '替换为你的 WhatsApp 号码链接。' : 'Replace with your WhatsApp number link.', steps: isZh ? ['1. 使用 https://wa.me/你的号码', '2. 带国家区号，不加 + 号', '3. 扫码检查是否能发起聊天'] : ['1. Use https://wa.me/your_number', '2. Include country code without +', '3. Test scan to open chat'] },
    pdf: { summary: isZh ? '使用可公开访问的 PDF 链接。' : 'Use a publicly accessible PDF URL.', steps: isZh ? ['1. 粘贴 PDF 完整链接', '2. 确认手机浏览器可打开', '3. 文件更新后尽量保持 URL 不变'] : ['1. Paste full PDF URL', '2. Ensure it opens on mobile', '3. Keep URL stable when updating file'] },
    maps: { summary: isZh ? '用于门店导航，建议使用精确地图链接。' : 'Use a precise map URL for store navigation.', steps: isZh ? ['1. 在地图应用复制分享链接', '2. 粘贴替换示例链接', '3. 手机扫码验证导航终点'] : ['1. Copy shared map URL', '2. Replace sample URL', '3. Test scan to destination'] },
    app: { summary: isZh ? '建议使用下载落地页统一分发 iOS/Android。' : 'Use a single landing page for iOS/Android routing.', steps: isZh ? ['1. 粘贴 App 下载页 URL', '2. 页面内区分 iOS/Android 按钮', '3. 扫码测试两端跳转'] : ['1. Paste app landing page URL', '2. Add iOS/Android options', '3. Test redirect on both platforms'] },
    instagram: { summary: isZh ? '填入品牌或个人 Instagram 主页链接。' : 'Use your Instagram profile URL.', steps: isZh ? ['1. 粘贴 instagram.com/用户名', '2. 确认账号公开可访问', '3. 扫码检查是否打开正确主页'] : ['1. Paste instagram.com/username', '2. Ensure profile is public', '3. Test scan to profile'] },
    email: { summary: isZh ? '可预填收件人、主题和正文。' : 'Prefill recipient, subject, and body.', steps: isZh ? ['1. 使用 mailto: 格式', '2. subject/body 进行 URL 编码', '3. 多端测试邮件客户端打开'] : ['1. Use mailto: format', '2. URL-encode subject/body', '3. Test on different mail apps'] },
    sms: { summary: isZh ? '可预填手机号和短信内容。' : 'Prefill phone number and SMS message.', steps: isZh ? ['1. 使用 sms: 并带国家区号', '2. body 内容建议简短', '3. 在 iOS/Android 各测一次'] : ['1. Use sms: with country code', '2. Keep message concise', '3. Test on iOS and Android'] },
    event: { summary: isZh ? '用于活动时间、地点和说明快速导入。' : 'Share event time/location/details in one scan.', steps: isZh ? ['1. 填写开始与结束时间', '2. 补充地点与活动描述', '3. 扫码验证能否添加到日历'] : ['1. Fill start/end time', '2. Add location and description', '3. Test adding to calendar'] },
    form: { summary: isZh ? '用于问卷、报名和反馈收集。' : 'Use for survey, signup, and lead capture.', steps: isZh ? ['1. 粘贴表单链接', '2. 手机端检查字段是否易填', '3. 提交后确认回执流程'] : ['1. Paste form URL', '2. Check mobile form usability', '3. Verify submit flow'] },
  }
  const guide = guideMap[templateKey]
  if (!guide) return null
  return { title, summary: guide.summary, steps: guide.steps }
}
