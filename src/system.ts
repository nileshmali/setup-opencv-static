import os from 'os'

export function isWindows(): boolean {
  return os.platform() === 'win32'
}
export function isLinux(): boolean {
  return os.platform() === 'linux'
}
export function isMac(): boolean {
  return os.platform() === 'darwin'
}

export function platform(): string {
  return os.platform()
}

export function nproc(): number {
  return os.cpus().length
}
