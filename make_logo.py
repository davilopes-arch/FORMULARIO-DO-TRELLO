import math

# Let's craft the exact SVG for the Sou Energy logo.
# We will create an SVG with viewBox="0 0 460 130"
# Left emblem: cx = 75, cy = 65, radius ~ 52
# 6 petals rotated around (cx, cy)

colors = [
    "#E52421", # Top-left (red)
    "#F75821", # Top (bright orange)
    "#FA8423", # Top-right (tangerine orange)
    "#FFC425", # Bottom-right (golden yellow)
    "#F77023", # Bottom (warm orange)
    "#EE4122"  # Bottom-left (deep orange)
]

# Rotation angles for the 6 petals (in degrees)
# 10 o'clock is ~ -60 or 300 deg.
angles = [300, 0, 60, 120, 180, 240]

# Petal geometry relative to (0,0) center of sun:
# Let's create a smooth curved path for one petal at 0 degrees:
# Outer radius R_out ~ 48..52, Inner radius R_in ~ 22..26
# Sweeping across ~ 52 degrees of arc
# Using SVG path cubic beziers:
# Start at inner base, curve along outer radius to tip, round the tip, curve back along inner radius to base, round base.
petal_d = "M -8,-25 C 2,-42 22,-52 42,-44 C 47,-42 49,-37 46,-33 C 41,-26 31,-20 18,-24 C 6,-27 -1,-23 -8,-25 Z"

# Let's write a precise SVG
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 130" fill="none" class="sou-energy-logo" width="100%" height="100%">
  <defs>
    <linearGradient id="souUnderlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFC425" />
      <stop offset="50%" stop-color="#F77023" />
      <stop offset="100%" stop-color="#E52421" />
    </linearGradient>
    <filter id="logoGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.12" flood-color="#000000" />
    </filter>
  </defs>

  <!-- Sun Symbol (Pinwheel Aperture) -->
  <g transform="translate(80, 65)">
    <!-- 6 Petals with individual brand gradient colors -->
    <!-- Petal 1: Red (top-left) -->
    <path d="M -18,-20 C -12,-38 4,-52 24,-52 C 29,-52 33,-48 31,-43 C 27,-32 17,-23 5,-22 C -6,-21 -13,-18 -18,-20 Z" fill="#E52421" transform="rotate(-60)" />
    <!-- Petal 2: Vivid Orange (top) -->
    <path d="M -18,-20 C -12,-38 4,-52 24,-52 C 29,-52 33,-48 31,-43 C 27,-32 17,-23 5,-22 C -6,-21 -13,-18 -18,-20 Z" fill="#F75821" transform="rotate(0)" />
    <!-- Petal 3: Tangerine (top-right) -->
    <path d="M -18,-20 C -12,-38 4,-52 24,-52 C 29,-52 33,-48 31,-43 C 27,-32 17,-23 5,-22 C -6,-21 -13,-18 -18,-20 Z" fill="#FA8423" transform="rotate(60)" />
    <!-- Petal 4: Golden Yellow (bottom-right) -->
    <path d="M -18,-20 C -12,-38 4,-52 24,-52 C 29,-52 33,-48 31,-43 C 27,-32 17,-23 5,-22 C -6,-21 -13,-18 -18,-20 Z" fill="#FFC425" transform="rotate(120)" />
    <!-- Petal 5: Warm Orange (bottom) -->
    <path d="M -18,-20 C -12,-38 4,-52 24,-52 C 29,-52 33,-48 31,-43 C 27,-32 17,-23 5,-22 C -6,-21 -13,-18 -18,-20 Z" fill="#F77023" transform="rotate(180)" />
    <!-- Petal 6: Deep Orange (bottom-left) -->
    <path d="M -18,-20 C -12,-38 4,-52 24,-52 C 29,-52 33,-48 31,-43 C 27,-32 17,-23 5,-22 C -6,-21 -13,-18 -18,-20 Z" fill="#EE4122" transform="rotate(240)" />
  </g>

  <!-- Typography "sou" and "energy" -->
  <g font-family="system-ui, -apple-system, 'Montserrat', 'Segoe UI', sans-serif" font-weight="800">
    <!-- "sou" -->
    <text x="160" y="55" font-size="44" fill="#F26522" stroke="#FFFFFF" stroke-width="3" paint-order="stroke fill" letter-spacing="-1">sou</text>
    <!-- "energy" -->
    <text x="160" y="98" font-size="48" fill="#F26522" stroke="#FFFFFF" stroke-width="3" paint-order="stroke fill" letter-spacing="-1.5">energy</text>
  </g>

  <!-- Horizontal underline bar -->
  <rect x="162" y="106" width="168" height="7" rx="3.5" fill="url(#souUnderlineGrad)" />
</svg>
'''

with open("public/sou-energy-logo.svg", "w") as f:
    f.write(svg_content)
print("Logo SVG generated successfully at public/sou-energy-logo.svg")
