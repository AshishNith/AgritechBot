from reportlab.lib.pagesizes import A4
import os

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# ── Output path ──────────────────────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.getcwd(), "StudyNotes")
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)
OUTPUT = os.path.join(OUTPUT_DIR, "Unit3_AM_Detailed_Notes.pdf")

# ── Document setup ────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm,
    topMargin=2.2*cm, bottomMargin=2*cm,
    title="Unit 3 – Liquid & Solid-Based AM Technologies – Detailed Notes"
)

W, H = A4

# ── Colour palette ────────────────────────────────────────────────────────────
DARK_BLUE   = colors.HexColor("#1a237e")
MED_BLUE    = colors.HexColor("#1565c0")
LIGHT_BLUE  = colors.HexColor("#e3f2fd")
ACCENT      = colors.HexColor("#c62828")
GREEN       = colors.HexColor("#2e7d32")
LIGHT_GREEN = colors.HexColor("#e8f5e9")
ORANGE      = colors.HexColor("#e65100")
LIGHT_ORANGE= colors.HexColor("#fff3e0")
GREY_BG     = colors.HexColor("#f5f5f5")
DARK_TEXT   = colors.HexColor("#212121")
WHITE       = colors.white

# ── Styles ─────────────────────────────────────────────────────────────────────
ss = getSampleStyleSheet()

def make_style(name, parent='Normal', **kw):
    return ParagraphStyle(name, parent=ss[parent], **kw)

# Cover / chapter title
COVER_TITLE = make_style('CoverTitle', 'Normal',
    fontSize=26, textColor=WHITE, alignment=TA_CENTER,
    spaceAfter=6, fontName='Helvetica-Bold', leading=32)

COVER_SUB = make_style('CoverSub', 'Normal',
    fontSize=14, textColor=colors.HexColor("#bbdefb"),
    alignment=TA_CENTER, spaceAfter=4, fontName='Helvetica')

# Section / chapter headings
CH = make_style('CH', 'Normal',
    fontSize=16, textColor=WHITE, fontName='Helvetica-Bold',
    spaceAfter=4, spaceBefore=2, leading=20, alignment=TA_LEFT)

SH = make_style('SH', 'Normal',
    fontSize=13, textColor=DARK_BLUE, fontName='Helvetica-Bold',
    spaceBefore=10, spaceAfter=4, leading=16)

SSH = make_style('SSH', 'Normal',
    fontSize=11, textColor=MED_BLUE, fontName='Helvetica-Bold',
    spaceBefore=7, spaceAfter=3, leading=14)

BODY = make_style('BODY', 'Normal',
    fontSize=10, textColor=DARK_TEXT, fontName='Helvetica',
    leading=15, spaceAfter=4, alignment=TA_JUSTIFY)

BULLET = make_style('BULLET', 'Normal',
    fontSize=10, textColor=DARK_TEXT, fontName='Helvetica',
    leading=14, spaceAfter=3, leftIndent=14, bulletIndent=0,
    alignment=TA_JUSTIFY)

SUBBULLET = make_style('SUBBULLET', 'Normal',
    fontSize=9.5, textColor=DARK_TEXT, fontName='Helvetica',
    leading=13, spaceAfter=2, leftIndent=28, bulletIndent=14,
    alignment=TA_JUSTIFY)

KEY = make_style('KEY', 'Normal',
    fontSize=9.5, textColor=DARK_TEXT, fontName='Helvetica',
    leading=13, spaceAfter=2, leftIndent=14,
    backColor=LIGHT_BLUE, borderPad=3, alignment=TA_LEFT)

FORMULA = make_style('FORMULA', 'Normal',
    fontSize=10, textColor=colors.HexColor("#4a148c"),
    fontName='Helvetica-Bold', leading=14, spaceAfter=2,
    leftIndent=20, alignment=TA_LEFT)

NOTE = make_style('NOTE', 'Normal',
    fontSize=9.5, textColor=GREEN, fontName='Helvetica-Oblique',
    leading=13, spaceAfter=3, leftIndent=12)

CAUTION = make_style('CAUTION', 'Normal',
    fontSize=9.5, textColor=ACCENT, fontName='Helvetica-Bold',
    leading=13, spaceAfter=3, leftIndent=12)

TABLE_H = make_style('TABLE_H', 'Normal',
    fontSize=9.5, textColor=WHITE, fontName='Helvetica-Bold',
    leading=12, alignment=TA_CENTER)

TABLE_C = make_style('TABLE_C', 'Normal',
    fontSize=9, textColor=DARK_TEXT, fontName='Helvetica',
    leading=11, alignment=TA_LEFT)

# ── Helper builders ────────────────────────────────────────────────────────────

def chapter_banner(text, color=DARK_BLUE):
    """Full-width coloured banner for chapter title."""
    data = [[Paragraph(text, CH)]]
    t = Table(data, colWidths=[doc.width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('ROUNDEDCORNERS', [6,6,6,6]),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING',   (0,0), (-1,-1), 14),
    ]))
    return t

def section_box(text, color=MED_BLUE):
    """Coloured left-border section header."""
    data = [[Paragraph(text, SH)]]
    t = Table(data, colWidths=[doc.width])
    t.setStyle(TableStyle([
        ('LINEBEFOREE', (0,0), (0,-1), 5, color),
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BLUE),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
    ]))
    return t

def sub_section(text):
    return Paragraph(text, SSH)

def body(text):
    return Paragraph(text, BODY)

def bull(text, level=1):
    style = BULLET if level == 1 else SUBBULLET
    bullet = "•" if level == 1 else "◦"
    return Paragraph(f"{bullet}  {text}", style)

def formula(text):
    return Paragraph(text, FORMULA)

def note(text):
    return Paragraph(f"📝 Note: {text}", NOTE)

def caution(text):
    return Paragraph(f"⚠ Important: {text}", CAUTION)

def sp(n=6):
    return Spacer(1, n)

def hr(color=MED_BLUE, thickness=0.7):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=4, spaceBefore=4)

def info_box(title, items, bg=LIGHT_GREEN, title_color=GREEN):
    rows = [[Paragraph(f"<b>{title}</b>", make_style('IH','Normal',
        fontSize=10, textColor=WHITE, fontName='Helvetica-Bold',
        leading=13, alignment=TA_LEFT))]]
    for item in items:
        rows.append([Paragraph(f"• {item}", TABLE_C)])
    t = Table(rows, colWidths=[doc.width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), title_color),
        ('BACKGROUND', (0,1), (-1,-1), bg),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#cccccc")),
    ]))
    return t

def two_col_table(headers, rows, col_w=None):
    if col_w is None:
        col_w = [doc.width/len(headers)] * len(headers)
    data = [[Paragraph(h, TABLE_H) for h in headers]]
    for r in rows:
        data.append([Paragraph(str(c), TABLE_C) for c in r])
    t = Table(data, colWidths=col_w)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK_BLUE),
        ('BACKGROUND', (0,1), (-1,-1), GREY_BG),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, GREY_BG]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#bdbdbd")),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING',   (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    return t

# ══════════════════════════════════════════════════════════════════════════════
#  BUILD STORY
# ══════════════════════════════════════════════════════════════════════════════
story = []

# ─────────────────────────────────────────────────────────────────────────────
#  COVER PAGE
# ─────────────────────────────────────────────────────────────────────────────
cover_data = [[Paragraph("UNIT – 3", COVER_TITLE)],
              [Paragraph("Liquid-Based & Solid-Based", COVER_TITLE)],
              [Paragraph("Additive Manufacturing Technologies", COVER_TITLE)],
              [Spacer(1, 10)],
              [Paragraph("Comprehensive Study Notes", COVER_SUB)],
              [Paragraph("Additive Manufacturing | B.Tech / M.Tech", COVER_SUB)]]
cover_t = Table(cover_data, colWidths=[doc.width])
cover_t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), DARK_BLUE),
    ('TOPPADDING',    (0,0), (-1,-1), 14),
    ('BOTTOMPADDING', (0,0), (-1,-1), 14),
    ('ROUNDEDCORNERS', [10,10,10,10]),
]))
story += [sp(30), cover_t, sp(20)]

# Contents box
toc_items = [
    "PART A – LIQUID-BASED ADDITIVE MANUFACTURING",
    "  1. Introduction & Classification",
    "  2. Photo-polymerization – Working Principle",
    "  3. Sub-systems of Photo-polymerization",
    "  4. Stereolithography Apparatus (SLA)",
    "  5. Rapid Freeze Prototyping (RFP)",
    "PART B – SOLID-BASED ADDITIVE MANUFACTURING",
    "  6. Sheet-Based AM – Classification & Approach",
    "  7. Laminated Object Manufacturing (LOM)",
    "  8. Kira's Paper Lamination Technology (PLT)",
    "  9. Plastic Sheet Lamination (PSL)",
    " 10. CAM-LEM",
    " 11. Ennex Corporation's Offset Fabbers",
    " 12. Ultrasonic Consolidation (UC)",
    " 13. Fused Deposition Modeling (FDM) – Full Detail",
]
story.append(info_box("📋  TABLE OF CONTENTS", toc_items, bg=LIGHT_BLUE, title_color=DARK_BLUE))
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  PART A  –  LIQUID-BASED AM
# ══════════════════════════════════════════════════════════════════════════════
story.append(chapter_banner("PART A  –  LIQUID-BASED ADDITIVE MANUFACTURING", color=ACCENT))
story.append(sp(10))

# ─────────────────────────────────────────────────────────────────────────────
#  1. INTRODUCTION & CLASSIFICATION
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("1.  Introduction to Liquid-Based AM"))
story.append(sp(4))

story.append(body(
    "In Liquid-Based Additive Manufacturing (AM), the raw material used for building "
    "the three-dimensional object is in <b>liquid form</b>. The liquid is then selectively "
    "solidified layer by layer to create the desired object. This is one of the oldest and "
    "most widely researched categories of AM."))
story.append(sp(4))

story.append(sub_section("1.1  ASTM Classification of AM Processes"))
story.append(body("The American Society for Testing and Materials (ASTM) classifies all AM processes into 7 broad categories:"))
story.append(sp(3))

astm_rows = [
    ["Vat Photo-Polymerization", "Uses a vat of liquid photopolymer resin cured by UV light (e.g., SLA, DLP)"],
    ["Material Jetting", "Droplets of build material are jetted and cured (e.g., Objet Polyjet)"],
    ["Binder Jetting", "A liquid binding agent is jetted onto a powder bed to bond layers"],
    ["Material Extrusion", "Material is extruded through a heated nozzle (e.g., FDM/FFF)"],
    ["Sheet Lamination", "Sheets of material are bonded and cut layer by layer (e.g., LOM)"],
    ["Powder Bed Fusion", "Thermal energy selectively fuses powder material (e.g., SLS, SLM)"],
    ["Directed Energy Deposition", "Focused thermal energy melts material as it is deposited (e.g., LENS)"],
]
story.append(two_col_table(
    ["AM Category", "Description / Example"],
    astm_rows,
    col_w=[6.5*cm, 11*cm]
))
story.append(sp(6))

story.append(sub_section("1.2  Liquid AM: Further Classification"))
story.append(body(
    "Within the liquid-AM category, two distinct routes of manufacturing are recognised:"))
story.append(bull("<b>Polymerization (Photo-polymerization):</b> The liquid resin (photopolymer) "
    "undergoes a chemical reaction (polymerization) when exposed to UV light, turning from liquid "
    "to solid. This is the most widely used liquid AM route."))
story.append(bull("<b>Rapid Freezing (Rapid Freeze Prototyping – RFP):</b> A liquid (usually water) "
    "is deposited and immediately frozen layer by layer to build an ice-based 3D object. "
    "It is an environmentally friendly and low-cost alternative."))
story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  2. PHOTO-POLYMERIZATION
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("2.  Photo-polymerization – Working Principle"))
story.append(sp(4))

story.append(body(
    "Photo-polymerization is the chemical process in which <b>light energy (UV)</b> is used to "
    "trigger the conversion of liquid monomer/resin molecules into a solid polymer network. "
    "It is the fundamental principle behind several AM processes such as SLA, DLP, and Objet PolyJet."))
story.append(sp(5))

story.append(sub_section("2.1  Key Ingredients"))
story.append(two_col_table(
    ["Component", "Role"],
    [
        ["Photoinitiator (Pᵢ)", "A chemical compound that absorbs UV photons and generates reactive free radicals."],
        ["Monomer (M)", "The liquid building block; small molecules that link together to form a polymer chain."],
        ["UV Light (hν)", "Energy source that excites the photoinitiator and starts the chain reaction."],
    ],
    col_w=[5.5*cm, 12*cm]
))
story.append(sp(6))

story.append(sub_section("2.2  Step-by-Step Chemical Process"))

steps = [
    ("Step 1 – Photoinitiator Excitation",
     "When UV light (photons of energy hν) hits the photoinitiator molecules (Pᵢ), "
     "they absorb the energy and get excited into a high-energy state."),
    ("Step 2 – Free Radical Generation",
     "The excited photoinitiator breaks down and produces highly reactive free radicals (Pᵢ·). "
     "These radicals are unstable species that eagerly react with surrounding molecules."),
    ("Step 3 – Chain Initiation",
     "The free radical (Pᵢ·) attacks a nearby monomer molecule (M), opening its double bond "
     "and creating a new larger radical (Pᵢ–M·). This is the start of the polymer chain."),
    ("Step 4 – Chain Propagation",
     "The growing chain radical (Pᵢ–M·) continuously reacts with more monomer molecules, "
     "adding them one by one. The chain grows rapidly: Pᵢ–M–M–M–…–Mₙ·"),
    ("Step 5 – Chain Termination",
     "The chain growth stops when two growing chain radicals combine (recombination) or "
     "when a radical reacts with an inhibitor. The result is a solid, cross-linked polymer network."),
]
for title, desc in steps:
    story.append(Paragraph(f"<b>{title}</b>", SSH))
    story.append(body(desc))
    story.append(sp(3))

story.append(note(
    "The entire reaction happens almost instantaneously at the point where UV light touches "
    "the resin surface. The surrounding unexposed resin remains liquid and can be reused."))
story.append(sp(4))

story.append(sub_section("2.3  Overall Layer Building Sequence"))
seq = [
    "UV light scans the cross-section of the current layer, selectively curing the resin.",
    "After complete curing of that layer, the build platform moves up or down (depending on machine type) by one layer thickness.",
    "Fresh liquid resin flows/spreads over the newly cured layer (recoating).",
    "The UV light scans the next layer cross-section; the new layer fuses with the previous one.",
    "This process repeats for every layer until the full object is built.",
    "Finally, uncured liquid resin is drained from the vat; the object is cleaned and post-cured.",
]
for s in seq:
    story.append(bull(s))
story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  3. SUB-SYSTEMS
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("3.  Sub-Systems of a Photo-polymerization AM Machine"))
story.append(sp(4))
story.append(body(
    "Every photo-polymerization based AM machine has five key sub-systems. "
    "The combination of choices made for each sub-system defines the specific AM process/machine variant."))
story.append(sp(5))

subsystems = [
    ("Sub-system 1", "Photo-polymer Liquid",
     "The raw material – a liquid resin containing monomers, oligomers, and photoinitiators. "
     "Can be stored in a <b>Vat (tank)</b> or delivered as <b>Jets (inkjet heads)</b>."),
    ("Sub-system 2", "UV Light Source",
     "Two types: (a) <b>Laser Beam</b> – highly focused, high-energy spot, used in SLA. "
     "(b) <b>Flood Light</b> – diffuse light spread over the whole area at once, used in DLP/SGC."),
    ("Sub-system 3", "Scanning System",
     "Controls how the UV light traces the layer cross-section. Types: "
     "<b>Galvanometer</b> (rotating mirrors), <b>Flying Liquid</b>, "
     "<b>Flying Optics</b> (moving optics), <b>DLP</b> (Digital Light Processing – uses a DMD chip), "
     "<b>Mask</b> (physical or digital mask exposing full layer at once)."),
    ("Sub-system 4", "Build Direction",
     "The direction in which the object is built up: "
     "<b>+Z Direction</b> – platform moves down, resin floods over top (conventional SLA). "
     "<b>−Z Direction</b> – platform moves up, curing from below through a transparent window (bottom-up approach). "
     "<b>Variable Direction</b> – robotic systems."),
    ("Sub-system 5", "Recoating System",
     "Mechanism to spread a fresh layer of liquid resin after each layer cure: "
     "<b>Deep Dipping</b> – platform dips deep then rises to correct level (slow). "
     "<b>Top Feeding</b> – resin fed from above with a blade (doctor blade) spreading it flat. "
     "<b>Bottom Feeding</b> – resin fed from below through a transparent window."),
]

for num, name, desc in subsystems:
    data = [[Paragraph(f"<b>{num}: {name}</b>", make_style('SBH','Normal',
        fontSize=10.5, textColor=WHITE, fontName='Helvetica-Bold', leading=13)),
             Paragraph(desc, TABLE_C)]]
    t = Table(data, colWidths=[4.5*cm, 13*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), MED_BLUE),
        ('BACKGROUND', (1,0), (1,0), LIGHT_BLUE),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#aaaaaa")),
    ]))
    story.append(t)
    story.append(sp(4))

story.append(sp(4))
story.append(sub_section("3.1  Scanning System – Detailed Explanation"))

scan_rows = [
    ["Galvanometer", "Two rotating galvanometer mirrors (X and Y) deflect the laser beam to any point on the resin surface. An F-theta lens converts the angular scan into a flat focal plane. Fast and accurate. Slight elliptical beam distortion at edges."],
    ["Flying Liquid", "The nozzle/emitter physically moves in X-Y. Simpler but slower than galvanometer."],
    ["Flying Optics", "The entire optical assembly (laser + focusing lens) moves in X-Y over the stationary vat. Uniform beam profile everywhere."],
    ["DLP (Digital Light Processing)", "A Digital Micromirror Device (DMD) – a chip with millions of tiny mirrors – projects the entire layer image onto the resin surface at once. Cures the whole layer simultaneously. Much faster than point-by-point laser scanning."],
    ["Mask", "A physical or LCD mask blocks/allows light to define the layer shape. Simpler version of DLP concept."],
]
story.append(two_col_table(
    ["Scanning Type", "How It Works"],
    scan_rows,
    col_w=[4*cm, 13.5*cm]
))
story.append(sp(6))

story.append(sub_section("3.2  Recoating System – Detailed Comparison"))
recoat_rows = [
    ["Deep Dipping", "After each layer, the platform dips well below the surface then slowly rises back. Gravity and surface tension spread a fresh resin layer. Simple but slowest method; can cause resin turbulence."],
    ["Top Feeding (Doctor Blade)", "A wiper blade (doctor blade) sweeps across the vat top surface to spread a precise, uniform layer of fresh resin after each cure. Used in 3D Systems SLA (Zephyr). More accurate layer thickness control."],
    ["Bottom Feeding", "Resin is held in a small vat with a transparent FEP/PDMS bottom. UV shines from below. Part is pulled upward. Each new layer is cured at the very bottom of the vat. Minimal resin usage, no blade needed. Used in desktop MSLA/DLP printers."],
]
story.append(two_col_table(
    ["Recoating Method", "Mechanism & Notes"],
    recoat_rows,
    col_w=[4*cm, 13.5*cm]
))
story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  4. SLA
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("4.  Stereolithography Apparatus (SLA)"))
story.append(sp(4))

story.append(body(
    "SLA was the <b>world's first commercial AM process</b>, patented by Chuck Hull in 1986 "
    "and commercialised by <b>3D Systems Inc.</b>  It remains one of the most accurate and "
    "widely used liquid AM processes, especially for detailed prototypes, jewellery, "
    "dental, and medical applications."))
story.append(sp(5))

story.append(sub_section("4.1  Key Characteristics"))
story.append(two_col_table(
    ["Parameter", "Details"],
    [
        ["Also Known As", "STL / SLA"],
        ["Joining / Curing Principle", "Selective exposure of liquid photopolymer to a focused UV laser beam, directed by galvanometer scanning mirrors (or DLP micromirror arrays in newer variants)"],
        ["Raw Material Form", "Liquid (contained in a vat)"],
        ["Materials Used", "Thermosetting plastics – primarily Acrylic resins and Epoxy resins"],
        ["UV Light Type", "Laser Beam (typically He-Cd or Nd:YVO4 laser, 325 nm or 355 nm wavelength)"],
        ["Build Direction", "+Z direction (platform descends)"],
        ["Recoating Method", "Deep Dipping OR Top Feeding (Zephyr blade system in newer models)"],
        ["Scanning System", "Galvanometer mirrors"],
        ["Layer Thickness Range", "Typically 0.05 mm to 0.15 mm"],
        ["Surface Finish", "Excellent – smooth surface, suitable for photo-elasticity"],
    ],
    col_w=[5*cm, 12.5*cm]
))
story.append(sp(6))

story.append(sub_section("4.2  Complete Process Chain of SLA"))

pc_steps = [
    ("Pre-Processing Step 1 – CAD Model",
     "A 3D CAD model of the desired object is created using any CAD software (SolidWorks, CATIA, etc.). "
     "The model must be a closed, watertight solid."),
    ("Pre-Processing Step 2 – Triangulation (STL File)",
     "The CAD model is exported as an STL (Standard Tessellation Language) file. "
     "The curved surfaces are approximated by a mesh of triangles. "
     "A finer mesh gives better accuracy but a larger file. "
     "The STL file also includes the orientation of the geometry in the machine workspace."),
    ("Pre-Processing Step 3 – Support Generation",
     "Overhanging features, islands, and undercuts cannot be built without support. "
     "The slicing software automatically generates support structures – thin, breakable columns/webs – "
     "wherever the part geometry requires them. Supports are also made of the same photopolymer."),
    ("Pre-Processing Step 4 – Slicing",
     "The STL file (part + support) is mathematically sliced into horizontal layers of equal thickness. "
     "The boundary contour of each slice is extracted as a 2D cross-section profile. "
     "Machine parameters (beam diameter, scan speed, laser offset, grid sizes) are also set at this stage."),
    ("Build Step – Data Transfer and Layer-by-Layer Exposure",
     "The sliced data is transferred to the SLA machine. "
     "The machine sets up the job, positions the build platform, and starts the build. "
     "For each layer: (a) Platform rises/lowers to correct height, (b) Recoating system applies fresh resin, "
     "(c) Laser scans the layer boundary (contour) and interior (hatch pattern) to cure it, "
     "(d) Platform moves down one layer thickness. This repeats for all layers."),
    ("Post-Processing Step 1 – Part Removal & Cleaning",
     "After all layers are built, the platform is raised. The part (still wet with uncured resin) "
     "is carefully removed. Excess liquid resin is drained back into the vat. "
     "The part is cleaned in an IPA (isopropyl alcohol) bath to remove all uncured resin. "
     "Support structures are manually broken off or dissolved."),
    ("Post-Processing Step 2 – Post Curing",
     "The cleaned part is placed in a UV curing oven (Post Cure Apparatus – PCA). "
     "This final UV exposure ensures complete polymerization throughout the part volume, "
     "improving mechanical properties (hardness, strength) to their maximum values."),
    ("Post-Processing Step 3 – Surface Finishing (Optional)",
     "Sanding, painting, polishing, or lacquer coating may be applied as required for the application. "
     "A lacquer coat prevents moisture absorption which can cause warping."),
]

for title, desc in pc_steps:
    data = [[Paragraph(f"<b>{title}</b>", make_style('PCH','Normal',
        fontSize=10, textColor=DARK_BLUE, fontName='Helvetica-Bold', leading=13)),
             Paragraph(desc, TABLE_C)]]
    t = Table(data, colWidths=[5.5*cm, 12*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), LIGHT_BLUE),
        ('BACKGROUND', (1,0), (1,0), GREY_BG),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#cccccc")),
    ]))
    story.append(t)
    story.append(sp(3))

story.append(sp(5))
story.append(sub_section("4.3  Advantages of SLA"))
adv_sla = [
    "Fastest and most accurate among all photo-polymerization processes (due to fine-tuned galvanometer system and extensive R&D).",
    "Capable of producing transparent parts with excellent surface finish – ideal for optical and photo-elasticity applications.",
    "Quick Cast option: SLA parts can be used directly as patterns for investment casting of any metal.",
    "Very fine feature resolution achievable – suitable for jewellery, dental models, surgical guides.",
    "Wide variety of photopolymer materials available (rigid, flexible, high-temperature, biocompatible).",
    "No post-build support waste – uncured resin is recyclable back into the vat.",
]
for a in adv_sla:
    story.append(bull(a))
story.append(sp(5))

story.append(sub_section("4.4  Limitations of SLA"))
lim_sla = [
    "High equipment cost and high material cost (photopolymer resins are expensive compared to FDM filaments).",
    "Parts can become brittle over time due to continued slow polymerization caused by ambient light exposure.",
    "Material is limited to photopolymers only – cannot process metals, ceramics, or standard thermoplastics directly.",
    "Not suitable for office environments: UV-curable resins produce fumes and are health hazards; require ventilation.",
    "Support removal can be tedious for complex geometries.",
    "Mechanical properties are generally inferior to injection-moulded equivalents.",
]
for l in lim_sla:
    story.append(bull(l))
story.append(sp(8))

# SLA Variants table
story.append(sub_section("4.5  Comparison of Major Photo-polymerization AM Variants"))
variant_rows = [
    ["3D Systems SLA (Standard)", "Galvanometer", "Laser", "Vat", "+Z", "Deep Dipping"],
    ["3D Systems SLA (Zephyr)", "Galvanometer", "Laser", "Vat", "+Z", "Top Feeding (Blade)"],
    ["Microstereolithography", "Flying Optics", "Laser", "Vat", "+Z / −Z", "Top Feeding"],
    ["Objet PolyJet", "Flying Liquid", "Flood (UV lamp)", "Jet", "+Z", "Top Feeding"],
    ["Autostrade E-Dart", "Flying Optics", "Laser", "Vat", "−Z", "Bottom Feeding"],
    ["Perfactory Acculas (DLP)", "DLP (DMD)", "Flood (projector)", "Vat", "−Z", "Bottom Feeding"],
    ["Solid Ground Curing (SGC)", "Mask", "Flood", "Vat", "+Z", "Top Feeding"],
    ["Robotic SLA", "Variable", "Laser", "Vat", "Variable", "Top Feeding"],
]
story.append(two_col_table(
    ["Process", "Scanning", "Light", "Liquid", "Build Dir.", "Recoating"],
    variant_rows,
    col_w=[4.5*cm, 3.2*cm, 3.2*cm, 2.0*cm, 2.5*cm, 2.1*cm]
))
story.append(sp(8))
story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
#  5. RAPID FREEZE PROTOTYPING
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("5.  Rapid Freeze Prototyping (RFP)"))
story.append(sp(4))

story.append(body(
    "Rapid Freeze Prototyping (RFP) was developed by <b>Dr. Ming Leu</b> at the "
    "<b>University of Missouri–Rolla, Virtual & Rapid Prototyping Lab.</b> It is an "
    "environmentally friendly, low-cost AM process that builds 3D objects out of <b>ice</b> "
    "by freezing water droplets layer by layer. It addresses the main weaknesses of "
    "polymerization-based processes: high cost, hazardous chemicals, and fumes."))
story.append(sp(5))

story.append(sub_section("5.1  Why RFP? Motivation"))
motiv = [
    "Most photo-polymerization AM processes are expensive (materials + equipment).",
    "They generate hazardous chemicals, smoke, and dust harmful to human health and the environment.",
    "A demand existed for a process that is fast, clean, cheap, and environmentally safe.",
    "RFP uses only water (and a sugar solution for supports) – completely non-toxic and recyclable.",
]
for m in motiv:
    story.append(bull(m))
story.append(sp(5))

story.append(sub_section("5.2  System Components"))
rfp_comps = [
    ["3D Positioning Subsystem", "An XYZ motion stage that moves the nozzle to precise locations in X and Y, and the build platform (elevator) in the Z direction."],
    ["Liquid Deposition Subsystem", "Includes the nozzle, switching valve, syringe (driven by a stepping motor), and feeding pipe. Can use either a Continuous nozzle or a Drop-on-Demand nozzle for precise droplet placement."],
    ["Freezing Chamber", "The entire XYZ table is enclosed in a chamber maintained at approximately −20°C. The cold environment causes deposited water droplets to freeze almost instantly through convection (from cold air) and conduction (from the previously frozen layer below)."],
    ["Electronic Control Device", "Computer-based controller that coordinates nozzle movement, valve opening/closing, and platform Z-movement based on the sliced CAD data."],
]
story.append(two_col_table(
    ["Sub-system", "Description"],
    rfp_comps,
    col_w=[5*cm, 12.5*cm]
))
story.append(sp(6))

story.append(sub_section("5.3  Build Material & Support Material"))
story.append(body("RFP uses a two-material system:"))
story.append(bull("<b>Build Material:</b> Pure water (freezes at 0°C). The main body of the ice part is built from pure water droplets."))
story.append(bull("<b>Support Material:</b> A eutectic sugar solution – C₆H₁₂O₆ – H₂O (glucose–water solution). This solution has a lower freezing point than pure water. It is deposited in the support regions of each layer (for overhangs and undercuts)."))
story.append(sp(4))
story.append(body(
    "<b>Support Removal:</b> After the complete ice object is built at −20°C, the temperature "
    "is raised to approximately −4°C. At this temperature, the pure water (part body) remains "
    "frozen solid, but the eutectic sugar solution (support material) melts and flows away. "
    "This gives clean, automatic support removal without any mechanical force."))
story.append(sp(5))

story.append(sub_section("5.4  Two Nozzle Methods in RFP"))
story.append(bull("<b>Continuous Nozzle:</b> A steady stream of liquid flows from the nozzle. Less precise droplet control. Suitable for areas requiring large material volume."))
story.append(bull("<b>Drop-on-Demand (DoD) Nozzle:</b> Individual droplets are ejected one at a time on command. Gives much finer control over droplet placement and size. Better for fine features and support deposition."))
story.append(sp(5))

story.append(sub_section("5.5  Step-by-Step RFP Build Process"))
rfp_process = [
    "The sliced CAD data is loaded into the RFP controller.",
    "The freezing chamber temperature is set to −20°C.",
    "The build platform (Z-elevator) is positioned at the starting height.",
    "The nozzle moves in X-Y and deposits water droplets layer by layer at the part cross-section positions; the support material nozzle deposits the sugar solution at support positions.",
    "The deposited droplets freeze almost instantly due to the −20°C environment.",
    "After each layer, the elevator lowers by one layer thickness.",
    "Steps 4–6 repeat for all layers until the full ice part is built.",
    "Temperature is raised to −4°C to melt the sugar support material.",
    "The ice part is removed and can be used as a pattern for casting or as a display model.",
]
for i, s in enumerate(rfp_process):
    story.append(bull(f"Step {i+1}: {s}"))
story.append(sp(5))

story.append(sub_section("5.6  Advantages & Limitations of RFP"))

adv_rfp = [
    "Completely non-toxic raw material (water) – safe for office and lab environments.",
    "Very low material cost (water is essentially free; sugar solution is inexpensive).",
    "No need for post-curing, no hazardous waste disposal.",
    "Good layer bonding strength (ice bonds well at low temperatures).",
    "Fine build resolution achievable with DoD nozzle.",
    "Support material (sugar solution) removed automatically by temperature change – no mechanical damage to part.",
    "Ideal for investment casting patterns, food industry, and educational demonstrations.",
]
lim_rfp = [
    "Parts are fragile and temporary – they melt at room temperature (limited shelf life without refrigeration).",
    "Limited material (only water/ice) – cannot produce load-bearing or thermally stable parts.",
    "Requires maintaining a −20°C environment throughout the build process (energy cost).",
    "Not suitable for large-scale industrial production.",
    "Limited surface finish compared to SLA.",
]

story.append(info_box("✅  Advantages of RFP", adv_rfp, bg=LIGHT_GREEN, title_color=GREEN))
story.append(sp(4))
story.append(info_box("❌  Limitations of RFP", lim_rfp, bg=LIGHT_ORANGE, title_color=ORANGE))
story.append(sp(8))
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  PART B  –  SOLID-BASED AM
# ══════════════════════════════════════════════════════════════════════════════
story.append(chapter_banner("PART B  –  SOLID-BASED ADDITIVE MANUFACTURING", color=GREEN))
story.append(sp(10))

story.append(body(
    "In Solid-Based AM, the raw material is in solid form – typically sheets, wires/filaments, "
    "or powder. This part covers <b>Sheet-Based AM</b> and <b>Wire-Based AM (FDM)</b>."))
story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  6. SHEET-BASED AM
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("6.  Sheet-Based Additive Manufacturing – Overview & Classification"))
story.append(sp(4))

story.append(body(
    "In sheet-based AM, the raw material comes in thin sheet (laminate) form. "
    "Each sheet corresponds to one layer of the 3D object. The sheets are bonded together "
    "and cut (or cut then bonded) to build up the 3D object."))
story.append(sp(5))

story.append(sub_section("6.1  Classification Parameters"))
story.append(body("Sheet-based AM processes differ in:"))

class_params = [
    ["Materials", "Paper, Plastic, Ceramic, Metal"],
    ["Approach", "Bond-then-Form  OR  Form-then-Bond"],
    ["Cutting Method", "Laser, Knife (mechanical blade), Milling, Water Jet"],
    ["Bonding Method", "Adhesive, Sintering, Diffusion Bonding, Spot Welding, Soldering/Brazing"],
    ["Joining Region", "Entire sheet bonded (whole area) OR Selective bonding (only part region)"],
]
story.append(two_col_table(
    ["Classification Parameter", "Options"],
    class_params,
    col_w=[5.5*cm, 12*cm]
))
story.append(sp(6))

story.append(sub_section("6.2  Two Fundamental Approaches Explained"))

story.append(Paragraph("<b>Approach 1: Bond-then-Form (BtF)</b>", SSH))
story.append(body(
    "In BtF, the full sheet is first bonded (glued/laminated) onto the previous layer, "
    "and then the laser/knife cuts the outline of the layer. "
    "The unneeded surrounding material remains as a support structure."))
story.append(bull("Handling is EASY – you only move the full reel; no need to handle individual cut pieces."))
story.append(bull("The waste material (surrounding scrap) automatically acts as support for overhanging features."))
story.append(bull("Main drawback: Decubing – removing the waste support material after the build is complete – is very time-consuming (can take several hours for complex parts)."))
story.append(bull("Best suited for flexible/paper-like sheet materials."))
story.append(sp(4))

story.append(Paragraph("<b>Approach 2: Form-then-Bond (FtB)</b>", SSH))
story.append(body(
    "In FtB, each sheet is first cut to the exact layer shape, and then the cut piece "
    "is bonded onto the growing structure. "))
story.append(bull("No decubing needed – waste material is never bonded."))
story.append(bull("Handling is DIFFICULT – cut pieces may be small, odd-shaped, or multiple pieces per layer; handling individual pieces is tricky."))
story.append(bull("Requires a separate support mechanism since the scrap does not support overhangs."))
story.append(bull("Better suited for rigid materials (ceramics, metals) where precise pre-cut layers can be handled."))
story.append(sp(6))

# Decubing definition
story.append(Paragraph("<b>What is Decubing?</b>", SSH))
story.append(body(
    "Decubing (also called 'de-cubing') is the post-build process of removing the unwanted "
    "support/waste material from around and inside the built part. In BtF sheet AM (e.g., LOM), "
    "the waste material is cut into a hatched/cross-hatch grid pattern during the build "
    "(to make removal easier). After the build, this gridded waste is manually broken off "
    "using chisels, screwdrivers, or other hand tools. The process can take several hours "
    "for complex geometries."))
story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  7. LOM
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("7.  Laminated Object Manufacturing (LOM) – Cubic Technologies"))
story.append(sp(4))

story.append(body(
    "LOM is the most well-known sheet-based AM process. It was developed and commercialised "
    "by <b>Helisys Inc.</b> (later renamed <b>Cubic Technologies</b>). "
    "It uses the <b>Bond-then-Form</b> approach with <b>adhesive-coated paper</b> sheets "
    "cut by a <b>CO₂ laser</b>."))
story.append(sp(5))

story.append(sub_section("7.1  LOM Sub-system Summary"))
story.append(two_col_table(
    ["Sub-system", "LOM Choice"],
    [
        ["Material", "Paper (primarily), also plastic composites"],
        ["Approach", "Bond-then-Form"],
        ["Cutting Method", "CO₂ Laser"],
        ["Bonding Method", "Adhesive (heat-activated, pre-coated on bottom of paper roll)"],
        ["Joining Region", "Entire sheet bonded by hot roller"],
        ["Recoating", "Paper feeds from supply roll; waste taken up by take-up roll"],
        ["Build Direction", "+Z (platform descends)"],
    ],
    col_w=[5*cm, 12.5*cm]
))
story.append(sp(6))

story.append(sub_section("7.2  Three Phases of LOM"))

story.append(Paragraph("<b>Phase 1: Pre-processing</b>", SSH))
pre_lom = [
    "Prepare 3D CAD model and convert to STL file.",
    "Orient the geometry inside the machine's build volume (some users tilt the part 10°–15° to avoid any surfaces becoming perfectly horizontal, which could cause stair-stepping artifacts).",
    "Generate slices and extract boundary contours from the STL file for each layer.",
    "Set machine parameters: beam diameter, beam offset (to compensate for laser kerf width), grid sizes for waste hatching (normal grid and fine grid), number of dummy buffer layers, bridging gap between two separate cuts.",
]
for p in pre_lom:
    story.append(bull(p))
story.append(sp(4))

story.append(Paragraph("<b>Phase 2: Build Process (repeated for each layer)</b>", SSH))
build_lom = [
    "The paper reel (with heat-activated adhesive on its bottom surface) indexes forward by a fixed distance to cover the build area.",
    "The build platform rises to the required height (just below the paper surface).",
    "A heated roller (laminating roller) rolls over the paper with pressure, activating the adhesive and bonding the new paper sheet firmly to the previous layer.",
    "The machine measures the actual height of the new layer and passes this information to the slicing software for compensation.",
    "The CO₂ laser cuts the layer boundary (contour) of the object cross-section. The laser offset is applied to compensate for the laser beam width (kerf).",
    "The laser also cuts a cross-hatch (grid) pattern into the waste area surrounding the object boundary. This converts the waste into small cubes for easy removal later (decubing).",
    "A 'parting off' cut is made to separate the used paper portion from the feed reel.",
    "The platform lowers by a considerable distance to allow the reel to advance without friction.",
]
for i, b in enumerate(build_lom):
    story.append(bull(f"Step {i+1}: {b}"))
story.append(sp(4))

story.append(Paragraph("<b>Phase 3: Post-processing</b>", SSH))
post_lom = [
    "After all layers are completed, the full build volume is a solid rectangular block of bonded and cut paper.",
    "The block is parted off from the build platform using a thin wire or cutting tool.",
    "DECUBING: Using hand tools (chisels, screwdrivers, etc.), the waste cross-hatched material is broken away from around and inside the part. This is the most time-consuming step, taking several hours for complex parts.",
    "The final part is finished and painted as required.",
    "A lacquer coat is often applied to prevent moisture absorption (since paper absorbs water, leading to warping/swelling).",
    "Optional: sanding, priming, painting for improved appearance.",
]
for p in post_lom:
    story.append(bull(p))
story.append(sp(6))

story.append(sub_section("7.3  Advantages & Disadvantages of LOM"))
adv_lom = [
    "FAST: Only the boundary contour needs to be scanned by the laser (not the full volume interior). Speed is proportional to surface area, not volume. Much faster for large, bulky parts.",
    "LOW COST LASER: Uses a cheap CO₂ laser (only for cutting, not curing/sintering), so control is simpler and laser lifetime is longer.",
    "NO SPECIAL ENVIRONMENT: No need for controlled atmosphere, vacuum, or inert gas. Only proper exhaust ventilation for laser smoke.",
    "CHEAP MATERIAL: Paper is the cheapest AM material available.",
    "WOOD-LIKE PARTS: The bonded paper produces strong, wood-like parts with good compressive strength. Excellent as patterns for sand casting and investment casting.",
    "LARGE BUILD VOLUME: LOM machines (e.g., LOM 2030H) can build very large parts.",
    "CONCEPT BASIS for Laminated Tooling and other sheet-based manufacturing variants.",
]
dis_lom = [
    "FIXED LAYER THICKNESS: Layer thickness = paper sheet thickness; cannot be varied easily.",
    "DECUBING IS VERY SLOW: The grid cutting takes far more laser time than cutting the object outline, and manual waste removal is very time consuming.",
    "HORIZONTAL SURFACES PROBLEM: Internal horizontal surfaces that need to be decubed can be extremely difficult to reach and remove.",
    "FIRE HAZARD: CO₂ laser cutting of paper produces smoke and the risk of fire. Requires fire suppression measures.",
    "MOISTURE SENSITIVITY: Paper absorbs moisture, causing dimensional instability unless lacquered.",
    "ANISOTROPIC PROPERTIES: Weak inter-laminar bond strength in the Z-direction (perpendicular to layers).",
    "POOR COMMERCIALISATION: Cubic Technologies had poor marketing; LOM technology is now almost obsolete.",
]
story.append(info_box("✅  Advantages of LOM", adv_lom, bg=LIGHT_GREEN, title_color=GREEN))
story.append(sp(4))
story.append(info_box("❌  Disadvantages of LOM", dis_lom, bg=LIGHT_ORANGE, title_color=ORANGE))
story.append(sp(5))

story.append(sub_section("7.4  LOM Example Problem – Decubing vs. Cutting Time Ratio"))
story.append(body(
    "Find the ratio of time required to scan the decubing (grid) lines to the outer periphery "
    "of a slice where the outer boundary is A = 8a and the inner object is D = 4a "
    "(a grid of 10×2a cells surrounds the part):"))
story.append(sp(3))
story.append(formula("Given: A = 8a (outer stock side),  D = 4a (object side)"))
story.append(formula("Grid lines time: t_g ∝ 2 × (4A + 10 × 2a)  =  2 × (32a + 20a)  =  104a"))
story.append(formula("Contour time:   t_c ∝ 4D  =  4 × 4a  =  16a"))
story.append(formula("Ratio: t_g / t_c  =  104a / 16a  ≈  6.5"))
story.append(body(
    "This means the laser spends about <b>6.5 times longer</b> cutting the waste grid "
    "than cutting the actual object outline – confirming that grid cutting is the dominant "
    "time consumer in LOM."))
story.append(sp(8))
story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
#  8. KIRA PLT
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("8.  Kira's Paper Lamination Technology (PLT / SAHP)"))
story.append(sp(4))

story.append(body(
    "PLT was developed by <b>Kira Corporation (Japan)</b>. It uses the same Bond-then-Form "
    "approach as LOM but replaces the CO₂ laser with a <b>mechanical knife/blade cutter</b> "
    "and uses a <b>hot press (flat plate)</b> instead of a hot roller for bonding. "
    "It was formerly known as <b>Selective Adhesive and Hot Press (SAHP)</b>. "
    "The machine is marketed as the <b>Kira Katana</b>."))
story.append(sp(5))

story.append(sub_section("8.1  Key Differences from LOM"))
diff_kira = [
    ["Cutting", "CO₂ Laser", "Mechanical Knife (Plotter-type cutter)"],
    ["Bonding Tool", "Hot Roller (cylindrical)", "Hot Plate (flat press) – more uniform pressure, no layer slippage"],
    ["Binding Agent", "Heat-activated adhesive on paper", "Toner (resin powder, like a laser printer) printed on paper; melted by hot press"],
    ["Build Size", "Larger (LOM 2030: 800×500 mm)", "Smaller but more accurate"],
    ["Fire Risk", "Yes (laser + paper)", "No (knife cutting is safe)"],
    ["Rollers", "Two rollers in Cubic LOM", "One roller in PLT"],
]
story.append(two_col_table(
    ["Aspect", "LOM (Cubic Technologies)", "PLT (Kira)"],
    diff_kira,
    col_w=[4*cm, 7*cm, 6.5*cm]
))
story.append(sp(6))

story.append(sub_section("8.2  PLT Build Process (Step by Step)"))
plt_steps = [
    "A pre-printed sheet of paper (with toner/resin printed where bonding is required) is fed from the paper roll and aligned over the previous layer on the build table.",
    "A HOT PRESS (heated flat plate) presses down at high pressure over the full sheet area. The temperature melts the toner, which bonds the new paper sheet firmly to the previous one. The flat press also eliminates air bubbles and keeps layers flat.",
    "The computer measures the actual height of the new bonded layer and adjusts the slicing data accordingly to maintain accuracy.",
    "A mechanical KNIFE (cutter plotter) then moves in X-Y to cut the layer outline of the part and any parting lines around the waste area.",
    "These steps repeat for every layer until the full part is built.",
    "Post-processing: Decubing (same as LOM – manual removal of waste material).",
]
for i, s in enumerate(plt_steps):
    story.append(bull(f"Step {i+1}: {s}"))
story.append(sp(5))

story.append(sub_section("8.3  Advantages & Disadvantages"))
adv_plt = [
    "Flat hot plate provides more uniform bonding pressure than a roller – no risk of layer slippage during bonding.",
    "Mechanical knife cutting produces a clean, smooth cut edge without burning – better surface quality than laser.",
    "NO fire hazard – no laser is used.",
    "NOT hazardous – no toxic fumes from laser cutting.",
    "High lamination pressure makes parts approximately 25% harder than equivalent wood – strong enough for sand casting patterns.",
    "Suitable for office environments (unlike LOM).",
    "All other advantages of LOM also apply (cheap material, fast for large parts, etc.).",
]
dis_plt = [
    "Same fundamental limitations as LOM: fixed layer thickness, slow decubing, horizontal surface problems.",
    "Knife must be maintained and replaced regularly.",
    "Slower cutting than CO₂ laser for complex contours.",
]
story.append(info_box("✅  Advantages of PLT", adv_plt, bg=LIGHT_GREEN, title_color=GREEN))
story.append(sp(4))
story.append(info_box("❌  Disadvantages of PLT", dis_plt, bg=LIGHT_ORANGE, title_color=ORANGE))
story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  9. PSL
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("9.  Plastic Sheet Lamination (PSL) – Solidimension"))
story.append(sp(4))

story.append(body(
    "PSL was developed by <b>Solidimension Ltd.</b>  It uses thin sheets of "
    "<b>thermoplastic (PVC) film</b> as the build material instead of paper. "
    "A key innovation is the use of a <b>selective release agent (anti-glue / masking agent)</b> "
    "to define support vs. part regions – enabling a much easier support removal method called "
    "<b>'Peel-Away'</b>."))
story.append(sp(5))

story.append(sub_section("9.1  Key Features"))
story.append(two_col_table(
    ["Feature", "PSL Details"],
    [
        ["Material", "Transparent thermoplastic (PVC / engineered plastic film)"],
        ["Approach", "Bond-then-Form"],
        ["Cutting Method", "Mechanical Knife (Cut Knife + Trim Knife in the same head)"],
        ["Bonding Agent", "Adhesive (applied selectively in part regions only)"],
        ["Release Agent", "Anti-glue / masking agent applied in support regions to prevent bonding"],
        ["Joining Region", "SELECTIVE – only the part cross-section area is bonded; supports are not bonded"],
        ["Support Removal", "Peel-Away – support simply peels off because it was never permanently bonded"],
        ["Machine", "Solidimension machine (uses LDview software by 3D Systems)"],
    ],
    col_w=[4.5*cm, 13*cm]
))
story.append(sp(6))

story.append(sub_section("9.2  PSL Build Process"))
psl_steps = [
    ("Masking", "The XY plotter head (Anti-Glue Pen) deposits the anti-glue (release agent) onto the sheet in the regions that will become supports. This prevents adhesive bonding in those areas."),
    ("Application of Glue", "Adhesive is applied to the part cross-section regions of the sheet (areas that should permanently bond)."),
    ("Ironing", "The Ironing Unit (heated plate) presses the sheet down onto the previous layer. The heat activates the adhesive in the part region, bonding it permanently. In the masked (anti-glue) regions, no bonding occurs."),
    ("Cutting", "The Cut Knife traces and cuts the outer boundary of the current layer profile."),
    ("Trimming", "The Trim Knife makes additional cuts to define waste separation lines."),
    ("Repeat", "These steps repeat for every layer. Support material stacks up but remains unglued."),
    ("Peel-Away", "After the full build, the unglued support material is simply peeled away cleanly – no tools, no damage, very fast compared to LOM decubing."),
]
for title, desc in psl_steps:
    story.append(bull(f"<b>{title}:</b> {desc}"))
story.append(sp(5))

story.append(sub_section("9.3  Advantages & Disadvantages"))
adv_psl = [
    "Selective bonding (anti-glue concept) makes support removal trivially easy (peel-away) – huge time saving vs. LOM decubing.",
    "Transparent material allows visual inspection of internal features.",
    "No fire hazard, no toxic fumes.",
    "Smooth surface finish from the flat thermoplastic sheets.",
    "Suitable for office environment.",
]
dis_psl = [
    "Material limited to thermoplastics (PVC type) – less variety than paper-based LOM.",
    "Anti-glue application adds complexity to the process.",
    "Build size is smaller than LOM.",
    "Thermoplastic material has limited temperature resistance.",
]
story.append(info_box("✅  Advantages of PSL", adv_psl, bg=LIGHT_GREEN, title_color=GREEN))
story.append(sp(4))
story.append(info_box("❌  Disadvantages of PSL", dis_psl, bg=LIGHT_ORANGE, title_color=ORANGE))
story.append(sp(8))
story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
#  10. CAM-LEM
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("10.  CAM-LEM – Computer-Aided Manufacturing of Laminated Engineering Materials"))
story.append(sp(4))

story.append(body(
    "CAM-LEM was developed at <b>Case Western Reserve University, USA</b>. "
    "Unlike LOM and PLT, CAM-LEM uses the <b>Form-then-Bond</b> approach. "
    "It is designed to process a wide variety of engineering materials including "
    "<b>ceramics and metals</b>, which cannot be processed by paper-based LOM."))
story.append(sp(5))

story.append(sub_section("10.1  Key Characteristics"))
story.append(two_col_table(
    ["Parameter", "CAM-LEM Details"],
    [
        ["Full Name", "Computer-Aided Manufacturing of Laminated Engineering Materials"],
        ["Approach", "Form-then-Bond (cut first, then stack and bond)"],
        ["Materials", "Ceramics (Al₂O₃, SiC, etc.), Metals, up to 5 different materials in one build"],
        ["Cutting Method", "CO₂ Laser (cuts individual sheets before bonding)"],
        ["Bonding Method", "Sintering (for ceramics/metals) via Hot Isostatic Pressing (HIP)"],
        ["Joining Region", "Entire sheet (full bonding)"],
        ["Build Process", "Solid CAD model → Contour representation → Laser slice cutting → Stacking → Lamination (HIP) → Binder removal + sintering → Finished component"],
    ],
    col_w=[4.5*cm, 13*cm]
))
story.append(sp(6))

story.append(sub_section("10.2  CAM-LEM Process Steps"))
camlem_steps = [
    ("Solid CAD Model", "3D CAD model is created and imported."),
    ("Contour Representation", "The model is represented as 2D contours for each layer."),
    ("Slice Cutting", "A CO₂ laser cuts each ceramic/metal sheet to the exact shape of that layer's cross-section. All layers are cut independently BEFORE any bonding occurs."),
    ("Stacking", "The individually cut layer pieces are stacked in the correct order on top of each other by a robotic assembly system."),
    ("Lamination (HIP)", "The stacked assembly is placed in a Hot Isostatic Press (HIP). Simultaneous high temperature and high pressure from all directions bonds the layers together while also performing pre-sintering. HIP ensures uniform, void-free bonding."),
    ("Binder Removal & Sintering", "For ceramic tapes, a binder (polymer) is present. It is burned out in a furnace (de-binding step), followed by high-temperature sintering to achieve full density and final mechanical properties."),
    ("Finished Component", "The final ceramic/metal laminated component is ready."),
]
for title, desc in camlem_steps:
    story.append(bull(f"<b>{title}:</b> {desc}"))
story.append(sp(5))

story.append(sub_section("10.3  Advantages & Disadvantages"))
adv_camlem = [
    "Can process ceramics and metals – materials not feasible with paper-based LOM.",
    "Up to 5 different materials can be used in a single part (functionally graded materials).",
    "Internal channels and complex internal features are possible because layers are cut individually first.",
    "No precise depth-of-cut required (cuts all the way through each sheet independently).",
    "No unwanted adhesive or glue material – sintering provides a clean, strong bond.",
    "Variable layer thickness possible (different sheet thicknesses for different regions).",
]
dis_camlem = [
    "SHRINKAGE: Ceramic/metal sintering involves significant volume shrinkage (~15-20%); must be compensated in the CAD model.",
    "PRECISE ALIGNMENT: Stacking individual cut pieces requires very accurate robotic alignment to avoid layer misregistration.",
    "LACK OF SUPPORT: Form-then-Bond approach has no inherent support material; overhanging features are challenging.",
    "High equipment cost (HIP + sintering furnace).",
    "Long process time (cutting + stacking + sintering each take significant time).",
]
story.append(info_box("✅  Advantages of CAM-LEM", adv_camlem, bg=LIGHT_GREEN, title_color=GREEN))
story.append(sp(4))
story.append(info_box("❌  Disadvantages of CAM-LEM", dis_camlem, bg=LIGHT_ORANGE, title_color=ORANGE))
story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  11. ENNEX OFFSET FABBERS
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("11.  Ennex Corporation's Offset Fabbers"))
story.append(sp(4))

story.append(body(
    "Offset Fabbing™ was developed by <b>Ennex Corporation (USA)</b>. It is similar in concept "
    "to Kira's PLT but uses the <b>Form-then-Bond</b> approach (like CAM-LEM) rather than "
    "Bond-then-Form. It uses a mechanical knife and can process a wide variety of thin film materials."))
story.append(sp(5))

story.append(sub_section("11.1  Process Steps"))
ennex_steps = [
    "A thin fabrication material (any flexible film – paper, plastic, metal foil, etc.) is laid flat on a carrier sheet.",
    "A 2D plotting knife cuts the outline (contour) of the current layer cross-section into the fabrication material WITHOUT cutting through the carrier sheet below. The knife also cuts parting lines and support outlines.",
    "The cut film is 'weeded' – the unwanted negative/waste areas of the cut pattern are peeled off and removed from the carrier. Only the shaped layer piece remains on the carrier.",
    "The carrier is inverted so that the cut layer piece faces downward (toward the growing object).",
    "The layer piece is brought into contact with the top of the growing object and bonded to it using adhesive.",
    "The carrier sheet is then peeled away upward, revealing the newly added layer and a fresh surface ready for the next layer.",
    "Repeat from step 1 for the next layer.",
]
for i, s in enumerate(ennex_steps):
    story.append(bull(f"Step {i+1}: {s}"))
story.append(sp(5))

story.append(sub_section("11.2  Advantages & Disadvantages"))
adv_ennex = [
    "Form-then-Bond approach: NO decubing needed (waste is weeded off before bonding).",
    "Wide variety of materials can be processed (paper, plastic, metal foil, composites).",
    "Minimal shrinkage (no high-temperature sintering involved for most materials).",
    "Safe: mechanical knife, no laser fumes or fire risk.",
]
dis_ennex = [
    "Precise cutting force control needed: too much force cuts through the carrier; too little doesn't cut the film cleanly.",
    "Precise layer-by-layer alignment (registration) required for accuracy.",
    "Material wastage: the weeded portions are discarded.",
    "Handling individual layer pieces (especially small/complex pieces) can be tricky.",
]
story.append(info_box("✅  Advantages", adv_ennex, bg=LIGHT_GREEN, title_color=GREEN))
story.append(sp(4))
story.append(info_box("❌  Disadvantages", dis_ennex, bg=LIGHT_ORANGE, title_color=ORANGE))
story.append(sp(8))
story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
#  12. ULTRASONIC CONSOLIDATION
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("12.  Ultrasonic Consolidation (UC) / Ultrasonic Additive Manufacturing (UAM)"))
story.append(sp(4))

story.append(body(
    "Ultrasonic Consolidation was invented and patented by <b>Dawn White</b> and commercialised "
    "by <b>Solidica Inc. in 1999 (USA)</b>. In 2011, Solidica partnered with the Edison Welding "
    "Institute (EWI) to form <b>Fabrisonic LLC</b>, which continues to develop the technology "
    "as Ultrasonic Additive Manufacturing (UAM)."))
story.append(sp(4))
story.append(body(
    "UC is a <b>hybrid additive/subtractive</b> process combining <b>ultrasonic metal welding</b> "
    "of metal foils (additive) with <b>CNC milling</b> (subtractive) to achieve the final "
    "geometry and surface finish. Since the bonding occurs at relatively low temperatures "
    "(well below the melting point), it is classified as a <b>solid-state process</b>."))
story.append(sp(5))

story.append(sub_section("12.1  Key Characteristics"))
story.append(two_col_table(
    ["Parameter", "UC Details"],
    [
        ["Also Called", "Ultrasonic Additive Manufacturing (UAM)"],
        ["Process Type", "Hybrid: Additive (ultrasonic welding of foils) + Subtractive (CNC milling)"],
        ["Approach", "Bond-then-Form"],
        ["Materials", "Aluminium alloys (most common), copper, titanium, nickel, stainless steel, metal matrix composites"],
        ["Bonding Method", "Ultrasonic diffusion bonding (solid-state welding)"],
        ["Joining Region", "Selective (foil by foil, track by track)"],
        ["Cutting Method", "CNC 3-axis contour milling (integrated into same machine)"],
        ["Build Direction", "+Z Direction"],
        ["Operating Temperature", "Typically ~200°C (heated base plate); interface temperature 30–50% of melt temp"],
        ["Ultrasonic Frequency", "20 kHz (standard industrial ultrasonic frequency)"],
        ["Sonotrode Amplitude", "5–40 μm peak-to-peak in the transverse direction"],
        ["Foil Thickness", "Typically 100–150 μm"],
        ["Foil Width", "~25 mm"],
    ],
    col_w=[5*cm, 12.5*cm]
))
story.append(sp(6))

story.append(sub_section("12.2  UC Working Principle – Detailed"))
story.append(body(
    "The key to UC is <b>ultrasonic metal welding</b>. Here is how it works:"))
story.append(sp(3))

uc_principle = [
    ("<b>Electrical Energy Conversion:</b>",
     "A power supply converts mains AC electricity (50 Hz) to a high-frequency ultrasonic signal (typically 20,000 Hz = 20 kHz). This is the standard frequency used in industrial ultrasonic welding."),
    ("<b>Electromechanical Transduction:</b>",
     "The 20 kHz electrical signal is fed into a piezoelectric TRANSDUCER which converts electrical energy into mechanical vibration energy at the same frequency (20 kHz)."),
    ("<b>Amplitude Amplification:</b>",
     "The vibration passes through a BOOSTER, which mechanically amplifies the vibration amplitude to the required level (5–40 μm)."),
    ("<b>Application by Sonotrode:</b>",
     "The amplified vibration is delivered to the SONOTRODE – a rotating cylindrical tool with a roughened (knurled) surface. The sonotrode: (a) Grips the top surface of the metal foil without slipping (due to roughened surface), (b) Vibrates the foil in the transverse (horizontal) direction at 20 kHz while (c) Simultaneously applying a compressive NORMAL FORCE pressing the foil against the previously bonded layers (on the BASE PLATE / ANVIL)."),
    ("<b>Friction → Heat → Solid-State Bonding:</b>",
     "The ultrasonic vibration causes rapid scrubbing/friction between the bottom face of the new foil and the top face of the previously bonded foils. This friction generates localised heat at the interface, raising the temperature to 30–50% of the metal's melting point. At this temperature, the metal is NOT melted but becomes plastically deformable; the oxide layers on the metal surfaces are broken up and dispersed, and atomic diffusion across the clean metal-metal interface creates a strong metallurgical bond (solid-state welding)."),
    ("<b>Layer-by-Layer Build-up:</b>",
     "The sonotrode traverses in the Y direction while the workpiece moves in X, building up one track of foil at a time. Multiple tracks side-by-side cover the full layer area. After each complete layer is built, a CNC milling tool removes excess material and machines the layer to precise contour dimensions."),
    ("<b>CNC Milling Integration:</b>",
     "The same machine frame houses a 3-axis CNC milling spindle. After each few layers of ultrasonic deposition, the milling tool removes excess foil width and machines complex internal features (channels, undercuts) that could never be reached after more layers are deposited on top. This is the key advantage of the hybrid approach."),
]

for title, desc in uc_principle:
    data = [[Paragraph(title, make_style('UCH','Normal',
        fontSize=10, textColor=DARK_BLUE, fontName='Helvetica-Bold', leading=13)),
             Paragraph(desc, TABLE_C)]]
    t = Table(data, colWidths=[5*cm, 12.5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), LIGHT_BLUE),
        ('BACKGROUND', (1,0), (1,0), GREY_BG),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#cccccc")),
    ]))
    story.append(t)
    story.append(sp(3))

story.append(sp(5))
story.append(sub_section("12.3  Advantages & Disadvantages of UC"))
adv_uc = [
    "Can process METALS (aluminium, copper, titanium, etc.) as a sheet lamination process – unique capability.",
    "SOLID-STATE process: no melting means no heat-affected zone, no residual stress from solidification, no distortion, no change in grain structure.",
    "Can embed sensors, fibres, electronics, or dissimilar materials between layers DURING the build – impossible with most other AM processes.",
    "Hybrid process: CNC milling provides excellent dimensional accuracy and surface finish.",
    "Complex internal channels, lattice structures, and undercuts are achievable.",
    "Good bonding strength (metallurgical diffusion bond).",
    "Lower energy input than laser or electron beam metal AM processes.",
]
dis_uc = [
    "Limited to ductile metal foils; cannot process brittle ceramics or polymers.",
    "Bond quality highly dependent on sonotrode pressure, amplitude, speed, and temperature – process parameter control is critical.",
    "Foil width limitation (~25 mm): requires multiple passes per layer; susceptible to bond line defects at foil edges.",
    "Subtractive CNC step removes material – slight material waste.",
    "Machine cost is high.",
    "Surface roughness of sonotrode leaves marks on top surface if not milled.",
]
story.append(info_box("✅  Advantages of UC", adv_uc, bg=LIGHT_GREEN, title_color=GREEN))
story.append(sp(4))
story.append(info_box("❌  Disadvantages of UC", dis_uc, bg=LIGHT_ORANGE, title_color=ORANGE))
story.append(sp(8))
story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
#  13. FDM
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("13.  Fused Deposition Modeling (FDM) – Complete Detailed Notes"))
story.append(sp(4))

story.append(body(
    "FDM is currently the <b>most widely used, most affordable, and most popular AM process</b> "
    "in the world. It was invented by <b>Scott Crump</b> (co-founder of Stratasys Inc.) in 1989. "
    "Stratasys commercialised FDM and holds key patents. The open-source version (RepRap movement, "
    "2008) popularised the technology as desktop 3D printing. The generic non-trademarked name is "
    "<b>Fused Filament Fabrication (FFF)</b>."))
story.append(sp(5))

story.append(sub_section("13.1  Classification in Wire-Based AM"))
story.append(two_col_table(
    ["Parameter", "FDM Choice"],
    [
        ["Materials", "Polymer/Composite (primary) – ABS, PLA, PETG, PC, Nylon, TPU, Wax (for investment casting patterns), fibre-reinforced composites"],
        ["Material Form", "Wire/Filament (spool form)"],
        ["Material Flow", "Continuous (uninterrupted flow during each scan path)"],
        ["Machine Kinematics", "Serial (Cartesian gantry system – most common) or Delta or CoreXY"],
        ["Energy Source", "Resistance heating (electrical resistive heater in the hot end/liquefier)"],
        ["Support Mechanism", "Water-dissolvable support (SR-30 or similar material in dual-extrusion machines) or Acid-bath dissolvable supports, or Breakaway supports"],
    ],
    col_w=[5*cm, 12.5*cm]
))
story.append(sp(6))

story.append(sub_section("13.2  Fundamental Principle of FDM"))
story.append(body(
    "FDM is based on three scientific principles working together:"))
story.append(bull("<b>Surface Chemistry:</b> The molten thermoplastic filament bonds to the previously deposited layer through molecular diffusion across the hot interface. The bond strength depends on the temperature and dwell time at the interface."))
story.append(bull("<b>Thermal Energy:</b> Controlled resistive heating melts the filament in the liquefier, and controlled cooling (either by ambient temperature or by fans) solidifies each deposited bead rapidly."))
story.append(bull("<b>Layer Manufacturing Technology:</b> The 3D object is built up one horizontal layer at a time, with each layer fusing to the previous one."))
story.append(sp(5))

story.append(sub_section("13.3  Main Components of an FDM Machine"))
fdm_comps = [
    ["Filament Spool (Supply)", "The raw material – thermoplastic filament wound on a spool. Standard diameters: 1.75 mm or 2.85 mm. Two spools for dual-extrusion machines (one for build material, one for support material)."],
    ["Feed Pinch Rollers", "Two rollers (one or both grooved/toothed) that grip the filament and push/pull it into the liquefier. Control the filament feed rate. Precise roller speed determines the extrusion flow rate."],
    ["Liquefier (Hot End)", "A heated metal tube (usually aluminium or stainless steel) with an electrical resistance heater and a thermistor/thermocouple. Melts the solid filament as it passes through. Temperature typically 180°C–280°C depending on material."],
    ["Print Nozzle (FDM Tip)", "A precision-machined nozzle at the bottom of the liquefier with a small circular orifice. Standard nozzle diameter: 0.4 mm (range: 0.1–1.0 mm). Nozzle diameter determines minimum feature size and layer width."],
    ["Extrusion Head (Mounted FDM Head)", "The complete assembly of rollers + liquefier + nozzle, mounted on the X-Y gantry. Moves in the X-Y plane to deposit each layer track."],
    ["Build Platform (Build Stage)", "The flat surface on which the object is built. Moves in the Z direction (down after each layer for bottom-up printing). Often heated (50°C–110°C) to improve first-layer adhesion and reduce warping."],
    ["Foam Base / Build Sheet", "A removable substrate (foam, PEI sheet, glass, or blue tape) on the build platform that helps the first layer adhere and allows easy part removal."],
    ["Heated Chamber (optional)", "High-end FDM machines enclose the build volume in a heated chamber (~70–90°C) held just below the material's glass transition temperature. This improves layer bonding, reduces warping, and enables processing of high-temperature materials (PC, PEEK, Ultem)."],
],
for row in fdm_comps:
    story.append(bull(f"<b>{row[0]}:</b> {row[1]}"))
story.append(sp(6))

story.append(sub_section("13.4  Step-by-Step FDM Process Chain"))

fdm_process = [
    ("Step 1 – CAD Model Creation",
     "Create a 3D solid model of the desired object in any CAD software (SolidWorks, CATIA, Fusion 360, etc.)."),
    ("Step 2 – STL File Conversion",
     "Export the CAD model as an STL file. The curved surfaces are tessellated into triangular facets. A finer tessellation gives better accuracy."),
    ("Step 3 – Orientation of STL",
     "Import the STL file into slicing software (Cura, Simplify3D, PrusaSlicer, Stratasys Insight, etc.). Orient the part optimally: minimize supports, maximize surface quality on visible faces, consider anisotropy (FDM is stronger in X-Y than Z)."),
    ("Step 4 – Support Generation",
     "The slicer automatically identifies overhanging features (angle > 45°–60° typically) and generates support structures. Options: lattice supports, tree supports, or custom. Choice of breakaway or dissolvable support material."),
    ("Step 5 – Area Filling (Infill) Strategy",
     "Define infill pattern (grid, honeycomb, gyroid, triangles, etc.) and infill density (0%=hollow to 100%=solid). Higher infill = stronger part but more material and time. Shell/perimeter count also set here."),
    ("Step 6 – Slicing",
     "The slicer divides the 3D model into horizontal layers of defined thickness (e.g., 0.1 mm, 0.2 mm, 0.3 mm). Each slice produces a set of 2D toolpaths (contours + infill + support paths)."),
    ("Step 7 – G-code Generation",
     "The slicer converts the toolpaths into G-code: machine instructions specifying nozzle X, Y, Z positions, extrusion amount (E-axis), feed rates, temperature, fan speed, etc."),
    ("Step 8 – Machine Setup & Deposition of Buffer Layers",
     "Load filament into the machine. Level the build platform (bed levelling/tramming is critical for first-layer adhesion). Set temperatures (nozzle + bed). The machine may deposit a few dummy/buffer layers (purge lines or brim) before starting the actual part."),
    ("Step 9 – Layer-by-Layer Deposition",
     "The machine executes the G-code: (a) Nozzle heats to set temperature, melting filament in liquefier. (b) Pinch rollers feed filament at controlled rate. (c) Nozzle traces perimeters, then fills interior with infill pattern. (d) Support material nozzle (if dual extrusion) deposits support structures simultaneously. (e) After each layer, platform moves down by one layer thickness. (f) New layer is deposited and fuses with the previous one. Repeat until done."),
    ("Step 10 – Support Removal",
     "If breakaway supports: manually break off using pliers/cutters. If dissolvable supports (e.g., SR-30): submerge part in warm water or solvent bath; supports dissolve leaving clean part geometry. Water-works system (Stratasys) automates this dissolution."),
    ("Step 11 – Surface Finishing",
     "Optional post-processing: sanding, painting, priming, acetone vapour smoothing (for ABS), annealing (for PLA/PETg for stress relief), electroplating (for conductive applications), UV coating, etc."),
]

for title, desc in fdm_process:
    data = [[Paragraph(f"<b>{title}</b>", make_style('FDH','Normal',
        fontSize=10, textColor=DARK_BLUE, fontName='Helvetica-Bold', leading=13)),
             Paragraph(desc, TABLE_C)]]
    t = Table(data, colWidths=[5*cm, 12.5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), LIGHT_BLUE),
        ('BACKGROUND', (1,0), (1,0), GREY_BG),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#cccccc")),
    ]))
    story.append(t)
    story.append(sp(3))

story.append(sp(6))
story.append(sub_section("13.5  FDM Feeding Mechanism – Mathematical Analysis"))
story.append(body(
    "The pinch roller mechanism is the heart of FDM material control. "
    "Understanding the mathematics helps in selecting proper machine parameters."))
story.append(sp(4))

story.append(Paragraph("<b>Key Variables:</b>", SSH))
vars_table = [
    ["t", "Layer thickness (mm)"],
    ["w", "Bead width (mm) – width of the deposited filament track"],
    ["v_t", "Nozzle traverse speed (mm/s) – how fast the nozzle moves"],
    ["Q", "Volumetric flow rate of melt through nozzle (mm³/s)"],
    ["d_f", "Filament diameter (mm) – typically 1.75 mm or 2.85 mm"],
    ["v_f", "Filament feed speed (mm/s) – speed at which filament enters liquefier"],
    ["d_r", "Roller diameter (mm)"],
    ["ω_r", "Angular velocity of pinch rollers (rad/s)"],
    ["K_f", "Friction factor between roller and filament (ideal = 1.0)"],
]
story.append(two_col_table(["Variable", "Meaning"], vars_table, col_w=[2.5*cm, 15*cm]))
story.append(sp(5))

story.append(Paragraph("<b>Equation 1 – Required Volumetric Flow Rate:</b>", SSH))
story.append(body(
    "For the nozzle to deposit a bead of width w and thickness t while moving at speed v_t "
    "with no gaps or overlaps, the required volumetric flow rate is:"))
story.append(formula("Q  =  v_t × w × t        ... (1)"))
story.append(body("This is a simple mass conservation equation: volume deposited per second = nozzle speed × cross-section area of bead."))
story.append(sp(4))

story.append(Paragraph("<b>Equation 2 – Required Filament Feed Rate:</b>", SSH))
story.append(body(
    "The filament (circular cross-section, diameter d_f) must be fed fast enough to supply "
    "the required flow rate Q:"))
story.append(formula("v_f  =  K_f × (4Q) / (π × d_f²)        ... (2)"))
story.append(body(
    "Here K_f is the friction factor: "
    "K_f = 1.0 → ideal (no slip, no crush). "
    "K_f > 1.0 → filament is being crushed/over-compressed. "
    "K_f < 1.0 → filament is slipping (under-extrusion)."))
story.append(sp(4))

story.append(Paragraph("<b>Equation 3 – Roller Angular Velocity to Achieve Feed Rate:</b>", SSH))
story.append(body(
    "If the rollers rotate at angular velocity ω_r (rad/s) with diameter d_r:"))
story.append(formula("v_f  =  (ω_r × d_r) / 2        ... (3)"))
story.append(sp(4))

story.append(Paragraph("<b>Combined Formula – Roller Speed from Build Parameters:</b>", SSH))
story.append(body("Substituting equations 1, 2, and 3 together:"))
story.append(formula("ω_r  =  (8 × K_f) / π  ×  (v_t × w × t) / (d_r × d_f²)"))
story.append(body(
    "This master formula links the roller angular speed (what the motor controls) "
    "directly to the build parameters (nozzle speed, bead width, layer thickness) "
    "and the filament/roller geometry."))
story.append(sp(5))

story.append(Paragraph("<b>Power and Force Analysis:</b>", SSH))
story.append(body("The force required to push melt through the liquefier nozzle:"))
story.append(formula("F₂  =  ΔP × (π × d_f²) / 4"))
story.append(body("where ΔP is the pressure drop across the liquefier (depends on melt viscosity, nozzle length, and flow rate)."))
story.append(sp(3))
story.append(body("Required motor torque (if only one roller is motor-driven):"))
story.append(formula("T₂  =  F₂ × (d_r / 2)  =  (π/8) × ΔP × d_r × d_f²"))
story.append(sp(3))
story.append(body("Motor power required:"))
story.append(formula("P  =  T₂ × ω_r  =  K_f × ΔP × v_t × w × t"))
story.append(body(
    "Notice: power = K_f × ΔP × Q. It equals the pressure drop times the volumetric flow rate "
    "times the friction factor. This makes intuitive sense – pushing more material faster through "
    "a smaller nozzle requires more power."))
story.append(sp(3))
story.append(caution("The motor torque required to unwind the filament from the spool (force F₁ in tension) has NOT been included in the above power calculation."))
story.append(sp(6))

story.append(sub_section("13.6  FDM Example Problem (from notes)"))
story.append(body(
    "In an FDM process, a wire of diameter d_f = 1.5 mm is used. "
    "The wire feed speed v_f = 0.86 mm/s and the cross-sectional area of the bead deposited = 0.088 mm²."))
story.append(sp(3))
story.append(Paragraph("<b>Part (a): Find nozzle traverse speed v_t (assuming no slip, K_f = 1):</b>", SSH))
story.append(body("From Equation 2 (with K_f = 1):"))
story.append(formula("v_f  =  4Q / (π × d_f²)"))
story.append(formula("Q  =  v_f × π × d_f² / 4  =  0.86 × π × (1.5)² / 4  =  0.86 × 1.767  =  1.52 mm³/s"))
story.append(body("From Equation 1: Q = v_t × (bead area)"))
story.append(formula("v_t  =  Q / (bead area)  =  1.52 / 0.088  ≈  17.27 mm/s"))
story.append(sp(4))

story.append(Paragraph("<b>Part (b): Roller angular speed with d_r = 16 mm:</b>", SSH))
story.append(body("From Equation 3:"))
story.append(formula("ω_r  =  2 × v_f / d_r  =  2 × 0.86 / 16  =  0.1075 rad/s"))
story.append(body("Converting to RPM: N = ω_r × 60/(2π) = 0.1075 × 60/6.283 ≈ 1.03 RPM"))
story.append(sp(6))

story.append(sub_section("13.7  Materials Used in FDM"))
fdm_materials = [
    ["ABS (Acrylonitrile Butadiene Styrene)", "190–240°C", "Most common engineering plastic. Good strength, impact resistance. Slight warping; needs heated bed + enclosure. Acetone smoothing possible."],
    ["PLA (Polylactic Acid)", "180–220°C", "Most popular desktop material. Easy to print. Good detail. Biodegradable. Brittle; low heat resistance (~60°C)."],
    ["PETG (Polyethylene Terephthalate Glycol)", "220–250°C", "Good balance of strength + flexibility + moisture resistance. Low warping. Good for functional parts."],
    ["PC (Polycarbonate)", "260–300°C", "High strength, high heat resistance. Requires enclosure. Used in aerospace, automotive."],
    ["Nylon (PA)", "240–270°C", "Tough, flexible, good fatigue resistance. Absorbs moisture; needs dry storage."],
    ["TPU (Flexible)", "220–240°C", "Rubber-like, flexible, impact-resistant. Used for gaskets, phone cases, shoe soles."],
    ["Wax", "~70–90°C", "Used for investment casting patterns. Melts away cleanly in the casting process."],
    ["Fibre-Reinforced (CF, GF, Kevlar)", "240–280°C", "Continuous or chopped fibre in nylon/PLA matrix. Very high strength-to-weight ratio. Used in aerospace, motorsport."],
]
story.append(two_col_table(
    ["Material", "Print Temp.", "Properties & Notes"],
    fdm_materials,
    col_w=[5*cm, 2.5*cm, 10*cm]
))
story.append(sp(6))

story.append(sub_section("13.8  Advantages & Disadvantages of FDM"))
adv_fdm = [
    "LOWEST COST: Most affordable AM process both in equipment and materials. Desktop printers available from under $200.",
    "WIDEST MATERIAL RANGE: More material choices than any other AM process (dozens of thermoplastics, composites, wax).",
    "SAFE & OFFICE-FRIENDLY: No toxic resins, no laser, no powder clouds.",
    "SIMPLE OPERATION: Relatively easy to set up and operate; extensive user community support.",
    "DUAL EXTRUSION: Can print soluble support material, enabling complex geometries with perfectly smooth internal channels.",
    "SCALABLE: From tiny desktop printers to industrial Stratasys Fortus machines with 900×600×900 mm build volume.",
    "MULTI-COLOUR: Multi-nozzle machines can print in multiple colours or materials in one build.",
    "FUNCTIONAL PARTS: ABS, PC, Nylon FDM parts are strong enough for functional testing, jigs, fixtures.",
    "AUTOMOTIVE EXAMPLE: Toyota's Avalon 2000 project saved $2 million+ in prototype tooling costs by replacing 35 prototype injection-mould parts with FDM-printed equivalents.",
]
dis_fdm = [
    "SURFACE FINISH: Stair-step effect visible on curved surfaces, especially on upper surfaces. Worse than SLA/SLS.",
    "ANISOTROPIC MECHANICAL PROPERTIES: Parts are significantly weaker in the Z-direction (between layers) than in X-Y (within layers). Bond between layers is the weakest point.",
    "LIMITED ACCURACY: Layer thickness typically 0.1–0.3 mm; less precise than SLA.",
    "SLOW FOR FINE FEATURES: Very detailed or thin features can be difficult or impossible to print.",
    "SUPPORT REMOVAL: Breakaway supports can leave marks; even soluble supports need soaking time.",
    "WARPING: ABS and other semi-crystalline polymers shrink on cooling causing layer delamination or part warping if conditions are not controlled.",
    "NOT SUITABLE FOR OPTICAL APPLICATIONS: Cannot produce transparent parts like SLA.",
]
story.append(info_box("✅  Advantages of FDM", adv_fdm, bg=LIGHT_GREEN, title_color=GREEN))
story.append(sp(4))
story.append(info_box("❌  Disadvantages of FDM", dis_fdm, bg=LIGHT_ORANGE, title_color=ORANGE))
story.append(sp(8))
story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
#  COMPREHENSIVE COMPARISON TABLE
# ─────────────────────────────────────────────────────────────────────────────
story.append(chapter_banner("COMPREHENSIVE COMPARISON OF ALL UNIT-3 AM PROCESSES", color=colors.HexColor("#37474f")))
story.append(sp(8))

comp_rows = [
    ["SLA", "Liquid Photopolymer", "UV Laser", "Excellent", "High", "Thermosetting plastics", "Prototyping, jewellery, dental, optical"],
    ["RFP", "Water (Ice)", "Freezing (−20°C)", "Moderate", "Very Low", "Water/ice only", "Casting patterns, education, eco-demo"],
    ["LOM (Cubic)", "Paper sheets", "CO₂ Laser", "Moderate", "Low", "Paper, plastic", "Sand casting patterns, concept models"],
    ["PLT (Kira)", "Paper sheets", "Mechanical Knife", "Good", "Low", "Paper", "Accurate paper models, sand casting"],
    ["PSL (Solidimension)", "Plastic (PVC) sheets", "Mechanical Knife", "Good", "Medium", "Thermoplastics", "Office prototyping, transparent parts"],
    ["CAM-LEM", "Ceramic/Metal sheets", "CO₂ Laser + HIP", "Very Good", "Very High", "Ceramics, metals", "Functional ceramic/metal parts"],
    ["Offset Fabbers (Ennex)", "Any thin film", "Mechanical Knife", "Good", "Medium", "Paper, plastic, foil", "Multi-material, variety of films"],
    ["UC (Fabrisonic)", "Metal foils (Al, Cu, Ti)", "Ultrasonic welding + CNC", "Very Good", "High", "Ductile metals", "Aerospace, electronics embedding, tooling"],
    ["FDM (Stratasys)", "Thermoplastic filament", "Resistance heating", "Moderate", "Low–High", "ABS, PLA, PC, Nylon, Wax, Composites", "Prototyping, functional parts, production"],
]

story.append(two_col_table(
    ["Process", "Material", "Energy/Cutting", "Accuracy", "Cost", "Materials", "Applications"],
    comp_rows,
    col_w=[2.8*cm, 3*cm, 3.5*cm, 2*cm, 2*cm, 3.2*cm, 3*cm]
))
story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  KEY FORMULAE SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("Key Formulae to Remember for Exams"))
story.append(sp(6))

formulae = [
    ("FDM – Volumetric Flow Rate",
     "Q = v_t × w × t",
     "Q = flow rate (mm³/s), v_t = traverse speed, w = bead width, t = layer thickness"),
    ("FDM – Filament Feed Rate",
     "v_f = K_f × 4Q / (π × d_f²)",
     "K_f = friction factor (ideal = 1), d_f = filament diameter"),
    ("FDM – Roller Angular Speed",
     "v_f = ω_r × d_r / 2",
     "ω_r = angular velocity of roller, d_r = roller diameter"),
    ("FDM – Combined Roller Formula",
     "ω_r = (8K_f / π) × (v_t × w × t) / (d_r × d_f²)",
     "Obtained by combining equations 1, 2, and 3"),
    ("FDM – Pushing Force",
     "F₂ = ΔP × π × d_f² / 4",
     "ΔP = pressure drop in liquefier"),
    ("FDM – Motor Torque",
     "T₂ = π/8 × ΔP × d_r × d_f²",
     "Torque for one-motor drive"),
    ("FDM – Motor Power",
     "P = T₂ × ω_r = K_f × ΔP × v_t × w × t",
     "Note: equals K_f × ΔP × Q"),
    ("LOM – Grid vs Contour Time Ratio",
     "t_g/t_c = [2 × (4A + n×a)] / (4D)",
     "A = stock side, D = object side, a = grid spacing, n = number of grid lines"),
]

for name, eq, explanation in formulae:
    data = [
        [Paragraph(f"<b>{name}</b>", make_style('FH','Normal',
            fontSize=10, textColor=WHITE, fontName='Helvetica-Bold', leading=13)),
         Paragraph(f"<b>{eq}</b>", FORMULA),
         Paragraph(explanation, TABLE_C)],
    ]
    t = Table(data, colWidths=[5*cm, 5*cm, 7.5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), DARK_BLUE),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#e8eaf6")),
        ('BACKGROUND', (2,0), (2,0), GREY_BG),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#aaaaaa")),
    ]))
    story.append(t)
    story.append(sp(3))

story.append(sp(8))

# ─────────────────────────────────────────────────────────────────────────────
#  QUICK REVISION TIPS
# ─────────────────────────────────────────────────────────────────────────────
story.append(section_box("Quick Revision Mnemonics & Tips"))
story.append(sp(6))

tips = [
    "SLA = Selectively Laser-cures All layers (liquid resin, galvanometer laser, +Z build, photopolymer only).",
    "LOM = Laminate and cOre out Material (bond paper then laser cut, decubing is the main drawback).",
    "PLT = Paper + knife + hot pLaTe (safer than LOM, 25% harder than wood, no fire risk).",
    "PSL = Peel-away Support Laminates (PVC plastic, anti-glue for easy support removal).",
    "CAM-LEM = Ceramics And Metals – Laminated Engineering Materials (form-then-bond, HIP sintering, 5 materials).",
    "UC = Ultrasonic Consolidation = SOLID-STATE metal welding (foils, sonotrode at 20 kHz, hybrid with CNC milling).",
    "FDM = Filament Deposition Melting (cheapest, most popular, weakest in Z-direction, Toyota saved $2M).",
    "RFP = Really Frozen Prototyping – water droplets at −20°C, sugar support dissolves at −4°C, eco-friendly.",
    "Bond-then-Form: BtF → Bonding first, then laser/knife. Support material = waste stock. Decubing needed.",
    "Form-then-Bond: FtB → Forming (cutting) first, then bonding. No decubing, but no built-in support.",
    "SLA photo-steps: Initiation → Propagation → Termination (same as free radical polymerization in chemistry).",
    "In FDM: K_f must = 1 for perfect feeding. K_f > 1 = crushed filament. K_f < 1 = slipping filament.",
]
for i, tip in enumerate(tips):
    story.append(bull(f"<b>Tip {i+1}:</b> {tip}"))

story.append(sp(8))
story.append(hr(color=DARK_BLUE, thickness=1.5))
story.append(sp(4))
story.append(Paragraph(
    "<b>End of Unit 3 – Detailed Notes</b>  |  "
    "Liquid-Based & Solid-Based Additive Manufacturing Technologies",
    make_style('END','Normal', fontSize=11, textColor=DARK_BLUE,
               fontName='Helvetica-Bold', alignment=TA_CENTER, leading=14)))
story.append(sp(4))
story.append(Paragraph(
    "These notes cover all topics from the uploaded lecture slides in complete detail.",
    make_style('ENDSUB','Normal', fontSize=9.5, textColor=colors.grey,
               fontName='Helvetica-Oblique', alignment=TA_CENTER, leading=12)))

# ── Build PDF ─────────────────────────────────────────────────────────────────
doc.build(story)
print("PDF created successfully:", OUTPUT)