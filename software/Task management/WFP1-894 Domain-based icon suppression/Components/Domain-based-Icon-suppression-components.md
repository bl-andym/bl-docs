
| Component            | Available in page types                | Home page | Content / Overview / Hub   | Mapper                           | Link handling change                              |
| -------------------- | -------------------------------------- | --------- | -------------------------- | -------------------------------- | ------------------------------------------------- |
| List card banner     | Content, Hub, Overview, Homepage       | Object    | Reference                  | map-list-card-grid-and-banner    | Pass `mappedLink?.href`                           |
| List card grid       | List pages                             | —         | Reference (list page only) | map-list-card-grid-and-banner    | Pass `mappedLink?.href`                           |
| Media download grid  | Overview, Hub, Content                 | —         | Reference                  | map-media-download-grid          | Pass `mappedLink?.href`                           |
| Regular card grid    | Content, Hub, Overview                 | Object    | Reference                  | map-card-grid                    | Pass `mappedLink?.href` or `base.link?.href`      |
| Standard card banner | Content, Hub, Overview, Homepage       | Object    | Reference                  | map-card-grid (cards with links) | Align link handling with `map-card-grid`          |
| Text card grid       | Content, Hub, Overview, Homepage       | —         | —                          | map-text-card-banner             | Pass `mappedLink?.href`                           |
| Text image CTA       | Content, List, Hub, Overview, Homepage | —         | —                          | mapButton → getLinkIcon          | Ensure `mappedLink?.href` passed to `getLinkIcon` |

---

## Why it works this way

**Reference**
- Stores a pointer to a separate document
- Reusable across Content, Overview, and Hub pages
- Can be referenced in multiple locations

**Object**
- Stored inline within the parent document
- No separate document created
- Not reusable outside the page it is configured on

**Behaviour rules**
- Configured on a Content / Overview / Hub page → reusable across those page types, not on Homepage
- Configured on Homepage → only available on Homepage, not reusable on other page types
