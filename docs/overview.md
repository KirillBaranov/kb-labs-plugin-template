# KB Labs Plugin Template Overview

The KB Labs Plugin Template provides a production-ready workspace for authoring plugins that expose CLI commands, REST endpoints, and KB Studio widgets. It demonstrates a pragmatic Domain-Driven Design layering model while embracing the tooling standards enforced across the KB ecosystem.

## Why this template exists

- **Consistency** – give plugin authors a repeatable folder layout, manifest shape, and quality bar.
- **Speed** – scaffold a working HelloWorld plugin with minimal work and evolve from there.
- **Education** – document best practices learned from existing plugins such as `kb-labs-mind` and `kb-labs-devlink`.

## What you get out of the box

- `packages/plugin-cli`: reference plugin package with manifest v2, CLI/REST/Studio layers, tests, and build scripts.
- `docs/`: guides for extending each surface plus architectural conventions.
- `scripts/`: devkit sync wrapper and sandboxes (CLI, REST, Studio) for manual testing.
- `README.md`: quick start instructions and repository layout.

Use this repository as a blueprint for new plugins or fork it to create product-specific variations.

