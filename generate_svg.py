import math

# Center of the sun logo
cx, cy = 90, 75

# Let's define a single petal path in polar / bezier form and rotate 6 times by 60 degrees.
# A petal:
# Base orientation (say pointing towards 0 or 90 deg):
# Outer arc from r=62 to r=62, inner arc from r=34 to r=34
# Let's craft bezier points for a smooth comma/curved teardrop:
# (relative to 0,0 center)

# Let's test a path that matches the cashew/pinwheel petal in Sou Energy:
# P0: inner base: (-15, -28)
# P1: outer sweep: (-40, -50), (10, -66), (35, -55)
# P2: outer tip: (46, -42)
# P3: tip cap: (48, -32), (40, -25)
# P4: inner concave curve: (15, -36), (-5, -28), (-15, -28)

