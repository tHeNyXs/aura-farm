"""
Unit Tests for Layer 9 NDBI Built-up Hard Mask Module
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ndbi_mask import compute_ndbi, compute_ndvi, evaluate_ndbi_hard_mask

class TestNdbiMask(unittest.TestCase):
    def test_ndbi_concrete_roof_hard_mask(self):
        """
        Test Case 1: จำลองค่าสเปกตรัมหลังคาคอนกรีตจริง (NDBI=0.187, NDVI=-0.019)
        ต้องได้ผลลัพธ์: grade="N", score=0.15, skip_ahp=True, is_built_up=True
        """
        b8_nir = 0.200
        b4_red = 0.20775
        b11_swir = 0.292

        result = evaluate_ndbi_hard_mask(b8_nir, b4_red, b11_swir)

        self.assertTrue(result["skip_ahp"])
        self.assertEqual(result["grade"], "N")
        self.assertEqual(result["score"], 0.15)
        self.assertEqual(result["percentage"], 15)
        self.assertTrue(result["is_built_up"])
        self.assertEqual(result["ndbi"], 0.187)
        self.assertEqual(result["ndvi"], -0.019)
        self.assertIn("สิ่งปลูกสร้าง", result["message"])

    def test_ndbi_green_grass_field(self):
        """
        Test Case 2: จำลองแปลงเกษตร/สนามหญ้าเขียวขจี (NDBI = -0.150, NDVI = 0.680)
        ต้องได้ผลลัพธ์: skip_ahp=False, is_built_up=False
        """
        b8_nir = 0.420
        b4_red = 0.080
        b11_swir = 0.310

        result = evaluate_ndbi_hard_mask(b8_nir, b4_red, b11_swir)

        self.assertFalse(result["skip_ahp"])
        self.assertFalse(result["is_built_up"])
        self.assertIsNone(result["grade"])
        self.assertIsNone(result["score"])
        self.assertIn("พืชคลุมดิน", result["message"])

    def test_ndbi_bare_soil_boundary(self):
        """
        Test Case 3: จำลองแปลงดินโล่ง/เตรียมแปลง (NDBI = 0.05, NDVI = 0.15)
        NDBI ไม่เกิน 0.10 -> ต้องเข้าสู่ AHP ตามปกติ (skip_ahp=False)
        """
        b8_nir = 0.230
        b4_red = 0.170
        b11_swir = 0.254

        result = evaluate_ndbi_hard_mask(b8_nir, b4_red, b11_swir)

        self.assertFalse(result["skip_ahp"])
        self.assertFalse(result["is_built_up"])

    def test_worldcover_built_up_hard_mask(self):
        """WorldCover Built-up must mask even when the spectral threshold misses it."""
        result = evaluate_ndbi_hard_mask(
            b8_nir=0.205,
            b4_red=0.135,
            b11_swir=0.177,
            land_use_code=50,
        )

        self.assertTrue(result["skip_ahp"])
        self.assertEqual(result["grade"], "N")
        self.assertTrue(result["is_built_up"])
        self.assertIn("WorldCover", result["message"])

if __name__ == "__main__":
    unittest.main()
