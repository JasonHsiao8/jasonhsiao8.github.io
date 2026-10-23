# Chia Hung Hsiao — Portfolio

Bilingual portfolio covering AI accelerators, FPGA, and digital IC design.

- English: https://jasonhsiao8.github.io/
- 繁體中文：https://jasonhsiao8.github.io/zh.html
- Content editor: /admin/ (owner authentication required; initial CMS connection pending)

## Build and test
Node.js 22 or later. No dependency installation required.

    npm test
    npm run build

GitHub Pages publishes the generated dist/ directory using .github/workflows/pages.yml.
Content lives in content/en.json and content/zh.json. The CMS edits those documents independently.
The website has no ChatGPT runtime or subscription dependency.

## CMS setup
The prepared Traditional Chinese editor uses Decap CMS with the Turbo GitHub backend.
Connect only this repository in the Turbo GitHub App, create a site using main and admin/config.yml,
and set the admin interface URL to https://jasonhsiao8.github.io/admin/.
Then run:

    node scripts/configure-cms.mjs SITE_ID https://jasonhsiao8.github.io

The Site ID is configuration, not a credential. Never commit tokens or passwords.
Do not grant editor roles to visitors. Configure the owner account in the CMS provider.
