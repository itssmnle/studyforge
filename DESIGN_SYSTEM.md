# StudyForge interface standard

The live source of truth is the token block in `src/styles/DesignSystem.css`.

## Type scale

- Display: `--type-display`, homepage and campaign heroes only.
- Page title: `--type-page-title`, one `h1` per routed page.
- Section title: `--type-section-title`, major `h2` headings.
- Subtitle: `--type-subtitle`, feature and subsection headings.
- Card title: `--type-card-title`, card and panel titles.
- Body: `--type-body`; body large: `--type-body-lg`.
- Supporting text: `--type-small`; metadata only: `--type-micro`.

Titles always use a flat text colour. Gradients belong on large background surfaces, never inside text.

## Layout scale

- Maximum content width: `--layout-max`, 1200px.
- Course navigation: `--course-rail-width`, 210px; collapsed: 56px.
- Topic navigation: `--topic-rail-width`, 300px.
- Reading column: `--reading-width`, 760px.
- Desktop content gutter: `--content-gutter`, 48px.

## Shape and depth

- 8px for controls and list rows.
- 12px for ordinary cards.
- 16px for large panels.
- 24px for campaign surfaces only.
- List hierarchies stay flat. Shadows are reserved for raised navigation, floating menus, and hero previews.

## Colour

Use the active subject colour for course navigation and progress. Use the StudyForge accent for global actions. Use `--hero-surface-gradient` only for broad hero or call-to-action backgrounds.
