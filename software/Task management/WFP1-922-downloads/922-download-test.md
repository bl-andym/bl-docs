URL: 
https://fde-app-dev-uks-webfproj-web-105-is-staging-csd0fbhdgwa4d5bw.a01.azurefd.net/

| Component                         | Asset location      | Expected behaviour                 | Tested | Result                                           |
| --------------------------------- | ------------------- | ---------------------------------- | ------ | ------------------------------------------------ |
| **Accordion group**               | Intro/text asset    | Opens same tab, no download icon   | ✅      | **PASS**: PDF opens in browser; no download icon |
| **Accordion group**               | Accordion item text | Opens same tab, no download icon   | ✅      | **PASS**: nested asset links render correctly    |
| Accordion group                   | Opening hours text  | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| Editorial card grid               | Intro text          | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| Email sign-up                     | Caption text        | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| Email sign-up                     | Success text        | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| Highlight banner illustration     | Text                | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| **Highlight banner illustration** | **Button**          | Opens same tab, no download icon   | ✅      | **PASS**                                         |
| Highlight banner image            | Text                | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| **Highlight banner image**        | **Button**          | Opens same tab, no download icon   | ✅      | **PASS**                                         |
| Illustration banner               | Secondary button    | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| Illustration banner               | Outline button      | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| Image set                         | Caption text        | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| **List card banner**              | **Intro text**      | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| **List card banner**              | **Card**            | Opens same tab, no forced download | ✅      | **PASS**: same-tab PDF view, no download icon    |
| **List card banner**              | **Button**          | Opens same tab, no download icon   | ✅      | **PASS**: same-tab PDF view, no download icon    |
| List card grid                    | Text                | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| List card grid                    | Card                | Opens same tab, no forced download | ❌      | **TO TEST**                                      |
| **Media download grid**           | **Text**            | Opens same tab, no download icon   | ✅*     | **PASS based on page testing**                   |
| **Media download grid**           | **Card**            | **Downloads file + download icon** | ✅      | **PASS** — actual browser download completed     |
| Media download grid               | Button              | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| **Regular card grid**             | Intro text          | Opens same tab, no download icon   | ✅*     | **PASS based on visible test content**           |
| Text & image                      | Caption text        | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| Text & image                      | Text                | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| Text & image                      | Secondary button    | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| Text & image                      | Outline button      | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| Text card grid                    | Button              | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| Text image CTA                    | Caption text        | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| Text image CTA                    | Text                | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| Text image CTA                    | Secondary button    | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |
| Text image CTA                    | Outline button      | Opens same tab, no download icon   | ❌      | **TO TEST**                                      |

### Additional merge-specific tests already passed

These weren't all explicit rows in the original ticket but are important because of the conflicts resolved:

|Behaviour|Result|
|---|---|
|Non-BL external URL shows external-link icon|✅ PASS|
|BL/company-domain external URL does **not** show external-link icon|✅ PASS|
|Normal asset does **not** show download icon|✅ PASS|
|Normal PDF asset opens in browser|✅ PASS|
|Media Download Grid asset **does** show download icon|✅ PASS|
|Media Download Grid asset actually downloads|✅ PASS|
|List Card Banner `linkType: Asset` item renders|✅ PASS|
|File metadata such as `(PDF, 1.3MB)` displays|✅ PASS|
