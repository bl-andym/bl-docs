# Deploy to NLE – Guide

## Resources

### Documentation
**Docs:** How to do a release to NLE
**URL:** https://github.com/BritishLibrary-official/BL.Web/blob/develop/docs/how-to-do-a-release.md

### Video
**Workshop:** Tech lead handover – Deploy to NLE  
**URL:**  
https://bluk-my.sharepoint.com/personal/andrew_marsden_bl_uk/_layouts/15/stream.aspx?id=%2Fpersonal%2Fandrew_marsden_bl_uk%2FDocuments%2FRecordings%2FWorkshop+weekly+workshop-20260312_150334-Meeting+Recording.mp4

---

## Release Workflow

### Q: Where do we cut the new Sprint branch from?
**A:** From `develop`

---

### Q: Where do we get the branch name from?
**A:** From Jira releases (elaborate)

- Navigate to **Jira → Releases**
- Select the current sprint/release version
- Use the release name as the branch name

---

### Q: When do we run `npm version`?
**A:** After creating the sprint branch  

- This updates the version in `package.json`

---

### Q: When do we publish?
**A:** After running `npm version`

---

### Q: What next?

1. Go to **GitHub → Actions**
2. Select workflow: **LHC - Deploy NLE**

#### Devops deploys:
Release pipeline for NLE
https://dev.azure.com/BritishLibrary-Official/BL%20Web/_release?_a=releases&view=mine&definitionId=3
https://fde-app-dev-uks-webfproj-web-105-is-staging-csd0fbhdgwa4d5bw.a01.azurefd.net/version
#### Checks

- Review **Agent job**
  - Slots: `BL NLE Slot`

- Go to: `https://fde-app-dev-uks-webfproj-web-105-is-staging-csd0fbhdgwa4d5bw.a01.azurefd.net/version`
  - Check:
    - `version: n`
    - `commitHash` (from GitHub)

---

## Summary

- Branch from `develop`
- Use Jira release name
- Run `npm version`
- Publish
- Trigger **LHC - Deploy NLE**
- Validate version + commit in staging url
