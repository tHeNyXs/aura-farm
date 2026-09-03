# LDD Zoning import

The source ZIP files are intentionally not committed. They are public LDD source data,
but are approximately 1.84 GB and unsuitable for the application repository or a
Vercel deployment.

## Input

Mount or copy the source directory containing the 13 crop folders into the backend
environment. The importer reads `Lu_code`, `Suit_xx`, geometry and provincial ZIP
names directly from the source Shapefiles.

`Sugarcane/S/Zon_Suga_rng.zip` is currently excluded automatically because the
upstream ZIP has no `.dbf` attribute table. It is recorded in `import_issues` instead
of being guessed.

## Build the database

Run in an environment with the backend dependencies installed:

```sh
python scripts/import_ldd_zoning.py /source/ldd_zoning /output/ldd_zoning.sqlite
```

Set `LDD_ZONING_DB_PATH` to the generated file. The backend exposes
`POST /api/v1/zoning-overlay` for testing an overlay directly and automatically adds
the official result to `/api/v1/analyze-gee` when the database is present.

## Deploy free with GitHub Releases (all provinces)

Do not upload the raw ZIPs to Git. First build one SQLite file locally from the full
13-crop source. Compress the completed SQLite file as `ldd_zoning.sqlite.gz`, then
create a **public GitHub Release** in this repository and attach that one file.
GitHub Release assets support files under 2 GiB. Compression keeps the release asset
small; the backend expands it only while it is running. If the compressed file is
still 2 GiB or larger, stop there and report its size—do not silently drop provinces.

This repository includes a one-time GitHub Action at
`.github/workflows/build-ldd-zoning.yml` so the conversion does not require Python on
your computer. Create a temporary **source** release and upload one ZIP that contains
the original folders (`Cassava`, `Rice`, `Sugarcane`, and the other crop folders).
Then open **Actions → Build LDD Zoning release → Run workflow**, enter the source
release tag `ldd-zoning-source-v1`, and use a new result tag such as `ldd-zoning-v1`.

The Action imports every province available in all 13 configured crops, records the
known malformed Sugarcane archive as an import issue, compresses the database, and
creates the final release together with its SHA-256 checksum. It intentionally fails
instead of overwriting an existing release tag or publishing an asset of 2 GiB or more.

In Render, set these environment variables and deploy again:

```text
LDD_ZONING_RELEASE_URL=https://github.com/tHeNyXs/aura-farm/releases/download/ldd-zoning-v1/ldd_zoning.sqlite.gz
LDD_ZONING_RELEASE_SHA256=<SHA-256 of ldd_zoning.sqlite.gz>
LDD_ZONING_RELEASE_COMPRESSION=gzip
```

On Windows, obtain the SHA-256 after building with:

```powershell
Get-FileHash .\ldd_zoning.sqlite.gz -Algorithm SHA256
```

The app downloads the file at startup into temporary storage, verifies the optional
SHA-256, then opens it only after confirming it contains the expected Zoning table.
On a Render restart it downloads again. If the download or verification fails,
satellite analysis continues but the response explicitly says Zoning is unavailable;
it never substitutes provincial CSV statistics as a parcel result.
