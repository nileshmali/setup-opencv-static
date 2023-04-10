import * as core from '@actions/core'
import {getOctokit} from '@actions/github'
import {cacheDir, downloadTool, extractTar} from '@actions/tool-cache'
import {format} from 'util'

const GZIP_OPENCV_URL = 'https://github.com/opencv/opencv/archive/refs/tags/%s.tar.gz'
const GZIP_CONTRIB_URL = 'https://github.com/opencv/opencv_contrib/archive/refs/tags/%s.tar.gz'

export interface OpencvPaths {
  opencv: string
  opencvContrib?: string
}

export async function downloadOpenCV(): Promise<OpencvPaths> {
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
  core.info(`try to setup OpenCV version: ${opencvVersion}`)
  const opencvDownloadPath = await downloadTool(format(GZIP_OPENCV_URL, opencvVersion))
  const opencvPath = await extractTar(opencvDownloadPath)
  core.info(`OpenCV extracted to ${opencvPath}`)
  // Cache opencv
  const cachedOpencvPath = await cacheDir(opencvPath, 'opencv', opencvVersion)
  core.addPath(cachedOpencvPath)
  core.info(`OpenCV cached to ${cachedOpencvPath}`)

  const opencvContrib = core.getBooleanInput('opencv-contrib')
  let cachedOpencvContribPath
  if (opencvContrib) {
    core.info(`try to setup OpenCV contrib version: ${opencvVersion}`)
    const opencvContribDownloadPath = await downloadTool(format(GZIP_CONTRIB_URL, opencvVersion))
    const opencvContribPath = await extractTar(opencvContribDownloadPath)
    core.info(`OpenCV contrib extracted to ${opencvContribPath}`)
    // Cache opencv contrib
    cachedOpencvContribPath = await cacheDir(opencvContribPath, 'opencv-contrib', opencvVersion)
    core.addPath(cachedOpencvContribPath)
    core.info(`OpenCV contrib cached to ${cachedOpencvContribPath}`)
  }
  core.endGroup()
  return {
    opencv: `${cachedOpencvPath}/opencv-${opencvVersion}`,
    opencvContrib: `${cachedOpencvContribPath}/opencv_contrib-${opencvVersion}`
  }
}
