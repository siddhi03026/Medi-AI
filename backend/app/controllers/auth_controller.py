from fastapi import HTTPException

from app.services.auth_service import AuthService

service = AuthService()


async def signup(payload: dict) -> dict:
    try:
        return await service.signup(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


async def login(email: str, password: str) -> dict:
    try:
        return await service.login(email, password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


async def google_login(payload: dict) -> dict:
    try:
        return await service.google_login(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


async def forgot_password(email: str) -> dict:
    return await service.forgot_password(email)


async def request_otp(mobile_number: str) -> dict:
    try:
        return await service.request_mobile_otp(mobile_number)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


async def verify_otp(mobile_number: str, otp: str) -> dict:
    try:
        return await service.verify_mobile_otp(mobile_number, otp)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
