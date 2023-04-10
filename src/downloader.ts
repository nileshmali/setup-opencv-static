import {restoreCache, saveCache} from '@actions/cache'
import * as core from '@actions/core'
import {getOctokit} from '@actions/github'
import {downloadTool, extractTar} from '@actions/tool-cache'
import {format} from 'util'
import {platform} from './system'

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
  const dirs = ['/opt/opencv', '/opt/opencv_contrib']
  core.info(`try to setup OpenCV version: ${opencvVersion}`)
  const opencvCacheKey = `opencv-${opencvVersion}-${platform()}-${process.arch}`
  const cacheId = await restoreCache(dirs, opencvCacheKey)
  if (cacheId == null) {
    core.info(`cache not found for key: ${opencvCacheKey}`)
    const opencvDownloadPath = await downloadTool(format(GZIP_OPENCV_URL, opencvVersion))
    const opencvPath = await extractTar(opencvDownloadPath, '/opt/opencv')
    core.info(`OpenCV extracted to ${opencvPath}`)
    const opencvContrib = core.getBooleanInput('opencv-contrib')
    if (opencvContrib) {
      core.info(`try to setup OpenCV contrib version: ${opencvVersion}`)
      const opencvContribDownloadPath = await downloadTool(format(GZIP_CONTRIB_URL, opencvVersion))
      const opencvContribPath = await extractTar(opencvContribDownloadPath, '/opt/opencv_contrib')
      core.info(`OpenCV contrib extracted to ${opencvContribPath}`)
    }
    await saveCache(dirs, opencvCacheKey)
  }
  core.endGroup()
  return opencvVersion
}
