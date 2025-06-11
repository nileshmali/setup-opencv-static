import * as core from '@actions/core'
import * as sys from './system.js'
import {exec} from '@actions/exec'

export async function installDeps(): Promise<void> {
  core.startGroup('Install prerequisites')
  if (sys.isLinux()) {
    await exec('sudo apt-get update')
    await exec('sudo apt-get install -y clang build-essential cmake nasm')
  } else {
    throw new Error(`Unsupported platform '${sys.platform()}'`)
  }
  core.endGroup()
}
