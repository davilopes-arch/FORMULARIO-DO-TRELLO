import math

def pt(r, deg):
    rad = math.radians(deg)
    return round(r * math.cos(rad), 2), round(r * math.sin(rad), 2)

# One petal (gomo) spanning from ~ -22 degrees to ~ +40 degrees:
# Outer arc from -16 deg to +36 deg at R=54
# Tip from (54, 36 deg) to (30, 42 deg) with round cap
# Inner concave arc from (30, 42 deg) back to (24, -12 deg)
# Rear cap from (24, -12 deg) to (54, -16 deg)

# Let us generate standard SVG cubic bezier path for 1 gomo:
# Start at rear-outer:
# p_ro = pt(52, -16)
# p_to = pt(52, 36)
# p_ti = pt(30, 42)
# p_ri = pt(25, -10)
# Rear rounded cap from p_ri to p_ro
# Outer arc from p_ro to p_to
# Tip rounded cap from p_to to p_ti
# Inner arc from p_ti to p_ri

# Let us create a standalone test script
print("Gomo generator ready")
