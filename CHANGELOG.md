# Changelog

All notable changes to SudokuPad Penpa Importer are documented in this file.

## [0.61.0] - 2025-01-17

### Added
- Convert to Metadata and Reduce puzzle data functionality
- Metadata Editor implementation

### Fixed
- Fix for concatenating dashed gridlines
- Fix Metadata editor for undefined msgcorrect

## [0.60.1] - 2024-09-xx

### Added
- Partial support for Penpa Background Image
- Metadata Editor with word-wrap fix

### Fixed
- Fix 'zZ' text in zwegner.github.io/penpa-edit puzzles
- Fix "NaN" string property value
- Fix number with 'White BG' over symbol
- Fix framelines over removed cells
- Fix dark-mode
- Fix JSON editor in light-mode having incorrect dark background

### Changed
- Ensure metadata fields are converted to strings
- Preserve undo buffer when clearing input via [x] button

## [0.54.1] - 2024-xx-xx

### Fixed
- Fix f-puzzle to scl conversion

## [0.54.0] - 2024-xx-xx

### Added
- Remote Fog detection for cages
- Detect Remote Fog cages

### Fixed
- Fix foglink for non-foglink puzzles
- Fix puzzle settings for all puzzle types
- Fix Remote Fog handling
- Fix when there is no remote-fog
- Remove single cell cages on grid corners

### Changed
- Remote-fog doesn't force redirect to beta anymore
- Use Beta for Remote Fog

## [0.53.0] - 2024-xx-xx

### Added
- JSON syntax highlight editor
- Detect cage value with number circle

### Fixed
- Fix kukaru lines on overlay
- Fix number over symbol-above-lines
- Fix default JSON editor appearance in dark mode
- Restore syntax coloring when page is restored

### Changed
- Increase grid size limit to 25 to accommodate future samurai's
- Bypass region and square detection for grids larger than 20x20
- Update workflow versions

## [0.52.1] - 2024-xx-xx

### Added
- Migration to PrimeVue v4
- JSON syntax highlighting

### Fixed
- Fix regression for dashed gridlines
- Fix URL in JSON
- Fix heuristic for single cell cages on grid corners
- Better focus handling on paste and clear

### Changed
- Don't create blank pencilmarks in fog puzzles (to avoid spoilers)
- Don't draw frame lines which are deletelineE
- Make all non-surface underlay items opaque
- Replace double layer with correct alpha
- Draw 'in front of lines' symbol in front of number and its circle
- Upgrade to PrimeVue 3.52.0 to fix Toast issue #5225

## [0.52.0] - 2024-xx-xx

### Added
- Google Analytics integration
- Vue.js migration (major refactor)

### Fixed
- Fix 'short puzzle ID not found' error

### Changed
- Major architecture change: Migrated to Vue.js framework
- Added app.crackingthecryptic.com destination
- Don't make destination 'crackingthecryptic' persistent

## [0.51.0] - 2024-xx-xx

### Added
- Support for f-puzzles to SCL conversion

### Fixed
- Fix surface custom colors
- Fix/Revert puzzleZipper encoding
- Fix minor toJson UX bugs
- Fix penpa-general bug when sanitizing source field

### Changed
- Adjust minimum solution digits ratio

## [0.50.0] - 2024-xx-xx

### Added
- Vitest testing framework
- Build configuration with Vite
- TypeScript conversion (major refactor)

### Fixed
- Fix custom color regression
- Fix to remove single-cell positioning cages
- Fix masked cells
- Fix surface over deleted border
- Fix lattice points on removed cells
- Fix invalid freeline short-line (40)
- Fix for dashed grid

### Changed
- Refactor build config
- Add Vue to config
- Rename PenpaAnalyzer into PenpaPostProcess
- Convert Tapa on cell corner into Quad
- Remove redundant use of target property
- Refactor lattice points
- Refactor types
- Sanity check for too large regions
- Don't remove thin gridlines
- Apply flags.fadeLines only when no line uses custom color
- Update penpa-general.js to latest Penpa version

## [0.23.0] - 2023-xx-xx (Git Tag)

### Changed
- Major version milestone with comprehensive features

## [0.1.22] - 2023-xx-xx (Git Tag)

### Changed
- Stable release with numerous bug fixes

## [0.1.13] - 2023-xx-xx

### Fixed
- Fix region detection for disconnected regions

## [0.1.9] - 2023-xx-xx

### Added
- Add cage metadata and handle multisolution
- Add converter options to test.html

### Fixed
- Fix dashed grid setting
- Fix solution check

### Changed
- Remove explicit metadata killercage
- Remove test buttons from test.html

## [0.1.7] - 2023-xx-xx

### Fixed
- Don't draw separate board outline
- Improve positioning with large outside clues
- Improve surface outline edges for outside clues

### Changed
- Don't add empty solution

## [0.1.5] - 2023-xx-xx

### Fixed
- Improve sudoku region detection for partially covered edges

## [0.1.0] - 2023-xx-xx

### Added
- Initial public release
- Support for Penpa+ puzzle conversion to SudokuPad format
- Support for puzz.link puzzle conversion
- Basic puzzle metadata handling
- TinyURL support
- Short SudokuPad URL support
- JSON import and full drag-and-drop support
- Create TinyURL functionality
- Dark mode support
- Clear button functionality
- Hamburger menu with settings
- Google Tag Manager integration

### Features
- Convert Penpa+ puzzles to SudokuPad format
- Handle killer cages with proper outlining
- Surface and custom color support
- Outside clues support
- Fog puzzle rendering
- Solution check from Solution mode digits
- Region detection for various grid sizes
- Arrow handling and scaling
- Line concatenation and optimization
- Grid boundary detection
- Frame line management
- Symbol and text rendering
- Number circle and arrow positioning
- Lattice point handling
- Masked line support
- Dashed grid support
- Custom cage support

### Fixed
- Numerous rendering issues
- Line drawing and layering
- Symbol positioning
- Color handling
- Border detection
- Killercage value positioning
- Arrow positioning and scaling
- Solution uniqueness check
- Board detection and conflict checker
- Mobile app compatibility

### Changed
- Complete rewrite from original implementation
- Modular architecture
- TypeScript conversion
- Modern build system with Vite
- Vue.js framework integration (later versions)
- PrimeVue UI components

---

## Version Naming Convention

- **Major versions (0.x.0)**: Significant new features or architectural changes
- **Minor versions (0.x.y)**: Bug fixes, small improvements, and incremental updates
- **Tags**: Milestone releases (v0.23.0, v0.1.22)

## Repository Information

- **Repository**: [marktekfan/sudokupad-penpa-import](https://github.com/marktekfan/sudokupad-penpa-import)
- **Website**: [https://marktekfan.github.io/sudokupad-penpa-import/](https://marktekfan.github.io/sudokupad-penpa-import/)
- **License**: See LICENSE and LICENSE-penpa files

## Development Notes

The project has undergone several major transformations:
- Started as a vanilla JavaScript implementation
- Migrated to TypeScript for better type safety
- Adopted Vite as the build system
- Integrated Vue.js framework for UI
- Implemented PrimeVue for modern UI components
- Added comprehensive testing with Vitest

Total commits: 322+
