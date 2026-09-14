import math

# Let's parameterize the aperture blade (petal)
# There are 6 blades rotated by 60 degrees (0, 60, 120, 180, 240, 300)
# Center: (cx, cy)
# Outer radius R_out ~ 60
# Inner radius R_in ~ 26
# Each blade has:
# 1. Broad rounded head at base
# 2. Outer curved back along R_out
# 3. Rounded tip
# 4. Concave belly forming the aperture

# Let's inspect coordinates for a blade pointing from top-left curving clockwise to top-right
