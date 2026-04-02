export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  author: string
}

export function useBlogPosts(): BlogPost[] {
  return [
    {
      slug: 'payment-paypal-crypto-qr-code-generator-guide',
      title: 'Payment QR Code Generator: PayPal and Crypto Link QR Guide',
      description: 'Learn how to create payment QR codes for PayPal links, crypto wallet addresses, and invoice URLs with PNG/SVG export and scan-safe best practices.',
      date: '2026-04-02',
      tags: ['QR Code', 'Payment QR', 'PayPal', 'Crypto', 'Finance', 'Guide'],
      author: 'ToolPort Team',
    },
    {
      slug: 'vcard-contact-business-card-qr-code-guide',
      title: 'vCard QR Code Generator: Contact & Business Card QR Setup',
      description: 'Create contact and business card QR codes for events, sales, and networking. Share details in one scan with brand-ready designs.',
      date: '2026-04-02',
      tags: ['QR Code', 'vCard', 'Contact QR', 'Business Card', 'Networking'],
      author: 'ToolPort Team',
    },
    {
      slug: 'menu-qr-code-generator-for-restaurants',
      title: 'Menu QR Code Generator for Restaurants: Fast Setup Guide',
      description: 'Create restaurant menu QR codes that scan fast and print clearly. Includes placement and design tips for cafes and food businesses.',
      date: '2026-04-02',
      tags: ['QR Code', 'Menu QR', 'Restaurant', 'Cafe', 'Guide'],
      author: 'ToolPort Team',
    },
    {
      slug: 'google-review-qr-code-generator-guide',
      title: 'Google Review QR Code Generator: Get More Reviews from Offline Customers',
      description: 'Turn your Google review link into a QR code and place it on receipts, tables, and counters to increase review conversion.',
      date: '2026-04-02',
      tags: ['QR Code', 'Google Review', 'Local SEO', 'Reputation', 'Guide'],
      author: 'ToolPort Team',
    },
    {
      slug: 'wifi-qr-code-generator-guide',
      title: 'WiFi QR Code Generator: Share WiFi Password with a QR Code',
      description: 'Create WiFi QR codes for guests and events. Share network access instantly with printable PNG/SVG QR assets.',
      date: '2026-04-02',
      tags: ['QR Code', 'WiFi QR', 'Password Sharing', 'No Signup', 'Guide'],
      author: 'ToolPort Team',
    },
    {
      slug: 'best-airdrop-alternative-for-windows-2026',
      title: 'Best AirDrop Alternative for Windows in 2026 - Free, No App, No Signup',
      description: 'Looking for an AirDrop alternative for Windows? Learn a fast cross-platform workflow to transfer files from iPhone or Android to Windows with no app install and no signup.',
      date: '2026-04-01',
      tags: ['AirDrop Alternative', 'Windows', 'Phone to PC', 'File Transfer', 'No App', 'No Signup'],
      author: 'ToolPort Team',
    },
    {
      slug: 'best-free-ai-tools-2025',
      title: '10 Best Free AI Tools Online in 2025 — No Signup Required',
      description: 'Discover the best free AI tools you can use directly in your browser: AI image generator, background remover, writing assistant, text-to-speech, photo enhancer, translator, and more.',
      date: '2025-03-28',
      tags: ['AI Tools', 'Free', 'Online', 'AI Image Generator', 'AI Writing'],
      author: 'ToolPort Team',
    },
    {
      slug: 'free-online-qr-code-generator',
      title: 'Free Online QR Code Generator — Custom Colors, Logo & Batch Export',
      description: 'Generate high-quality QR codes for free. Customize colors, add logos, batch generate from CSV, and download as PNG or SVG. No signup, all processing done locally.',
      date: '2025-03-20',
      tags: ['QR Code', 'Generator', 'Free Tool', 'Batch', 'SVG'],
      author: 'ToolPort Team',
    },
    {
      slug: 'how-to-transfer-files-phone-to-pc',
      title: 'How to Transfer Files from Phone to PC Wirelessly — No App, No USB',
      description: 'The fastest way to send files, photos, and text from Android or iPhone to PC without a cable or app. Free AirDrop alternative — scan a QR code, end-to-end encrypted, no signup.',
      date: '2025-03-15',
      tags: ['File Transfer', 'AirDrop Alternative', 'Phone to PC', 'No App', 'Wireless', 'No USB'],
      author: 'ToolPort Team',
    },
  ]
}
