"""
Standard Library Test Runner for Aura Farm Backend Tests
"""

import sys
import os
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from tests.test_ndbi_mask import (
    test_ndbi_concrete_roof_hard_mask,
    test_ndbi_green_grass_field,
    test_ndbi_bare_soil_boundary
)
from tests.test_ahp_weights import (
    test_ahp_consistency_ratio_pass,
    test_ahp_weights_sum_to_one,
    test_ahp_metadata_structure
)

class TestNdbiMask(unittest.TestCase):
    def test_roof_mask(self):
        test_ndbi_concrete_roof_hard_mask()

    def test_grass_field(self):
        test_ndbi_green_grass_field()

    def test_bare_soil(self):
        test_ndbi_bare_soil_boundary()

class TestAhpWeights(unittest.TestCase):
    def test_cr_pass(self):
        test_ahp_consistency_ratio_pass()

    def test_weights_sum(self):
        test_ahp_weights_sum_to_one()

    def test_metadata(self):
        test_ahp_metadata_structure()

if __name__ == "__main__":
    unittest.main()
