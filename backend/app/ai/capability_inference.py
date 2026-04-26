def infer_hidden_capabilities(hospital: dict) -> list[str]:
    equipment_text = f"{hospital.get('equipment', '')} {hospital.get('description', '')}".lower()
    inferred: list[str] = []

    rules = {
        "cardiac care": ["ecg", "cath lab", "angiography", "cardio"],
        "stroke management": ["ct", "mri", "neurology"],
        "critical trauma support": ["icu", "ventilator", "emergency", "trauma"],
        "maternal and neonatal care": ["nicu", "labor", "obstetric", "gyne"],
        "renal support": ["dialysis", "nephro"],
    }

    for capability, keywords in rules.items():
        if any(keyword in equipment_text for keyword in keywords):
            inferred.append(capability)

    return sorted(set(inferred))
