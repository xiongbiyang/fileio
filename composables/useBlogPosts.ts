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
