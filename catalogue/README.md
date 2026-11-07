# IDOGTC catalogue import

Source: `Combined_Building_Materials_and_Paints_Catalogue.xlsx`, Master Catalogue sheet. The adjacent Building Materials and Paints sheets duplicate the same 246 codes and are not imported separately.

- 148 building-material items and 98 paint/coating items, across 18 categories.
- Item codes, original names, categories, units and supplied descriptions are retained. `BM-0133` and `BM-0141` both say Steel Scaffolding but remain separate item codes.
- No selling prices, confirmed stock quantities, brands, origins or photographs were supplied. Products are inquiries with `priceOnRequest=true`, blank origins and no invented reviews. Their category illustrations are explicitly labelled; they are not actual product photographs.
- Purchase prices, supplier contacts and other internal-cost columns are excluded from public data.
- Illustrations are code-generated SVGs based on Lucide icons; see `LUCIDE-LICENSE.txt`.

Regenerate the manifest on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/extract-catalogue.ps1 -InputPath 'FULL_PATH_TO_WORKBOOK.xlsx'
node scripts/catalogue-images.mjs
```

The one-time GitHub workflow input `import_catalogue=true` (with `dry_run=false`) uploads a temporary, random-name, token-protected maintenance script using the existing FTPS deployment account. It expires in 15 minutes and is removed immediately after the request. It locks the store row, backs up the prior state outside `public_html`, and adds missing item codes and categories. It never resets header, products, prices, uploads, orders, users or settings. Repeating this exact import skips already-present item codes and preserves edits.

The private snapshot is stored at `HOME/idogtc-catalogue-backups/before-catalogue-*.json`. This is a store-content snapshot, not a full database backup. The ordinary deployment never runs imports. New products are managed through the existing admin Products tab, with item code, unit, quote pricing and illustration controls.

Checks: `php tests/catalogue-import.php`, the real PHP/MariaDB order tests, and the database-mode Playwright tests for all catalogue pages, search by item code, quotes, mobile layout and admin edits.

## Product-specific images and quote links

Photorealistic generic product illustrations are generated with the built-in `image_gen` tool, individually from each item's name and supplied specification. Exact prompts are recorded in `product-image-prompts.json`. They depict unbranded examples, not actual inventory photos or verified packaging. Optimized JPEGs live in `public/images/products/`; original PNGs are retained locally in ignored `output/imagegen/products/`. Run `scripts/optimize-product-images.ps1` to create the 640-pixel web thumbnails.

`product-images.json` maps only completed images to item codes. The optional `update_product_images=true` deployment updates only original category-illustration placeholders, keeps the illustration label, makes a private pre-update snapshot, and preserves owner-selected photos, prices, settings and orders. It never changes product names or item codes. Repeat runs skip already updated images. The normal code deployment does not run the image update.

Customer-facing “Request quote” prices link directly to the configured header WhatsApp number, falling back to the Bosaso phone. The bilingual prefilled message includes the product name, item code, quantity and unit. Paid products continue displaying their price normally. The whole-cart quote action keeps the existing inquiry recording flow.
