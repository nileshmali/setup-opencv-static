import * as core from '@actions/core'
import {downloadOpenCV} from './downloader.js'
import {installDeps} from './installer.js'
import {buildAndInstallOpenCV} from './builder.js'

export async function run(): Promise<void> {
  try {
    await installDeps()
    const paths = await downloadOpenCV()
    await buildAndInstallOpenCV(paths)
  } catch (error) {
    core.error(error as Error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}
