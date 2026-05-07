# Render Deployment Guide

## Overview
This project is a static web application. Render can host it as a **Static Site** that automatically builds and deploys straight from your Git repository. All site assets resolve from the repository root, and `index_bootstrap.html` should serve as the landing page.

## Prerequisites
- Git repository containing this project
- Render account (https://render.com)
- Optional: Custom domain you plan to map to the site

## Files Added for Render
- `render.yaml`: Infrastructure-as-code descriptor that defines the Render static site and ensures `index_bootstrap.html` is the default entry point.

## Deployment Steps
1. **Commit changes**
   - Add `render.yaml` and this guide to your repository
   - Commit and push to the branch Render should deploy from (e.g., `main`)

2. **Create new static site on Render**
   - Login to Render dashboard
   - Click **New** → **Static Site**
   - Connect the Git repository and select the branch to deploy

3. **Configure settings**
   - **Name**: Choose any unique site name (e.g., `prakriti-ml-static`)
   - **Build Command**: Leave blank (no build step required)
   - **Publish Directory**: `.` (root of repository)
   - Enable **Pull Request Previews** if you want preview builds (already set in `render.yaml`)

4. **Deploy**
   - Click **Create Static Site**
   - Render will run the initial build (no-op) and deploy the static files
   - Visit the Render-provided URL `https://<your-site-name>.onrender.com/index_bootstrap.html`

## Redirect & Caching Behavior
`render.yaml` defines:
- **Redirect**: Requests to `/` go to `/index_bootstrap.html`
- **Cache Header**: Adds `Cache-Control: public, max-age=600` to every asset for short-term caching

## Custom Domain (Optional)
1. Go to your Render static site → **Settings**
2. Under **Custom Domains**, add your domain (e.g., `ayurveda.example.com`)
3. Update DNS records as instructed by Render

## Continuous Deployment
- Every push to the configured branch triggers a redeploy
- Monitor build & deploy logs from Render dashboard

---
For contributors: keep this guide updated if the deployment process or directory structure changes.
