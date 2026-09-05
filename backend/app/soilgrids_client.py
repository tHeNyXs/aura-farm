"""Small, fail-safe SoilGrids client used by the land-evaluation API."""

import json
import logging
from typing import Dict, Tuple
from urllib.error import URLError
from urllib.request import Request, urlopen

logger = logging.getLogger("soilgrids_client")

_FALLBACK_PH = 6.5
_cache: Dict[Tuple[float, float], float] = {}


def get_soil_ph(latitude: float, longitude: float) -> Tuple[float, str]:
    """Return 0–5 cm SoilGrids pH-H2O for one parcel centre.

    SoilGrids stores pH-H2O scaled by 10.  The cache keeps repeated requests for
    the same approximately 11-metre grid location from repeatedly calling ISRIC.
    A neutral fallback is used only when the external service is unavailable.
    """
    cache_key = (round(latitude, 4), round(longitude, 4))
    if cache_key in _cache:
        return _cache[cache_key], "soilgrids_cached"

    url = (
        "https://rest.isric.org/soilgrids/v2.0/properties/query?"
        f"lon={longitude:.6f}&lat={latitude:.6f}"
        "&property=phh2o&depth=0-5cm&value=mean"
    )
    try:
        request = Request(url, headers={"Accept": "application/json", "User-Agent": "AuraFarm-LandEvaluation/2.0"})
        with urlopen(request, timeout=4) as response:
            payload = json.loads(response.read().decode("utf-8"))

        for layer in payload.get("properties", {}).get("layers", []):
            if layer.get("name") != "phh2o":
                continue
            raw_value = layer.get("depths", [{}])[0].get("values", {}).get("mean")
            if isinstance(raw_value, (int, float)):
                ph = round(raw_value / 10, 1)
                if 2.0 <= ph <= 12.0:
                    _cache[cache_key] = ph
                    return ph, "soilgrids_0_5cm"
        logger.warning("SoilGrids returned no usable pH for %.6f, %.6f", latitude, longitude)
    except (URLError, TimeoutError, ValueError, OSError, json.JSONDecodeError) as error:
        logger.warning("SoilGrids pH unavailable for %.6f, %.6f: %s", latitude, longitude, error)

    return _FALLBACK_PH, "fallback_default"
