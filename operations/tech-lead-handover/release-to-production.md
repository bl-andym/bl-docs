## Release to Production
Sharepoint video: Workshop: Tech lead handover, PR into main

### Precondition

Sprint has been deployed to NLE and approved.  
This means **“How to do a release” steps 1 through 3 are already complete**.

---

## Create the PR from `sprint` into `main`

Make sure the PR is approved and merged into `main`.

In the GitHub PR view:

- Select the `sprint` branch from **Compare**
- Select `main` from **base**
- Select **Create pull request**

Configure the PR as follows:

- Add reviewers  
- Add labels (`maintenance`)  
- Add a description  
- Name the PR as the release version, for example: `release 3.n.n`

Once approved, **GitHub Actions** fires and kicks off testing.

When tests are complete:

- Click **Able to merge**  
- Click **Merge pull request**  
- Click **Confirm merge**

---

## Deploy to Production *(vid: 17:40 / 46:56)*

In **GitHub → Actions**:

- In **LHC**
- Select **Deploy Production**
- Click **Run workflow** (manually run the workflow)

**Workflow settings**:

- Use workflow from → select `main` from the dropdown

Options to check:

- Deploy web app  
- Deploy Sanity Studio  
- Deploy Storybook  

Then:

- click Run workflow  
- wait... Let `deploy-production.yml` run its course  

---

## Monitor the Production Release in DevOps *(vid: 21:17 / 46:56)*

DevOps:  
https://dev.azure.com/BritishLibrary-Official/BL%20Web/_release?_a=releases&view=mine&definitionId=8

In DevOps:

- Go to **LHC → Releases**  
- Under **Search all pipelines**, select the folder icon  
- In **All pipelines** → **BL Web Foundations folder** → **Release Production**

wait... when ready, the new release iteration is listed at the top:

- Example: `Release 26` *(vid: 22:52 / 46:56)*  
- Status shows **Deploy to…** with spinning icon  

Click the new release iteration.

### Continuous deployment view (*vid: 30:58 / 46:56*)

- Infograph box: **Continuous deployment** (Package)
- Infograph box: **Deploy to staging** shows **Succeeded** (Slot)
- Infograph box: **Promote to production** shows **Approve** button (Switch the slot)
- Before Approve, check version in browser, should be the old version (before Approve clicked)

Once Approved is clicked we go to new Release view:

- Under **Promote to Production**:
	- Use **View logs** to see deployment progress
		- Under Deployment process (LHC)
			- Pre-deployment approvals (Approved)
			- Agent job - Deploy applications (in progress)
	- Click **Approve** under a developer name 

---

## Create Release Notes (*vid: 35:32 / 46:56*)

In **GitHub → Releases**:

- Select **Draft a new release**  
- Select tag → create a new tag (e.g. `v3.0.0`) → confirm  
- Target → `main`  
- click Generate release notes (auto process from commit messages)  
- check Set as the latest release  
- click Publish release  

---

## Final Production Approval in DevOps (*vid: 39:29 / 46:56*)

Back to DevOps:

- Check version in the browser bl.uk/version before Approval
- Go to **Pipelines (LHC)**  
- Open **Deployment process** (middle column)  
- Open **Post-deployment approvals**
- Click **Approve** (under developer name)
	- Add comment  

---

## PR from `main` back into `develop` (*vid: 42:05 / 46:56*)

In GitHub:

- Compare: `main` → `develop`  
- Click **Create pull request**

Configure:

- Add title (or use auto)  
- Add reviewers  
- Add labels (`no-release-notes`)  
- Add description  

wait... GitHub Actions → checks run automatically  

---

## Branch Flow

1. Feature cut from `develop`  
2. Feature merged back to `develop`  
3. Sprint cut from `develop`  
4. Sprint merged into `main`  
5. `main` merged into `develop`  
6. `develop` cut feature  
