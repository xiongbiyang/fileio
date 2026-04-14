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

export interface TransferFileSummary {
  name: string
  size: string
}

export type TransferState = 'waiting' | 'pairing' | 'transferring' | 'success' | 'reconnecting' | 'fileQueue' | 'deviceHistory' | 'transferHistory' | 'e2eeAudit'
