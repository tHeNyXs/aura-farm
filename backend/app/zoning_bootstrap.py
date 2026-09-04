"""Provision the read-only LDD Zoning SQLite file on ephemeral hosts.

The database is intentionally kept outside the application image.  A public GitHub
Release asset can be supplied through ``LDD_ZONING_RELEASE_URL``; it is downloaded
atomically at boot and never replaces a valid local copy with a partial download.
"""

import hashlib
import gzip
import logging
import os
import shutil
import sqlite3
import tempfile
from pathlib import Path
from typing import Dict
from urllib.parse import urlparse
from urllib.request import Request, urlopen

logger = logging.getLogger("ldd_zoning_bootstrap")


def _database_path() -> Path:
    configured = os.getenv("LDD_ZONING_DB_PATH")
    if configured:
        return Path(configured)
    return Path(tempfile.gettempdir()) / "aura-farm" / "ldd_zoning.sqlite"


def _is_valid_database(path: Path) -> bool:
    if not path.is_file() or path.stat().st_size == 0:
        return False
    try:
        with sqlite3.connect(f"file:{path}?mode=ro", uri=True) as conn:
            row = conn.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'zoning_features'"
            ).fetchone()
            return row is not None
    except sqlite3.Error:
        return False


def provision_zoning_database() -> Dict[str, str | bool]:
    """Ensure an LDD Zoning database exists, returning a safe operational status."""
    destination = _database_path()
    if _is_valid_database(destination):
        return {"available": True, "state": "ready", "path": str(destination)}

    release_url = os.getenv("LDD_ZONING_RELEASE_URL", "").strip()
    if not release_url:
        return {
            "available": False,
            "state": "not_configured",
            "reason": "ยังไม่ได้ตั้งค่าฐานข้อมูล Zoning",
        }

    expected_hash = os.getenv("LDD_ZONING_RELEASE_SHA256", "").strip().lower()
    github_token = os.getenv("LDD_ZONING_GITHUB_TOKEN", "").strip()
    try:
        max_bytes = int(os.getenv("LDD_ZONING_MAX_BYTES", "4000000000"))
        if max_bytes <= 0:
            raise ValueError
    except ValueError:
        return {
            "available": False,
            "state": "not_configured",
            "reason": "ค่าขนาดไฟล์ Zoning ที่ตั้งไว้ไม่ถูกต้อง",
        }
    compression = os.getenv("LDD_ZONING_RELEASE_COMPRESSION", "").strip().lower()
    if not compression and release_url.lower().split("?", 1)[0].endswith(".gz"):
        compression = "gzip"
    if compression not in {"", "gzip"}:
        return {
            "available": False,
            "state": "not_configured",
            "reason": "รูปแบบไฟล์ Zoning ที่ตั้งค่าไว้ไม่รองรับ",
        }
    temporary = destination.with_suffix(destination.suffix + ".download")
    compressed_temporary = destination.with_suffix(destination.suffix + ".download.gz")

    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary.unlink(missing_ok=True)
        compressed_temporary.unlink(missing_ok=True)
        logger.info("Downloading LDD Zoning database from configured release asset")
        digest = hashlib.sha256()
        total = 0
        headers = {"User-Agent": "AuraFarm-Zoning/1.0"}
        parsed_url = urlparse(release_url)
        is_own_release = (
            parsed_url.scheme == "https"
            and parsed_url.netloc == "github.com"
            and parsed_url.path.startswith("/tHeNyXs/aura-farm/releases/download/")
        )
        if github_token:
            if not is_own_release:
                raise ValueError("ไม่อนุญาตให้ส่งสิทธิ์ GitHub ไปยังแหล่งดาวน์โหลดอื่น")
            headers["Authorization"] = f"Bearer {github_token}"
        request = Request(release_url, headers=headers)
        download_target = compressed_temporary if compression == "gzip" else temporary
        with urlopen(request, timeout=120) as response, download_target.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                total += len(chunk)
                if total > max_bytes:
                    raise ValueError("ไฟล์ฐานข้อมูลใหญ่เกินขนาดที่อนุญาต")
                digest.update(chunk)
                output.write(chunk)

        if expected_hash and digest.hexdigest() != expected_hash:
            raise ValueError("ผลตรวจสอบความถูกต้องของไฟล์ฐานข้อมูลไม่ตรงกัน")
        if compression == "gzip":
            unpacked = 0
            with gzip.open(compressed_temporary, "rb") as source, temporary.open("wb") as output:
                while chunk := source.read(1024 * 1024):
                    unpacked += len(chunk)
                    if unpacked > max_bytes:
                        raise ValueError("ฐานข้อมูลหลังแตกไฟล์ใหญ่เกินขนาดที่อนุญาต")
                    output.write(chunk)
        if not _is_valid_database(temporary):
            raise ValueError("ไฟล์ที่ดาวน์โหลดไม่ใช่ฐานข้อมูล Zoning ที่ใช้งานได้")
        shutil.move(str(temporary), str(destination))
        logger.info("LDD Zoning database is ready (%s bytes)", total)
        return {"available": True, "state": "downloaded", "path": str(destination)}
    except Exception as error:  # Keep satellite analysis available when zoning is unavailable.
        for partial in (temporary, compressed_temporary):
            try:
                partial.unlink(missing_ok=True)
            except OSError:
                pass
        logger.warning("LDD Zoning database could not be provisioned: %s", error)
        return {
            "available": False,
            "state": "download_failed",
            "reason": "ยังเตรียมข้อมูล Zoning ไม่สำเร็จ ระบบจะไม่ใช้ผล Zoning ในรอบนี้",
        }
