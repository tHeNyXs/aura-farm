"""
Step 4: FAO Suitability Classification (S1, S2, S3, N)
"""

from typing import Tuple

def classify_fao(score: int, is_masked: bool) -> Tuple[str, str]:
    """
    Returns (fao_class, fao_label_th)
    """
    if is_masked or score < 50:
        return "N", "ไม่เหมาะสม (N)"
    if score >= 85:
        return "S1", "เหมาะสมมาก (S1)"
    if score >= 70:
        return "S2", "เหมาะสมปานกลาง (S2)"
    return "S3", "เหมาะสมน้อย (S3)"
