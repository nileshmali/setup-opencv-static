import * as core from '@actions/core'
import {downloadOpenCV} from './downloader'
import {installDeps} from './installer'
import {buildAndInstallOpenCV} from './builder'

async function run(): Promise<void> {
  try {
    await installDeps()
    const paths = await downloadOpenCV()
    await buildAndInstallOpenCV(paths)
  } catch (error) {
    core.error(error as Error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
