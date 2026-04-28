from __future__ import annotations

import re


def trim_recommendation_bullets(text: str, max_bullets: int = 4, max_chars: int = 88) -> str:
    """
    Keep lines that look like bullet points, cap count and length per line.
    """
    raw = (text or "").strip()
    if not raw:
        return ""

    bullet_pattern = re.compile(r"^\s*([-*•]|\d+[\.)])\s*(.+)$")
    lines_out: list[str] = []
    for line in raw.splitlines():
        m = bullet_pattern.match(line.strip())
        if not m:
            continue
        content = m.group(2).strip()
        if len(content) > max_chars:
            cut = content[: max_chars + 1]
            if " " in cut:
                content = cut.rsplit(" ", 1)[0].rstrip(",;:") + "…"
            else:
                content = cut[:max_chars].rstrip() + "…"
        lines_out.append(f"- {content}")
        if len(lines_out) >= max_bullets:
            break

    if lines_out:
        return "\n".join(lines_out)

    # No bullets parsed: return first paragraph trimmed as a single bullet
    one = re.sub(r"\s+", " ", raw)
    if len(one) > max_chars:
        one = one[: max_chars + 1].rsplit(" ", 1)[0] + "…"
    return f"- {one}" if one else ""
