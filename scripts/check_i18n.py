#!/usr/bin/env python3
"""Validate i18n dictionaries for key alignment and obvious corruption."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
I18N_DIR = ROOT / "i18n"
LOCALES = ("en", "zh-CN", "zh-TW")
BASE_LOCALE = "en"

# Typical mojibake fragments we have seen before in this repo.
SUSPICIOUS_FRAGMENTS = ("鈥", "锟", "Ã", "�")


def load_locale(locale: str) -> dict[str, Any]:
    path = I18N_DIR / f"{locale}.json"
    try:
        text = path.read_text(encoding="utf-8-sig")
    except FileNotFoundError:
        raise SystemExit(f"[ERROR] Missing locale file: {path}")
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"[ERROR] Invalid JSON in {path}: {exc}")
    if not isinstance(data, dict):
        raise SystemExit(f"[ERROR] Root of {path} must be a JSON object.")
    return data


def flatten(obj: Any, prefix: str = "") -> dict[str, Any]:
    out: dict[str, Any] = {}
    if isinstance(obj, dict):
        for key, value in obj.items():
            path = f"{prefix}.{key}" if prefix else key
            out.update(flatten(value, path))
    else:
        out[prefix] = obj
    return out


def validate_string_values(locale: str, flat: dict[str, Any]) -> list[str]:
    issues: list[str] = []
    for key, value in flat.items():
        if not isinstance(value, str):
            continue
        if "????" in value:
            issues.append(f"{locale}:{key} contains '????' placeholder text")
        for fragment in SUSPICIOUS_FRAGMENTS:
            if fragment in value:
                issues.append(
                    f"{locale}:{key} contains suspicious fragment '{fragment}'"
                )
    return issues


def main() -> int:
    locales = {locale: flatten(load_locale(locale)) for locale in LOCALES}
    base_keys = set(locales[BASE_LOCALE].keys())

    errors: list[str] = []

    for locale, flat in locales.items():
        locale_keys = set(flat.keys())
        missing = sorted(base_keys - locale_keys)
        extra = sorted(locale_keys - base_keys)
        if missing:
            errors.append(
                f"{locale} is missing {len(missing)} key(s), sample: {missing[:10]}"
            )
        if extra:
            errors.append(
                f"{locale} has {len(extra)} extra key(s), sample: {extra[:10]}"
            )
        errors.extend(validate_string_values(locale, flat))

    if errors:
        print("[i18n] Validation failed:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("[i18n] Validation passed: keys aligned and no obvious corruption found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

