# Checklist - release-to-production

Source: [[release-to-production]]

## Precondition

- [ ] Sprint has been deployed to NLE
- [ ] Sprint has been approved
- [ ] "How to do a release" steps 1–3 are complete

## Create the PR from `sprint` into `main`

- [ ] Create PR from `sprint` → `main`
- [ ] Add reviewers
- [ ] Add `maintenance` label
- [ ] Add PR description
- [ ] Name PR using release version (e.g. `release 3.n.n`)
- [ ] Wait for GitHub Actions checks to complete successfully
- [ ] Obtain approval
- [ ] Merge PR
- [ ] Confirm merge

## Deploy to Production

- [ ] Open GitHub → Actions
- [ ] Select **Deploy Production**
- [ ] Click **Run workflow**
- [ ] Select `main` in **Use workflow from**
- [ ] Tick **Deploy web app**
- [ ] Tick **Deploy Sanity Studio**
- [ ] Tick **Deploy Storybook**
- [ ] Run workflow
- [ ] Confirm `deploy-production.yml` completes successfully

## Monitor the Production Release in DevOps

- [ ] Open DevOps Release Production pipeline
- [ ] Locate the new release iteration
- [ ] Open the new release iteration
- [ ] Confirm **Continuous deployment** package stage exists
- [ ] Confirm **Deploy to staging** succeeds
- [ ] Verify production site still shows the old version
- [ ] Open **Promote to production**
- [ ] Open deployment logs
- [ ] Confirm pre-deployment approvals are approved
- [ ] Click **Approve**
- [ ] Monitor deployment progress
- [ ] Confirm deployment completes successfully

## Create Release Notes

- [ ] Open GitHub → Releases
- [ ] Draft a new release
- [ ] Create/select release tag (e.g. `v3.0.0`)
- [ ] Set target branch to `main`
- [ ] Generate release notes
- [ ] Review generated release notes
- [ ] Tick **Set as the latest release**
- [ ] Publish release

## Final Production Approval in DevOps

- [ ] Verify `bl.uk/version` before final approval
- [ ] Open Deployment process
- [ ] Open Post-deployment approvals
- [ ] Click **Approve**
- [ ] Add approval comment
- [ ] Verify `bl.uk/version` shows the new release version
- [ ] Verify production site is operating correctly

## PR from `main` back into `develop`

- [ ] Create PR from `main` → `develop`
- [ ] Add reviewers
- [ ] Add `no-release-notes` label
- [ ] Add PR description
- [ ] Wait for GitHub Actions checks to complete successfully
- [ ] Obtain approval
- [ ] Merge PR
- [ ] Confirm merge

## Branch Flow Verification

- [ ] Feature cut from `develop`
- [ ] Feature merged into `develop`
- [ ] Sprint cut from `develop`
- [ ] Sprint merged into `main`
- [ ] `main` merged back into `develop`
- [ ] Future features continue from `develop`

## Release Complete

- [ ] Production deployment completed
- [ ] Release notes published
- [ ] `main` merged back into `develop`
- [ ] Release process complete
