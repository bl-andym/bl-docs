
| Component            | Available in page types                | Home page | Content / Overview / Hub   | Mapper                           | Link handling change                                                                 |
| -------------------- | -------------------------------------- | --------- | -------------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| List card banner     | Content, Hub, Overview, Homepage       | Object    | Reference                  | map-list-card-grid-and-banner    | Pass `mappedLink?.href` to `getLinkIcon`                                             |
| List card grid       | List pages                             | —         | Reference (list page only) | map-list-card-grid-and-banner    | Pass `mappedLink?.href` to `getLinkIcon`                                             |
| Media download grid  | Overview, Hub, Content                 | —         | Reference                  | map-media-download-grid          | Pass `mappedLink?.href` to `getLinkIcon`                                             |
| Regular card grid    | Content, Hub, Overview                 | Object    | Reference                  | map-card-grid                    | Pass `mappedLink?.href` via `mapBaseCard` (content cards delegate in Round 2)      |
| Standard card banner | Content, Hub, Overview, Homepage       | Object    | Reference                  | map-card-grid (cards with links) | Pass `mappedLink?.href` via `map-card-grid`                                          |
| Text card grid       | Content, Hub, Overview, Homepage       | —         | —                          | map-text-card-banner             | Pass `mappedLink?.href` to `getLinkIcon`                                             |
| Text image CTA       | Content, List, Hub, Overview, Homepage | —         | —                          | map-text-image-cta               | Buttons: `mapButton` → `mappedLink?.href`; inline links: `mapRichText` → `RichText` |
| RichText inline links | Any block using rich text             | —         | —                          | map-rich-text                    | Merge mapped link into mark defs; DS `RichText` + `getExternalLinkIcon` (Round 2)    |
| Illustration card    | Various (illustration blocks)          | —         | —                          | — (design-system)                | DS `IllustrationCard` + `getExternalLinkIcon` (Round 2)                              |
| BIPC nav button      | Navigation                             | —         | —                          | — (design-system)                | DS `BipcButton` + `getExternalLinkIcon` (Round 2)                                    |
| Button banner        | Content, Hub, Overview, Homepage       | —         | Reference                  | map-button-banner                | `mapButton` → `mappedLink?.href`                                                     |
| Hub hero banner      | Hub                                    | —         | —                          | map-hub-hero-banner              | Pass `mapped?.link?.href` to `getLinkIcon`                                           |


---

## Why it works this way

**Reference**
- Stores a pointer to a separate Sanity document
- Typically created under **Reusable components**, then picked on pages
- Can be referenced in multiple locations (including nested blocks such as Table of content list)

**Object**
- Stored inline within the parent page document
- No separate reusable document is created for that instance
- Not reference-able from other pages

**Behaviour rules**
- **Content / Overview / Hub pages** use **Reference** blocks → the same reusable document can be used across those page types, but **not** on Homepage
- **Homepage** uses **Object** blocks → stored inline on Homepage only; **not** reusable on other page types
- Reusability is driven by **how the page schema wires the block** (Reference vs Object), not where an editor first adds content

**Exceptions**
- **List card grid** — Reference-based, but only on **List pages** (and nested in Table of content list on Content pages); not available on Content / Overview / Hub in the same way as other card blocks
- **Media download grid** — Reference on Content / Overview / Hub only; **not available on Homepage**
- **List page** — also uses Reference blocks (e.g. list card grid)
