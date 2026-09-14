import math

# Center of logo:
# Emblem: cx = 82, cy = 72, radius = 58
# The 6 petals:
# Petal 0: Red (top-left, ~10 o'clock) -> angle 240 deg (or -120)
# Petal 1: Vivid Orange (top, ~12 o'clock) -> angle 300 deg (or -60)
# Petal 2: Tangerine Orange (top-right, ~2 o'clock) -> angle 0 deg
# Petal 3: Golden Yellow (bottom-right, ~4 o'clock) -> angle 60 deg
# Petal 4: Warm Orange (bottom, ~6 o'clock) -> angle 120 deg
# Petal 5: Deep Coral Orange (bottom-left, ~8 o'clock) -> angle 180 deg

colors = [
    "#E8250F", # Red
    "#FF5F00", # Vivid Orange
    "#FF8900", # Tangerine Orange
    "#FFC814", # Golden Amber Yellow
    "#FF7400", # Warm Orange
    "#FF4800"  # Deep Coral Orange
]

# Let's craft the exact single petal path around (0,0) in degrees:
# Let base be at angle ~ -30 to -10, sweeping to tip at angle ~ 42.
# Let's define the points of 1 petal:
# P_base_inner: (r=26, a=-12) -> x = 25.4, y = -5.4
# P_base_outer: (r=54, a=-18) -> x = 51.3, y = -16.7
# Curve along outer rim: to (r=55, a=42) -> x = 40.8, y = 36.8
# Tip rounded end: from outer tip to inner tip (r=32, a=44)
# Curve along inner rim / aperture: concave curve from (r=32, a=44) back to P_base_inner (r=26, a=-12)

def polar(r, deg):
    rad = math.radians(deg)
    return r * math.cos(rad), r * math.sin(rad)

# Let's create an exact bezier path for 1 petal
# Base: rounded cap between inner base and outer base
# Outer curve: circular arc from outer base to outer tip
# Tip: rounded cap between outer tip and inner tip
# Inner curve: smooth curve back to inner base

