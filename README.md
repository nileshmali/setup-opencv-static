# GitHub Action to setup OpenCV static libraries

[![GitHub Super-Linter](https://github.com/nileshmali/setup-opencv-static/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/nileshmali/setup-opencv-static/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/nileshmali/setup-opencv-static/actions/workflows/check-dist.yml/badge.svg)](https://github.com/nileshmali/setup-opencv-static/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/nileshmali/setup-opencv-static/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/nileshmali/setup-opencv-static/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action sets up OpenCV static libraries on Linux. (Windows and macOS coming soon!)

## Inputs

| Name             | Description                      | Default value            |
| ---------------- | -------------------------------- | ------------------------ |
| `opencv-version` | OpenCV version to be installed.  | latest available release |
| `opencv-contrib` | Install OpenCV contrib modules.  | false                    |
| `github-token`   | GitHub token to download OpenCV. | -                        |
| `with-sccache`   | Use sccache to speed up build.   | false                    |

_NOTE_: To use `sccache` please setup [sccache-action](https://github.com/marketplace/actions/sccache-action) before using this action.

## Usage

```yaml
- uses: nileshmali/setup-opencv-static
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    with-sccache: 'true'
    opencv-contrib: false
```

## License

MIT License
