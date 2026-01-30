# GitHub Pages Setup

## Enable GitHub Pages

The GitHub Actions workflow is configured and ready, but you need to enable GitHub Pages in the repository settings first:

1. Go to: https://github.com/InquiryInstitute/arbor/settings/pages
2. Under "Source", select **"GitHub Actions"**
3. Save the settings

Once enabled, the workflow will automatically deploy on every push to `main`.

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Build the site: `npm run build`
2. The `dist/` folder contains the static site
3. You can deploy this to any static hosting service

## Verify Deployment

After enabling Pages and the workflow completes:

- Site URL: https://inquiryinstitute.github.io/arbor/
- Workflow status: https://github.com/InquiryInstitute/arbor/actions

## Troubleshooting

If the workflow fails:

1. Check that GitHub Pages is enabled (Settings → Pages → Source: GitHub Actions)
2. Verify the workflow has proper permissions (should be automatic with the workflow file)
3. Check the Actions tab for error details
