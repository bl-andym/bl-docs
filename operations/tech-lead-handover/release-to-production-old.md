## Release to Production

### Precondition

Sprint has been deployed to NLE and approved.  
This means **“How to do a release” steps 1 through 3 are already complete**.

---

## Create the PR from `sprint` into `main`

Make sure the PR is approved and merged into `main`.

In the GitHub PR view:

- Set **Compare** to `sprint`
- Set **base** to `main`
- Select **Create pull request**

Configure the PR as follows:

- Add reviewers
- Add labels: `maintenance`
- Add a description
- Name the PR as the release version, for example: `release 3.n.n`

Once approved, **GitHub Actions** will run automatically and kick off checks.

When checks are complete:

- Click '**Able to merge**'
- Click '**Merge pull request**'
- Click '**Confirm merge**'

---

## Deploy to Production

In **GitHub → Actions** (vid: 17:40 / 46:56):

- In **LHC**
- Select '**Deploy Production**'
- Click '**Run workflow**' (right of screen)

**Workflow settings**:

- In the dropdown, select '**Use workflow from**' → Branch: `main`

Options to check:

- [tick] **Deploy web app**
- [tick] **Deploy Sanity Studio**
- [tick] **Deploy Storybook**

Then:

- Click **Run workflow**
- Wait for `deploy-production.yml` to complete

---

## Monitor the Production Release in DevOps

DevOps release pipeline (vid: 21:17 / 46:56):

https://dev.azure.com/BritishLibrary-Official/BL%20Web/_release?_a=releases&view=mine&definitionId=8

In DevOps:

- Go to **LHC → Releases**
- Under **Search all pipelines**, select the **folder icon**
- In **All pipelines** → open **BL Web Foundations**
- Select **Release Production**

Wait until the new release iteration appears at the top of the list, for example:

- `Release 26` (vid: 22:52 / 46:56)
- Status shows '**Deploy to…**' with spinning icon

**Click new release listing to open the new iteration.**

### Expected status

- Infograph: Continuous deployment
- Infograph: **Deploy to staging** should show **Succeeded**
- Infograph: **Promote to production** should show an **Approve** button

To continue:

- Click **Approve**
- In the **Promote to Production** view, click **Approve** under a developer name
- Confirm approval via:
  - tick icon
  - “Approved on” date
  - approval date

Use **View logs** to monitor deployment progress.

---

## Create the Release Note

In **GitHub → Releases**:

- Select **Draft a new release**
- Under **Select tag**, create a new tag (e.g. `v3.0.0`)
- Set **Target** to `main`
- Click **Generate release notes**
- Ensure **Set as the latest release** is checked
- Click **Publish release**

---

## Final Production Approval in DevOps

Return to DevOps:

- Go to **Pipelines (LHC)**
- Open **Deployment process**
- Open **Post-deployment approvals**

Before approving:

- Check `bl.uk/version`
- Confirm the new release version is visible

Then:

- Click **Approve**
- Add a comment if required

---

## Create PR from `main` back into `develop`

In GitHub:

- Set **Compare** to `main`
- Set **base** to `develop`
- Click **Create pull request**

Configure:

- Add title (or use auto)
- Add reviewers
- Add label: `no-release-notes`
- Add description

Wait for **GitHub Actions checks** to complete.

---

## Branch Flow

1. Feature cut from `develop`
2. Feature merged into `develop`
3. Sprint cut from `develop`
4. Sprint merged into `main`
5. `main` merged into `develop`
6. New feature cut from `develop`
