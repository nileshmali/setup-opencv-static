import * as core from '@actions/core'
import {getOctokit} from '@actions/github'
import {downloadTool, extractTar} from '@actions/tool-cache'
import {format} from 'util'
import {OutputOpenCVVersion} from './constants.js'

const GZIP_OPENCV_URL = 'https://github.com/opencv/opencv/archive/refs/tags/%s.tar.gz'
const GZIP_CONTRIB_URL = 'https://github.com/opencv/opencv_contrib/archive/refs/tags/%s.tar.gz'

export async function downloadOpenCV(): Promise<string> {
  core.startGroup('Download OpenCV')
  let opencvVersion = core.getInput('opencv-version')
  if (opencvVersion.length === 0) {
    const octokit = getOctokit(core.getInput('github-token', {required: true}))
    const release = await octokit.rest.repos.getLatestRelease({
      owner: 'opencv',
      repo: 'opencv'
    })
    opencvVersion = release.data.tag_name
  }
  core.setOutput(OutputOpenCVVersion, opencvVersion)
  core.info(`try to setup OpenCV version: ${opencvVersion}`)
  const opencvDownloadPath = await downloadTool(format(GZIP_OPENCV_URL, opencvVersion))
  const opencvPath = await extractTar(opencvDownloadPath, '/opt/opencv')
  core.info(`OpenCV extracted to ${opencvPath}`)
  if (core.getBooleanInput('opencv-contrib')) {
    core.info(`try to setup OpenCV contrib version: ${opencvVersion}`)
    const opencvContribDownloadPath = await downloadTool(format(GZIP_CONTRIB_URL, opencvVersion))
    const opencvContribPath = await extractTar(opencvContribDownloadPath, '/opt/opencv_contrib')
    core.info(`OpenCV contrib extracted to ${opencvContribPath}`)
  }
  core.endGroup()
  return opencvVersion
}
