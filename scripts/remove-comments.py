"""
Remove comments from source files in this project.

Handles:
  - JS/TS/JSX/TSX: line `//` and block `/* */` comments
  - JSX expression comments `{/* ... */}` (removes the wrapping `{}` too)
  - CSS: block `/* */` comments
  - Strings, template literals, and regex-like literals are preserved.

Preserves directive comments (eslint-disable, @ts-ignore, etc.) by default
because removing them would break tooling.

Usage:
  python scripts/remove-comments.py              # apply
  python scripts/remove-comments.py --dry-run    # report only
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# ----------------------------------------------------------------------- #
#  Configuration                                                          #
# ----------------------------------------------------------------------- #

INCLUDE_EXTS = {".js", ".jsx", ".ts", ".tsx", ".css", ".mjs", ".cjs"}
INCLUDE_DIRS = ["src", "server", "scripts"]
SKIP_DIRS = {"node_modules", "dist", ".git", ".vercel", "build", ".cache", ".next"}

# Directive comments we keep — removing them would break linters/TS/bundlers.
PRESERVE_PATTERNS = [
    r"eslint-disable",
    r"eslint-enable",
    r"@ts-(ignore|expect-error|nocheck)",
    r"prettier-ignore",
    r"@vite-ignore",
    r"#__PURE__",
    r"@__PURE__",
    r"c8 ignore",
    r"istanbul ignore",
    r"@license",
    r"@preserve",
    r"webpack(Chunk|Mode|Prefetch|Preload|Ignore)",
    r"<reference\s+(types|path|lib)",
    r"@vitest-",
]
_PRESERVE_RE = re.compile("|".join(PRESERVE_PATTERNS), re.IGNORECASE)


def should_preserve(comment_body: str) -> bool:
    return bool(_PRESERVE_RE.search(comment_body))


# ----------------------------------------------------------------------- #
#  JSX expression comment pre-pass                                        #
# ----------------------------------------------------------------------- #

# Matches ONLY tight JSX comment style `{/* ... */}` — no whitespace between
# `{` and `/*`. This avoids false-positive matches on JS code like
# `catch { /* noop */ }` where the braces are part of a control-flow block.
_JSX_COMMENT_RE = re.compile(r"\{/\*[\s\S]*?\*/\}")


def strip_jsx_comments(source: str) -> tuple[str, int]:
    removed = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal removed
        body = m.group(0)
        if should_preserve(body):
            return body
        removed += 1
        return ""

    return _JSX_COMMENT_RE.sub(repl, source), removed


# ----------------------------------------------------------------------- #
#  JS/TS state-machine comment remover                                    #
# ----------------------------------------------------------------------- #


def _consume_string(src: str, i: int, quote: str, out: list[str]) -> int:
    """Advance through a string literal, copying chars verbatim."""
    n = len(src)
    out.append(src[i])
    i += 1
    while i < n:
        ch = src[i]
        if ch == "\\" and i + 1 < n:
            out.append(ch)
            out.append(src[i + 1])
            i += 2
            continue
        out.append(ch)
        i += 1
        if ch == quote:
            break
    return i


def _consume_template(src: str, i: int, out: list[str]) -> int:
    """Advance through a template literal, copying chars verbatim. Handles
    `${...}` interpolations including nested strings/templates."""
    n = len(src)
    out.append(src[i])  # opening `
    i += 1
    while i < n:
        ch = src[i]
        if ch == "\\" and i + 1 < n:
            out.append(ch)
            out.append(src[i + 1])
            i += 2
            continue
        if ch == "`":
            out.append(ch)
            i += 1
            return i
        if ch == "$" and i + 1 < n and src[i + 1] == "{":
            out.append("${")
            i += 2
            depth = 1
            while i < n and depth > 0:
                ich = src[i]
                if ich == "\\" and i + 1 < n:
                    out.append(ich)
                    out.append(src[i + 1])
                    i += 2
                    continue
                if ich == '"' or ich == "'":
                    i = _consume_string(src, i, ich, out)
                    continue
                if ich == "`":
                    i = _consume_template(src, i, out)
                    continue
                if ich == "{":
                    depth += 1
                elif ich == "}":
                    depth -= 1
                out.append(ich)
                i += 1
            continue
        out.append(ch)
        i += 1
    return i


def remove_js_comments(source: str) -> tuple[str, int]:
    out: list[str] = []
    i = 0
    n = len(source)
    removed = 0

    while i < n:
        c = source[i]

        # String literals
        if c == '"' or c == "'":
            i = _consume_string(source, i, c, out)
            continue

        # Template literals
        if c == "`":
            i = _consume_template(source, i, out)
            continue

        # Comments
        if c == "/" and i + 1 < n:
            nxt = source[i + 1]
            if nxt == "/":
                end = source.find("\n", i + 2)
                if end == -1:
                    end = n
                body = source[i:end]
                if should_preserve(body):
                    out.append(body)
                else:
                    removed += 1
                i = end
                continue
            if nxt == "*":
                end = source.find("*/", i + 2)
                if end == -1:
                    out.append(source[i:])
                    return "".join(out), removed
                body = source[i : end + 2]
                if should_preserve(body):
                    out.append(body)
                else:
                    removed += 1
                i = end + 2
                continue

        out.append(c)
        i += 1

    return "".join(out), removed


# ----------------------------------------------------------------------- #
#  CSS comment remover (simpler — only block comments + strings)          #
# ----------------------------------------------------------------------- #


def remove_css_comments(source: str) -> tuple[str, int]:
    out: list[str] = []
    i = 0
    n = len(source)
    removed = 0

    while i < n:
        c = source[i]

        if c == '"' or c == "'":
            i = _consume_string(source, i, c, out)
            continue

        if c == "/" and i + 1 < n and source[i + 1] == "*":
            end = source.find("*/", i + 2)
            if end == -1:
                out.append(source[i:])
                return "".join(out), removed
            body = source[i : end + 2]
            if should_preserve(body):
                out.append(body)
            else:
                removed += 1
            i = end + 2
            continue

        out.append(c)
        i += 1

    return "".join(out), removed


# ----------------------------------------------------------------------- #
#  Whitespace cleanup                                                     #
# ----------------------------------------------------------------------- #


def cleanup_whitespace(source: str) -> str:
    # Strip trailing whitespace per line
    lines = [ln.rstrip() for ln in source.splitlines()]
    text = "\n".join(lines)
    # Collapse runs of 3+ blank lines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Ensure single trailing newline
    if not text.endswith("\n"):
        text += "\n"
    return text


# ----------------------------------------------------------------------- #
#  Driver                                                                 #
# ----------------------------------------------------------------------- #


def process_file(path: Path) -> tuple[bool, int]:
    """Returns (changed, comments_removed)."""
    try:
        original = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, PermissionError):
        return False, 0

    ext = path.suffix
    removed_total = 0
    text = original

    if ext in (".jsx", ".tsx"):
        text, n = strip_jsx_comments(text)
        removed_total += n

    if ext in (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"):
        text, n = remove_js_comments(text)
        removed_total += n
    elif ext == ".css":
        text, n = remove_css_comments(text)
        removed_total += n
    else:
        return False, 0

    text = cleanup_whitespace(text)

    if text != original:
        return True, removed_total
    return False, 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing files",
    )
    parser.add_argument(
        "--root",
        default=None,
        help="Project root (defaults to script's parent directory)",
    )
    args = parser.parse_args()

    root = Path(args.root) if args.root else Path(__file__).resolve().parent.parent
    files_scanned = 0
    files_changed = 0
    total_removed = 0
    skipped: list[str] = []

    for include_dir in INCLUDE_DIRS:
        base = root / include_dir
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file():
                continue
            if any(part in SKIP_DIRS for part in path.parts):
                continue
            if path.suffix not in INCLUDE_EXTS:
                continue
            files_scanned += 1

            try:
                original = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, PermissionError) as e:
                skipped.append(f"{path.relative_to(root)}: {e}")
                continue

            ext = path.suffix
            text = original
            removed = 0

            if ext in (".jsx", ".tsx"):
                text, n = strip_jsx_comments(text)
                removed += n

            if ext in (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"):
                text, n = remove_js_comments(text)
                removed += n
            elif ext == ".css":
                text, n = remove_css_comments(text)
                removed += n

            text = cleanup_whitespace(text)

            if text != original:
                rel = path.relative_to(root)
                if args.dry_run:
                    print(f"would clean: {rel} ({removed} comments)")
                else:
                    path.write_text(text, encoding="utf-8")
                    print(f"cleaned: {rel} ({removed} comments)")
                files_changed += 1
                total_removed += removed

    print()
    if args.dry_run:
        print(
            f"DRY RUN: {files_scanned} scanned, {files_changed} would change, "
            f"{total_removed} comments would be removed"
        )
    else:
        print(
            f"DONE: {files_scanned} scanned, {files_changed} changed, "
            f"{total_removed} comments removed"
        )

    if skipped:
        print(f"\nSkipped {len(skipped)} files:")
        for s in skipped:
            print(f"  {s}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
