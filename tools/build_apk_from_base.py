#!/usr/bin/env python3
"""Put the web files of this repository into an existing Mushaf Muallim APK.

usage: python3 tools/build_apk_from_base.py BASE.apk WEB_DIR OUT_unsigned.apk [AndroidManifest.xml]

- BASE.apk      a previous build of the app (its Android shell and native code are kept as they are)
- WEB_DIR       the folder holding index.html (the root of this repository)
- the optional AndroidManifest.xml replaces the one in BASE.apk (for a new version number)

The old signature is dropped; sign the result with jarsigner, then run tools/zipalign.py.
"""
import os, sys, zipfile

SKIP_DIRS = {".git", "tools", ".github"}
SKIP_FILES = {"README.md", ".gitignore", "LICENSE"}

def web_files(root):
    out = {}
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS and not x.startswith(".")]
        for f in files:
            p = os.path.join(d, f)
            rel = os.path.relpath(p, root).replace(os.sep, "/")
            if rel in SKIP_FILES or f.startswith(".") or f.endswith((".apk", ".jks", ".keystore")):
                continue
            out["assets/www/" + rel] = p
    return out

def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    base, web, out = sys.argv[1:4]
    manifest = sys.argv[4] if len(sys.argv) > 4 else None
    new = web_files(web)
    if "assets/www/index.html" not in new:
        sys.exit("index.html not found in " + web)
    zi = zipfile.ZipFile(base)
    zo = zipfile.ZipFile(out, "w")
    stamp = None
    for i in zi.infolist():
        name = i.filename
        if name.startswith("META-INF/") or name.startswith("assets/www/"):
            continue
        data = open(manifest, "rb").read() if (manifest and name == "AndroidManifest.xml") else zi.read(i)
        n = zipfile.ZipInfo(name, date_time=i.date_time)
        n.compress_type = i.compress_type
        n.external_attr = i.external_attr
        zo.writestr(n, data)
        stamp = stamp or i.date_time
    for name in sorted(new):
        n = zipfile.ZipInfo(name, date_time=stamp or (2024, 1, 1, 0, 0, 0))
        n.compress_type = zipfile.ZIP_DEFLATED
        zo.writestr(n, open(new[name], "rb").read())
    zo.close()
    print("wrote", out, "with", len(new), "web files")

if __name__ == "__main__":
    main()
