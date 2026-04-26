from fastapi import APIRouter, Request

from app.controllers import auth_controller
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    OTPRequest,
    OTPVerifyRequest,
    SignupRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post("/signup", response_model=AuthResponse)
@limiter.limit(settings.rate_limit_default)
async def signup(request: Request, payload: SignupRequest):
    result = await auth_controller.signup(payload.model_dump())
    return {"access_token": result["access_token"], "user": result["user"]}


@router.post("/login", response_model=AuthResponse)
@limiter.limit(settings.rate_limit_default)
async def login(request: Request, payload: LoginRequest):
    result = await auth_controller.login(payload.email, payload.password)
    return {"access_token": result["access_token"], "user": result["user"]}


@router.post("/google", response_model=AuthResponse)
@limiter.limit(settings.rate_limit_default)
async def google_login(request: Request, payload: GoogleAuthRequest):
    result = await auth_controller.google_login(payload.model_dump())
    return {"access_token": result["access_token"], "user": result["user"]}


@router.post("/forgot-password")
@limiter.limit(settings.rate_limit_default)
async def forgot_password(request: Request, payload: ForgotPasswordRequest):
    return await auth_controller.forgot_password(payload.email)


@router.post("/mobile/request")
@limiter.limit(settings.rate_limit_default)
async def request_mobile_otp(request: Request, payload: OTPRequest):
    return await auth_controller.request_otp(payload.mobile_number)


@router.post("/mobile/verify", response_model=AuthResponse)
@limiter.limit(settings.rate_limit_default)
async def verify_mobile_otp(request: Request, payload: OTPVerifyRequest):
    result = await auth_controller.verify_otp(payload.mobile_number, payload.otp)
    return {"access_token": result["access_token"], "user": result["user"]}
