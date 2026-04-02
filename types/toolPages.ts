export interface ClipboardMessage {
  id: string
  content: string
  type: 'text' | 'image'
  isSelf: boolean
  time: string
}

export interface ClipboardPastRoom {
  id: string
  name: string
  desc: string
  active: boolean
  time: string
  createdAt: number
  e2ee: boolean
}

export interface SearchFilter {
  key: string
  label: string
}

export interface RoomMember {
  name: string
  initials: string
  role: string
  isAdmin: boolean
  avatarClass: string
}

export interface VoteFeature {
  icon: string
  title: string
  votes: string
  desc: string
}

export interface RecentTransferItem {
  icon: string
  name: string
  desc: string
  time: string
}

export interface DeviceHistoryItem {
  icon: string
  name: string
  time: string
  online: boolean
}

export interface TransferHistoryItem {
  name: string
  size: string
  icon: string
  iconBg: string
  iconColor: string
  device: string
  deviceIcon: string
  time: string
  status: string
  statusClass: string
  dotClass: string
}

export interface SecurityLogItem {
  time: string
  msg: string
  color: string
}

export type ClipboardViewState = 'entry' | 'room' | 'history' | 'search' | 'settings'
export type TransferState = 'waiting' | 'pairing' | 'transferring' | 'success' | 'reconnecting' | 'fileQueue' | 'deviceHistory' | 'transferHistory' | 'e2eeAudit'
