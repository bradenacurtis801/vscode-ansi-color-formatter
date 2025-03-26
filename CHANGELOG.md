# Change Log

All notable changes to the "ansi-color-logger" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Initial release

## [1.1.0] - 2025-03-26
### Added
- Buffer-based rendering of ANSI escape sequences
- Incremental decoration updates on scroll

### Changed
- Replaced full-document scanning with range-based analysis
- Improved performance by caching previous decorations

### Fixed
- Escape sequences no longer affect decoration rendering beyond buffer
