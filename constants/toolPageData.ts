import type {
  DeviceHistoryItem,
  RecentTransferItem,
  SecurityLogItem,
  TransferHistoryItem,
} from '~/types/toolPages'

export const textTransferRecentTransfers: RecentTransferItem[] = [
  { icon: 'image', name: 'IMG_2024_03_12.png', desc: '2.4 MB - Sent to PC', time: '2m' },
  { icon: 'description', name: 'Meeting_Notes.txt', desc: '1 KB - Received from PC', time: '1h' },
]

export const sharedDeviceHistoryItems: DeviceHistoryItem[] = [
  { icon: 'laptop_mac', name: 'MacBook Pro', time: '2h ago', online: true },
  { icon: 'smartphone', name: 'Pixel 8', time: '5h ago', online: true },
  { icon: 'tablet_mac', name: 'iPad Air', time: '2 days ago', online: false },
]

export const textTransferHistoryItems: TransferHistoryItem[] = [
  { name: 'Project_Final_Specs.pdf', size: '4.2 MB', icon: 'description', iconBg: 'bg-primary-fixed/30', iconColor: 'text-primary', device: 'MacBook Pro', deviceIcon: 'laptop_mac', time: 'Mar 28, 10:41', status: 'Completed', statusClass: 'bg-primary-fixed text-on-primary-fixed-variant', dotClass: 'bg-primary' },
  { name: 'photo_july_2024.jpg', size: '8.1 MB', icon: 'image', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container', device: 'Pixel 8', deviceIcon: 'smartphone', time: 'Mar 27, 15:22', status: 'Completed', statusClass: 'bg-primary-fixed text-on-primary-fixed-variant', dotClass: 'bg-primary' },
  { name: 'meeting_notes.txt', size: '12 KB', icon: 'notes', iconBg: 'bg-surface-container-high', iconColor: 'text-on-surface-variant', device: 'iPad Air', deviceIcon: 'tablet_mac', time: 'Mar 25, 09:05', status: 'Archived', statusClass: 'bg-surface-container-high text-on-surface-variant', dotClass: 'bg-on-surface-variant/40' },
]

export const textTransferKeyFingerprint = ['8F:2A:4D', '92:CB:E4', '1F:7B:A3', 'D6:08:9E']

export const textTransferSecurityLogs: SecurityLogItem[] = [
  { time: '10:41:02', msg: '[OK] Handshake complete - P2P established', color: 'text-primary-fixed' },
  { time: '10:41:03', msg: '[OK] DataChannel open - AES-256-GCM active', color: 'text-primary-fixed' },
  { time: '10:41:05', msg: '[INFO] Perfect Forward Secrecy rotation #1', color: 'text-surface/80' },
  { time: '10:41:08', msg: '[OK] Metadata scrubbed - zero-knowledge verified', color: 'text-primary-fixed' },
  { time: '10:42:12', msg: '[INFO] Re-keying triggered - session integrity OK', color: 'text-surface/80' },
]
