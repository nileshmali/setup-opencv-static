import * as core from '@actions/core'
import {OpencvPaths} from './downloader'
import {exec} from '@actions/exec'
import {mkdirP, rmRF} from '@actions/io'
import {saveCache, restoreCache} from '@actions/cache'
import {nproc, platform} from './system'

const BUILD_DIR = '/opt/opencv/build'

export async function buildAndInstallOpenCV(paths: OpencvPaths): Promise<void> {
  core.startGroup('Build and install OpenCV')
  core.info(`Build directory: ${BUILD_DIR}`)
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
    '-D BUILD_TBB=ON',
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
    '-D OPENCV_GENERATE_PKGCONFIG=ON',
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

  if ((paths.opencvContrib ?? '').length > 0) {
    buildArgs.push(`-D OPENCV_EXTRA_MODULES_PATH=${paths.opencvContrib}/modules`)
  }

  if (core.getBooleanInput('with-sccache')) {
    buildArgs.push('-D CMAKE_C_COMPILER_LAUNCHER=sccache')
    buildArgs.push('-D CMAKE_CXX_COMPILER_LAUNCHER=sccache')
  }

  buildArgs.push(paths.opencv)
  const cacheKey = `opencv-${paths.version}-${platform()}-${process.arch}`
  const cacheHit = await restoreCache([BUILD_DIR], cacheKey)
  if (!cacheHit) {
    // Create build directory
    await mkdirP(BUILD_DIR)

    await exec('cmake', [`-B ${BUILD_DIR}`, ...buildArgs])
    await exec('make', [`-j${nproc()}`, `-C ${BUILD_DIR}`])
  }
  await exec(`sudo make -j${nproc()} -C ${BUILD_DIR} install`)

  await saveCache([BUILD_DIR], cacheKey)
  core.endGroup()

  core.startGroup('Cleanup')
  await rmRF(paths.opencv)
  if ((paths.opencvContrib ?? '').length > 0) {
    await rmRF(paths.opencvContrib ?? '')
  }
  core.endGroup()
}
