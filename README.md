# Github Action to setup OpenCV static libraries

[![build-test](https://github.com/nileshmali/setup-opencv-static/actions/workflows/test.yml/badge.svg)](https://github.com/nileshmali/setup-opencv-static/actions/workflows/test.yml)

This action sets up OpenCV static libraries on Linux. (Windows and MacOS coming soon!)

## Inputs

| Name             | Description                      | Default value            |
| ---------------- | -------------------------------- | ------------------------ |
| `opencv-version` | OpenCV version to be installed.  | latest available release |
| `opencv-contrib` | Install OpenCV contrib modules.  | false                    |
| `github-token`   | Github token to download OpenCV. | -                        |
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
