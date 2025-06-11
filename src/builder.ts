import {restoreCache, saveCache} from '@actions/cache'
import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {mkdirP} from '@actions/io'
import * as crypto from 'crypto'
import {BuildDir, CacheHit, CachePrimaryKey} from './constants.js'
import {nproc, platform} from './system.js'

export async function buildAndInstallOpenCV(version: string): Promise<void> {
  const buildArgs = [
    '-D BUILD_CUDA_STUBS=OFF',
    '-D BUILD_DOCS=OFF',
    '-D BUILD_EXAMPLES=OFF',
    '-D BUILD_IPP_IW=ON',
    '-D BUILD_ITT=ON',
    '-D BUILD_JASPER=OFF',
    '-D BUILD_JAVA=OFF',
    '-D BUILD_JPEG=ON',
    '-D BUILD_OPENEXR=OFF',
    '-D BUILD_OPENJPEG=ON',
    '-D BUILD_PERF_TESTS=OFF',
    '-D BUILD_PNG=ON',
    '-D BUILD_PROTOBUF=ON',
    '-D BUILD_SHARED_LIBS=OFF',
    '-D BUILD_TBB=OFF',
    '-D BUILD_TESTS=OFF',
    '-D BUILD_TIFF=ON',
    '-D BUILD_WEBP=ON',
    '-D BUILD_WITH_DEBUG_INFO=OFF',
    '-D BUILD_WITH_DYNAMIC_IPP=OFF',
    '-D BUILD_ZLIB=ON',
    '-D BUILD_opencv_apps=OFF',
    '-D BUILD_opencv_python2=OFF',
    '-D BUILD_opencv_python3=OFF',
    '-D CMAKE_BUILD_TYPE=Release',
    '-D CV_DISABLE_OPTIMIZATION=OFF',
    '-D CV_ENABLE_INTRINSICS=ON',
    '-D ENABLE_CONFIG_VERIFICATION=OFF',
    '-D ENABLE_FAST_MATH=OFF',
    '-D ENABLE_LTO=OFF',
    '-D ENABLE_PIC=ON',
    '-D ENABLE_PRECOMPILED_HEADERS=OFF',
    '-D INSTALL_CREATE_DISTRIB=OFF',
    '-D INSTALL_C_EXAMPLES=OFF',
    '-D INSTALL_PYTHON_EXAMPLES=OFF',
    '-D BUILD_NEW_PYTHON_SUPPORT=OFF',
    '-D INSTALL_TESTS=OFF',
    '-D OPENCV_ENABLE_MEMALIGN=OFF',
    '-D OPENCV_ENABLE_NONFREE=ON',
    '-D OPENCV_FORCE_3RDPARTY_BUILD=OFF',
    '-D OPENCV_GENERATE_PKGCONFIG=OFF',
    '-D PROTOBUF_UPDATE_FILES=OFF',
    '-D WITH_1394=OFF',
    '-D WITH_ADE=ON',
    '-D WITH_ARAVIS=OFF',
    '-D WITH_CLP=OFF',
    '-D WITH_CUBLAS=OFF',
    '-D WITH_CUDA=OFF',
    '-D WITH_CUFFT=OFF',
    '-D WITH_EIGEN=ON',
    '-D WITH_FFMPEG=OFF',
    '-D WITH_GDAL=OFF',
    '-D WITH_GDCM=OFF',
    '-D WITH_GIGEAPI=OFF',
    '-D WITH_GPHOTO2=OFF',
    '-D WITH_GSTREAMER=OFF',
    '-D WITH_GSTREAMER_0_10=OFF',
    '-D WITH_GTK=OFF',
    '-D WITH_GTK_2_X=OFF',
    '-D WITH_HALIDE=OFF',
    '-D WITH_IMGCODEC_HDcR=ON',
    '-D WITH_IMGCODEC_PXM=ON',
    '-D WITH_IMGCODEC_SUNRASTER=ON',
    '-D WITH_INF_ENGINE=OFF',
    '-D WITH_IPP=ON',
    '-D WITH_ITT=ON',
    '-D WITH_JASPER=OFF',
    '-D WITH_JPEG=ON',
    '-D WITH_LAPACK=OFF',
    '-D WITH_LIBV4L=OFF',
    '-D WITH_MATLAB=OFF',
    '-D WITH_MFX=OFF',
    '-D WITH_OPENCL=OFF',
    '-D WITH_OPENCLAMDBLAS=OFF',
    '-D WITH_OPENCLAMDFFT=OFF',
    '-D WITH_OPENCL_SVM=OFF',
    '-D WITH_OPENEXR=OFF',
    '-D WITH_OPENGL=OFF',
    '-D WITH_OPENMP=OFF',
    '-D WITH_OPENNI2=OFF',
    '-D WITH_OPENNI=OFF',
    '-D WITH_OPENVX=OFF',
    '-D WITH_PNG=ON',
    '-D WITH_PROTOBUF=ON',
    '-D WITH_PTHREADS_PF=ON',
    '-D WITH_PVAPI=OFF',
    '-D WITH_QT=OFF',
    '-D WITH_QUIRC=ON',
    '-D WITH_TBB=ON',
    '-D WITH_TIFF=ON',
    '-D WITH_UNICAP=OFF',
    '-D WITH_V4L=ON',
    '-D WITH_VA=ON',
    '-D WITH_VA_INTEL=ON',
    '-D WITH_VTK=OFF',
    '-D WITH_WEBP=ON',
    '-D WITH_XIMEA=OFF',
    '-D WITH_XINE=OFF',
    '-D BUILD_opencv_freetype=OFF',
    '-D OPENCV_FORCE_3RDPARTY_BUILD=ON',
    '-D WITH_FREETYPE=OFF'
  ]

  if (core.getInput('opencv-contrib') === 'true') {
    buildArgs.push(`-D OPENCV_EXTRA_MODULES_PATH=/opt/opencv_contrib/opencv_contrib-${version}/modules`)
  }

  if (core.getBooleanInput('with-sccache')) {
    const sccachePath = process.env.SCCACHE_PATH
    core.info(`Using sccache at ${sccachePath}`)
    buildArgs.push(`-D CMAKE_C_COMPILER_LAUNCHER=${sccachePath}`)
    buildArgs.push(`-D CMAKE_CXX_COMPILER_LAUNCHER=${sccachePath}`)
  }

  buildArgs.push(`/opt/opencv/opencv-${version}`)
  const hash = computeHash(buildArgs)
  const cacheKey = `opencv-build-${version}-${platform()}-${process.arch}-${hash}`
  core.saveState(CachePrimaryKey, cacheKey)
  const cacheHit = Boolean(await restoreCache([BuildDir], cacheKey))
  core.setOutput(CacheHit, cacheHit)
  if (!cacheHit) {
    core.startGroup('Compile OpenCV')
    // Create build directory
    await mkdirP(BuildDir)
    await exec('cmake', [`-B ${BuildDir}`, ...buildArgs])
    await exec(`make -j${nproc()} -C ${BuildDir}`)
    const cacheId = await saveCache([BuildDir], cacheKey)
    if (cacheId !== -1) {
      core.info(`Cache saved with the key: ${cacheKey}`)
    }
    core.endGroup()
  }
  core.startGroup('Install OpenCV')
  await exec(`sudo make -j${nproc()} -C ${BuildDir} install`)

  core.exportVariable(
    'OPENCV_LINK_LIBS',
    'opencv_highgui,opencv_objdetect,opencv_dnn,opencv_calib3d,opencv_features2d,opencv_stitching,opencv_flann,opencv_videoio,opencv_video,opencv_ml,opencv_imgcodecs,opencv_imgproc,opencv_core,libittnotify,libtbb,liblibwebp,liblibtiff,liblibjpeg-turbo,liblibpng,liblibopenjp2,libippiw,libippicv,liblibprotobuf,libquirc,libzlib'
  )
  core.endGroup()
}

function computeHash(strings: string[]): string {
  const hash = crypto.createHash('sha256')
  for (const str of strings) {
    hash.update(str)
  }
  return hash.digest('hex')
}
