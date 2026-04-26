from __future__ import annotations

from dataclasses import dataclass


@dataclass
class TrustResult:
    trust_score: int
    confidence: str
    reasons: list[str]
    warnings: list[str]


class TrustScoreEngine:
    def compute(self, hospital: dict) -> TrustResult:
        score = 50
        reasons: list[str] = []
        warnings: list[str] = []

        equipment = str(hospital.get("equipment", "")).lower()
        capability = str(hospital.get("capability", "")).lower()
        description = str(hospital.get("description", "")).lower()
        doctors = str(hospital.get("doctor_availability", "") or hospital.get("doctors", "")).lower()

        if any(term in equipment for term in ["ct", "mri", "icu", "ventilator", "dialysis"]):
            score += 18
            reasons.append("Critical equipment detected")
        else:
            score -= 10
            warnings.append("Limited critical equipment data")

        if any(term in doctors for term in ["24", "24x7", "available", "on-call"]):
            score += 12
            reasons.append("Doctor availability appears strong")
        else:
            score -= 6
            warnings.append("Doctor availability not clearly stated")

        if capability and capability != "nan":
            score += 10
            reasons.append("Capabilities are clearly listed")
        else:
            score -= 8
            warnings.append("Capabilities missing")

        if description and description != "nan":
            score += 6
        else:
            score -= 5
            warnings.append("Description incomplete")

        if "not available" in equipment and "advanced" in capability:
            score -= 12
            warnings.append("Possible data contradiction")

        score = max(0, min(100, score))

        if score >= 75:
            confidence = "high"
        elif score >= 45:
            confidence = "medium"
        else:
            confidence = "low"

        return TrustResult(trust_score=score, confidence=confidence, reasons=reasons, warnings=warnings)
