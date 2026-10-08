# 香港奇案：跑馬地檔案 — GitHub Pages Build

A lightweight deployment preview for the Chapter 01 vertical slice.

## GitHub Pages deployment

1. Create a **public** repository, recommended name: `hk-case-ch01-vertical-slice`.
2. Upload all files in this project to the repository root and commit to `main`.
3. Open **Settings → Pages** and select **GitHub Actions** as the source if GitHub asks you to choose a source.
4. Open **Actions → Deploy GitHub Pages** and wait for the workflow to complete.
5. The deployment URL will appear in the workflow's `deploy` job and in **Settings → Pages**.

The Vite config uses `base: './'`, so the site works regardless of the repository name.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
