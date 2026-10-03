"""Build Clawd.js (the file you paste into Scriptable) from Clawd.src.js and pet.html."""
import base64
from pathlib import Path

here = Path(__file__).parent
src = (here / "Clawd.src.js").read_text(encoding="utf-8")
pet = base64.b64encode((here / "pet.html").read_bytes()).decode("ascii")
(here / "Clawd.js").write_text(src.replace("__PET_HTML_B64__", pet), encoding="utf-8")
print("wrote Clawd.js")
