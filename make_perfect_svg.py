import math

# Center of aperture:
# cx = 82, cy = 72
# 6 petals rotated around (cx, cy)
# Colors of the 6 petals in image.png:
# Going clockwise from top-left:
# 1. Top-left (~10h): Pure Red (#E52213)
# 2. Top (~12h): Vivid Orange (#FF5D00)
# 3. Top-right (~2h): Tangerine Orange (#FF8B00)
# 4. Bottom-right (~4h): Golden Yellow (#FFC714)
# 5. Bottom (~6h): Warm Orange (#FF7200)
# 6. Bottom-left (~8h): Deep Coral Orange (#FF4600)

# Geometry of one petal relative to (0,0):
# Outer radius R_out ~ 54
# Inner radius R_in ~ 26
# Let's inspect the petal shape in image.png:
# It starts at the trailing edge with a rounded head:
# The head is at angle ~ -25 deg, from inner r=27 to outer r=53
# Curves smoothly clockwise along the outer circumference to angle ~ 42 deg
# Then rounds inward to the tip at r=34, angle ~ 48 deg
# Then curves concavely back to the inner aperture at r=27, angle ~ -18 deg
# All corners are smoothly rounded!

# Let's define the path for 1 petal with cubic beziers:
# Start at inner trailing corner
# Arc / bezier to outer trailing corner (rounded head)
# Arc along outer radius to tip
# Rounded tip
# Concave curve along inner aperture back to inner trailing corner
# Close path

# Let's verify angles:
# Rotating by 0, 60, 120, 180, 240, 300 degrees
