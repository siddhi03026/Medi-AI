from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str
    mobile_number: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    email: EmailStr
    name: str
    google_id: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class OTPRequest(BaseModel):
    mobile_number: str


class OTPVerifyRequest(BaseModel):
    mobile_number: str
    otp: str = Field(min_length=4, max_length=6)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
