**Icon logic key:** 
BL external = no ↗, 
Non-BL external = show ↗, 
Internal = → (right arrow or no ↗), 
Asset = download (any link with linkType: 'asset', usually Sanity-hosted files, not internal pages.)

<table style="width: 100%; table-layout: fixed;">
  <colgroup>
    <col style="width: 18%;">
    <col style="width: 26%;">
    <col style="width: 26%;">
    <col style="width: 22%;">
    <col style="width: 8%;">
  </colgroup>
  <thead>
    <tr>
      <th>Component</th>
      <th>Where it appears </th>
      <th>Icon path </th>
      <th>Icon logic</th>
      <th>Pass/Fail</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>RichText</strong></td>
      <td>Inline links in body → TextImage</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Inline links in body →  TextImageCta</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Inline links in body →  HighlightBannerImage</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Description →  HighlightBannerIllustration</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Button → HighlightBannerIllustration</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Caption links → ImageWithCaption</td>
      <td><strong>RichText</strong> (via ImageWithCaption)</td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Caption links → ImageSet</td>
      <td><strong>RichText</strong> (via ImageWithCaption)</td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Caption links → TextImage</td>
      <td><strong>RichText</strong> (via ImageWithCaption)</td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Caption links → TextImageCta</td>
      <td><strong>RichText</strong> (via ImageWithCaption)</td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Intro text → RegularCardGrid</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Intro text → ListCardGrid</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Intro text → MediaDownloadGrid</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Accordion item body → Accordion</td>
      <td><strong>RichText</strong> (via Accordion)</td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Accordion item body → AccordionGroup</td>
      <td><strong>RichText</strong> (description + Accordion items)</td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Opening hours text</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Footer copyright (if links present)</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>EmailSignup caption (if links present)</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>EmailSignup success text (if links present)</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>DownloadContentModal description</td>
      <td><strong>RichText</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Illustration card link etc.<br><br>Illustration card banner is populated with illustration cards</td>
      <td><strong>IllustrationCard</strong><br><br>Can be used on:<br>- Home page<br>- Content page<br>- Hub page<br>- Overview page<br><br>A test in one page type is a test in all page types</td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td><strong>BipcButton</strong></td>
      <td>Header BIPC button</td>
      <td><strong>BipcButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Nav BIPC button</td>
      <td><strong>BipcButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td><strong>Button</strong> (via <code>mapButton</code>)</td>
      <td>CMS: Regular card grid<br></td>
      <td><strong>mapButton</strong><br><br>Can used on:<br>- Home page<br>- Content page<br>- Hub page<br>- Overview page</td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>CMS: Editorial card grid</td>
      <td><strong>mapButton</strong><br><br>Can be used on:<br>- Home page<br>- Content page<br>- Hub page<br>- Overview page</td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>CMS: Standard card banner</td>
      <td><strong>mapButton</strong><br><br>Can be used on:<br>- Home page<br>- Content page<br>- Hub page<br>- Overview page</td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>CMS: Text card grid</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>CMS: List card grid</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>CMS: List card banner</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>CMS: Media download grid</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Hub hero banner buttons</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Button banner buttons</td>
      <td><strong>mapButton</strong> (via <code>map-button-banner</code>)</td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>TextImage buttons</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>TextImageCta buttons</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Highlight banner buttons</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Highlight banner buttons → illustration</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Navigation button (if applicable)</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Homepage hero button (if applicable)</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td><strong>TextCardGrid cards</strong></td>
      <td>CMS: Text card grid → card link (<code>linkIcon</code>)<br><br>Can be used on:<br>- Home page<br>- Content page<br>- Hub page<br>- Overview page</td>
      <td><strong>linkIcon</strong> / <code>getLinkIcon</code><br><br>At build/render time, <code>apps/web</code> mappers compute <code>linkIcon</code> via <code>getLinkIcon(linkType, href)</code> and pass it to design-system components.</td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td><strong>Card grid cards</strong></td>
      <td>Regular card grid → content card link</td>
      <td><strong>linkIcon</strong> / <code>getLinkIcon</code></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Regular card grid → editorial card link</td>
      <td><strong>linkIcon</strong> / <code>getLinkIcon</code></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>Standard card banner → card link</td>
      <td><strong>linkIcon</strong> / <code>getLinkIcon</code></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td><strong>ListCard</strong></td>
      <td>List card grid → item link<br><br>List page only</td>
      <td><strong>linkIcon</strong> / <code>getLinkIcon</code></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td></td>
      <td>List card banner → item link</td>
      <td><strong>linkIcon</strong> / <code>getLinkIcon</code></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td><strong>MediaDownloadGrid items</strong></td>
      <td>Media download grid → item link (if external)</td>
      <td><strong>linkIcon</strong> / <code>getLinkIcon</code></td>
      <td>BL external: no ↗; non-BL external: ↗; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td><strong>Hub hero banner</strong></td>
      <td>Hub page hero → button icons (via <code>map-hub-hero-banner</code>)</td>
      <td><strong>mapButton</strong> or <strong>getLinkIcon</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
    <tr>
      <td><strong>Button banner</strong></td>
      <td>Button banner block → per-button icons (via <code>map-button-banner</code>)</td>
      <td><strong>mapButton</strong></td>
      <td>BL external: no ↗; non-BL external: ↗; internal: →; asset: download</td>
      <td>Pass</td>
    </tr>
  </tbody>
</table>

**PDF assets**:



| URL                                                         | Expected             |
| ----------------------------------------------------------- | -------------------- |
| `http://fakepdf.pdf` (or `https://example.com/fakepdf.pdf`) | **↗** (non-BL)       |
| `http://bl.uk/fakepdf.pdf`                                  | **No ↗** (BL domain) |
