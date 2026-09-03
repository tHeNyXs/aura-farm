"""
Unit Tests for AHP Weights Module (Chanthongphun et al., 2565 NCCE27 Model & Consistency Ratio)
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ahp_weights import AHP_WEIGHTS, validate_consistency, get_ahp_metadata

class TestAhpWeights(unittest.TestCase):
    def test_ahp_consistency_ratio_pass(self):
        """
        Test Case 1: ทดสอบว่า Consistency Ratio (CR) ต้องผ่านเกณฑ์ Saaty CR < 0.10 (N=4)
        """
        lambda_max, ci, cr = validate_consistency()

        self.assertEqual(lambda_max, 4.052)
        self.assertEqual(ci, 0.0173)
        self.assertEqual(cr, 0.0192)
        self.assertLess(cr, 0.10)

    def test_ahp_weights_sum_to_one(self):
        """
        Test Case 2: ทดสอบว่าผลรวมของค่าน้ำหนัก AHP ปัจจัยรองด้านกายภาพ 4 ปัจจัย ต้องเท่ากับ 1.0000 (100%)
        """
        total_weight = sum(AHP_WEIGHTS.values())
        self.assertAlmostEqual(total_weight, 1.0000, places=4)

    def test_ahp_metadata_structure(self):
        """
        Test Case 3: ทดสอบโครงสร้างข้อมูล get_ahp_metadata() อ้างอิง จันทองพูน และคณะ (2565), NCCE27
        """
        meta = get_ahp_metadata()

        self.assertTrue(meta["cr_passed"])
        self.assertEqual(meta["weights"]["soil_potential"], 0.4320)
        self.assertEqual(meta["weights"]["water_resources"], 0.3940)
        self.assertEqual(meta["weights"]["climate"], 0.1080)
        self.assertEqual(meta["weights"]["terrain"], 0.0660)
        self.assertEqual(len(meta["weights"]), 4)

if __name__ == "__main__":
    unittest.main()
