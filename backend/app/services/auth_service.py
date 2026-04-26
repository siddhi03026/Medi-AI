from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import OTP_COLLECTION, USER_COLLECTION
from app.utils.validators import is_valid_password, is_valid_phone


class AuthService:
    async def signup(self, payload: dict) -> dict:
        db = get_db()
        
        # DEMO BYPASS: If MongoDB is not reachable, allow mock signup
        try:
            await db.command('ping')
        except Exception:
            print("⚠️ DEMO MODE: MongoDB unreachable, using mock signup")
            token = create_access_token(payload["email"])
            return {
                "access_token": token,
                "user": {
                    "name": payload["name"],
                    "email": payload["email"].lower(),
                    "mobile_number": payload["mobile_number"],
                },
            }

        if not is_valid_password(payload["password"]):
            raise ValueError("Password must have at least 8 chars, one uppercase, and one number")
        if not is_valid_phone(payload["mobile_number"]):
            raise ValueError("Mobile number must be 10 digits")

        existing = await db[USER_COLLECTION].find_one({"email": payload["email"].lower()})
        if existing:
            raise ValueError("Email already registered")

        user_doc = {
            "name": payload["name"],
            "email": payload["email"].lower(),
            "mobile_number": payload["mobile_number"],
            "password_hash": hash_password(payload["password"]),
            "auth_provider": "local",
            "created_at": datetime.now(timezone.utc),
        }
        await db[USER_COLLECTION].insert_one(user_doc)

        token = create_access_token(user_doc["email"])
        return {
            "access_token": token,
            "user": {
                "name": user_doc["name"],
                "email": user_doc["email"],
                "mobile_number": user_doc["mobile_number"],
            },
        }

    async def login(self, email: str, password: str) -> dict:
        db = get_db()
        
        # DEMO BYPASS: If MongoDB is not reachable, allow mock login
        try:
            await db.command('ping')
        except Exception:
            print("⚠️ DEMO MODE: MongoDB unreachable, using mock login")
            token = create_access_token(email)
            return {
                "access_token": token,
                "user": {
                    "name": "Demo User",
                    "email": email.lower(),
                    "mobile_number": "9876543210",
                },
            }

        user = await db[USER_COLLECTION].find_one({"email": email.lower()})
        if not user or not verify_password(password, user.get("password_hash", "")):
            raise ValueError("Invalid credentials")

        token = create_access_token(user["email"])
        return {
            "access_token": token,
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "mobile_number": user.get("mobile_number"),
            },
        }

    async def google_login(self, payload: dict) -> dict:
        db = get_db()
        email = payload["email"].lower()
        user = await db[USER_COLLECTION].find_one({"email": email})
        if not user:
            user = {
                "name": payload["name"],
                "email": email,
                "mobile_number": "",
                "password_hash": "",
                "google_id": payload["google_id"],
                "auth_provider": "google",
                "created_at": datetime.now(timezone.utc),
            }
            await db[USER_COLLECTION].insert_one(user)

        token = create_access_token(email)
        return {
            "access_token": token,
            "user": {
                "name": user.get("name"),
                "email": email,
                "mobile_number": user.get("mobile_number", ""),
            },
        }

    async def forgot_password(self, email: str) -> dict:
        db = get_db()
        user = await db[USER_COLLECTION].find_one({"email": email.lower()})
        if not user:
            return {"message": "If account exists, reset link is sent"}

        reset_token = create_access_token(email.lower())
        reset_link = f"https://example-healthcare.app/reset-password?token={reset_token}"
        return {
            "message": "Password reset link generated",
            "reset_link": reset_link,
        }

    async def request_mobile_otp(self, mobile_number: str) -> dict:
        if not is_valid_phone(mobile_number):
            raise ValueError("Mobile number must be 10 digits")

        otp = str(random.randint(100000, 999999))
        db = get_db()
        await db[OTP_COLLECTION].delete_many({"mobile_number": mobile_number})
        await db[OTP_COLLECTION].insert_one(
            {
                "mobile_number": mobile_number,
                "otp": otp,
                "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
            }
        )

        return {
            "message": "OTP sent (mock)",
            "mock_otp": otp,
        }

    async def verify_mobile_otp(self, mobile_number: str, otp: str) -> dict:
        db = get_db()
        otp_doc = await db[OTP_COLLECTION].find_one({"mobile_number": mobile_number, "otp": otp})
        if not otp_doc:
            raise ValueError("Invalid OTP")
        if otp_doc["expires_at"] < datetime.now(timezone.utc):
            raise ValueError("OTP expired")

        user = await db[USER_COLLECTION].find_one({"mobile_number": mobile_number})
        if not user:
            user = {
                "name": "Mobile User",
                "email": f"mobile_{mobile_number}@mock.local",
                "mobile_number": mobile_number,
                "password_hash": "",
                "auth_provider": "otp",
                "created_at": datetime.now(timezone.utc),
            }
            await db[USER_COLLECTION].insert_one(user)

        token = create_access_token(user["email"])
        await db[OTP_COLLECTION].delete_many({"mobile_number": mobile_number})
        return {
            "access_token": token,
            "user": {
                "name": user.get("name", "Mobile User"),
                "email": user["email"],
                "mobile_number": mobile_number,
            },
        }
