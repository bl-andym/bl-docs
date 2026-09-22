Fixes the **WFP1-527 Media Download Grid regression that made existing Sanity assets invalid, while preserving file type and size display in the asset title.**

<table style="width: 100%; table-layout: fixed;">
  <colgroup>
    <col style="width: 30%;">
    <col style="width: 30%;">
    <col style="width: 40%;">
  </colgroup>
  <thead>
    <tr>
      <th>File</th>
      <th>What changed</th>
      <th>Why</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>apps/studio/src/schema/documents/components/media-download-grid.ts</code></td>
      <td>Restored MDG items to use <code>assetField(...)</code> <strong>directly</strong>, removing the WFP1-527 wrapper object/surtitle field</td>
      <td>Fixes existing Sanity content becoming invalid and showing <strong><code>Item of type asset not valid for this list</code></strong></td>
    </tr>
    <tr>
      <td><code>apps/web/src/api/shared/fragments/generic.ts</code></td>
      <td>Restored the MDG GROQ query to the <strong>direct asset shape</strong> (<code>file</code>/<code>image</code>) rather than querying through <code>asset.file</code> / <code>asset.image</code></td>
      <td><strong>Keeps the frontend query aligned with the restored CMS schema. Existing MDG content stores <code>file</code>/<code>image</code> directly on each item; without this change, the query would look under <code>item.asset</code> and fail to retrieve the existing asset data correctly.</strong></td>
    </tr>
    <tr>
      <td><code>apps/web/src/utils/prop-mappers/map-media-download-grid.ts</code></td>
      <td>Removed the wrapper-specific explicit <code>surtitle</code> mapping, while <strong>retaining <code>finalTitle</code> and <code>getAssetLabelWithMetadata()</code></strong></td>
      <td>Keeps WFP1-527's required <code>Title (PDF, 1.3MB)</code> behaviour without relying on the problematic wrapper</td>
    </tr>
    <tr>
      <td><code>apps/studio/schema.json</code></td>
      <td>Regenerated</td>
      <td>Reflects the restored MDG schema</td>
    </tr>
    <tr>
      <td><code>apps/studio/src/generated/types.ts</code></td>
      <td>Regenerated</td>
      <td>Studio TypeScript types now match the restored schema</td>
    </tr>
    <tr>
      <td><code>apps/web/src/sanity/generated-types.ts</code></td>
      <td>Regenerated</td>
      <td>Web Sanity types now match the restored schema/query</td>
    </tr>
  </tbody>
</table>