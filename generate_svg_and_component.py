import math

# We can generate an SVG that renders the emblem and typography
# In image.png:
# Emblem center cx = 95, cy = 90
# Outer radius = 68
# Words:
# "sou" at x = 185, y = 80
# "energy" at x = 185, y = 145
# Underline at x = 187, y = 158, width = 230, height = 10

# Let's inspect the font:
# Using Fredoka / Nunito / rounded geometric font:
# In Fredoka, 's', 'o', 'u' are lowercase rounded.
# 'e', 'n', 'e', 'r', 'g', 'y' are lowercase rounded.
# White stroke: stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round" paint-order="stroke fill"
# Underline bar:
# rect with rx="5" fill="url(#souBarGrad)" stroke="#FFFFFF" stroke-width="4" paint-order="stroke fill"

# Let's verify the gradient for the bar:
# 0%: #FFC714 (golden yellow)
# 50%: #FF7200 (orange)
# 100%: #E52414 (red)

