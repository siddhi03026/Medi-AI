import re


def sanitize_text(value: str) -> str:
    value = re.sub(r"<[^>]*>", "", value)
    value = value.strip()
    return value
