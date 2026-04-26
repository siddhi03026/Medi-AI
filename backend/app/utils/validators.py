import re


def is_valid_password(password: str) -> bool:
    return bool(re.search(r"[A-Z]", password) and re.search(r"\d", password) and len(password) >= 8)


def is_valid_phone(phone: str) -> bool:
    return bool(re.fullmatch(r"\d{10}", phone))
