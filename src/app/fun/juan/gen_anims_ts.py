#!/usr/bin/env python3
"""Generate anims.ts — more human SVG flipbook animations (5 frames each)."""

# ── SVG primitives ────────────────────────────────────────────────────────────

def ln(x1,y1,x2,y2,sw,c='#eaede6'):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{sw}" stroke-linecap="round"/>'
def circ(cx,cy,r,fill='none',stroke='#eaede6',sw=1.5):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def rect_s(x,y,w,h,fill='none',stroke='#888',sw=1,rx=2):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" rx="{rx}"/>'
def gnd(y=82):
    return f'<line x1="5" y1="{y:.1f}" x2="115" y2="{y:.1f}" stroke="rgba(234,237,230,.13)" stroke-width="1"/>'
def path_s(d,sw=2,c='#eaede6',fill='none'):
    return f'<path d="{d}" stroke="{c}" stroke-width="{sw}" fill="{fill}" stroke-linecap="round" stroke-linejoin="round"/>'

# ── math ──────────────────────────────────────────────────────────────────────

def lp(a,b,t):
    if isinstance(a,tuple): return (a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t)
    return a+(b-a)*t

def lj(A,B,t):
    out={}
    for k in set(A)|set(B):
        a,b=A.get(k),B.get(k)
        if a is not None and b is not None: out[k]=lp(a,b,t)
        elif a is not None: out[k]=a
        else: out[k]=b
    return out

def ping(A,B):   return [A, lj(A,B,.5), B, lj(A,B,.5), A]
def trio(A,B,C): return [A, lj(A,B,.5), B, lj(B,C,.5), C]
def hold(A,n=5): return [A]*n

# ── figure renderer ───────────────────────────────────────────────────────────

GND=82

def fig(j, extras=None):
    out=[gnd()]
    g=j.get
    hd=g('hd'); sl,sr=g('sl'),g('sr'); el,er=g('el'),g('er')
    wl,wr=g('wl'),g('wr'); hl,hr=g('hl'),g('hr')
    kl,kr=g('kl'),g('kr'); fl,fr=g('fl'),g('fr')
    def seg(a,b,sw):
        if a and b: out.append(ln(a[0],a[1],b[0],b[1],sw))
    sm=((sl[0]+sr[0])/2,(sl[1]+sr[1])/2) if sl and sr else None
    hm=((hl[0]+hr[0])/2,(hl[1]+hr[1])/2) if hl and hr else None
    seg(hl,kl,4.5); seg(kl,fl,3.5)
    seg(hr,kr,4.5); seg(kr,fr,3.5)
    seg(sm,hm,4.5); seg(sl,sr,4)
    if sm and hd: seg(sm,hd,3)
    seg(sl,el,3.5); seg(el,wl,3)
    seg(sr,er,3.5); seg(er,wr,3)
    if hd: out.append(circ(hd[0],hd[1],7,fill='#2a2a2a',stroke='#eaede6',sw=1.5))
    if extras:
        for e in (extras if isinstance(extras,list) else [extras]):
            if e: out.append(e)
    return ''.join(out)

def book(frames):
    inner=''.join(f'<g transform="translate(0,{i*100})">{f}</g>' for i,f in enumerate(frames))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" '
            f'width="120" height="100" overflow="hidden" style="display:block">'
            f'<g class="ex-anim-inner">{inner}</g></svg>')

def mk(poses, extras_list=None):
    frames=[]
    for i,j in enumerate(poses):
        ex=extras_list[i] if extras_list and i<len(extras_list) else None
        frames.append(fig(j, extras=ex))
    return book(frames)

# ── props ─────────────────────────────────────────────────────────────────────

def kb_icon(x,y,sz=5):
    return (circ(x,y,sz,fill='none',stroke='#888',sw=1.5)+
            ln(x-sz*.6,y-sz,x+sz*.6,y-sz,1.8,'#888'))

def band_s(x1,y1,x2,y2,sag=0):
    mx,my=(x1+x2)/2,(y1+y2)/2+sag
    return f'<path d="M{x1:.1f},{y1:.1f} Q{mx:.1f},{my:.1f} {x2:.1f},{y2:.1f}" stroke="#6dbf8f" stroke-width="1.5" fill="none" stroke-dasharray="3,2" stroke-linecap="round"/>'

def bench_s(x,y,w=50,h=6):
    return rect_s(x,y,w,h,fill='#1c1c1c',stroke='#888',sw=1)

# ── BASE STANDING POSE (front view) ──────────────────────────────────────────

S=dict(hd=(60,22),sl=(49,31),sr=(71,31),el=(42,47),er=(78,47),wl=(38,63),wr=(82,63),
       hl=(54,53),hr=(66,53),kl=(51,68),kr=(69,68),fl=(48,82),fr=(72,82))

# Standing, arms relaxed at sides
SA=dict(S,el=(44,49),er=(76,49),wl=(42,66),wr=(78,66))

# Arms extended to sides (T-pose) — band pull-apart finish
ARMS_T=dict(S,el=(34,31),er=(86,31),wl=(18,31),wr=(102,31))
ARMS_HALF_T=dict(S,el=(38,33),er=(82,33),wl=(26,34),wr=(94,34))

# Arms at chest/forward — band pull-apart start
ARMS_IN=dict(S,el=(50,36),er=(70,36),wl=(54,32),wr=(66,32))
# Arms half-extended forward at chest height
ARMS_HALF_FWD=dict(S,el=(44,34),er=(76,34),wl=(36,33),wr=(84,33))

# Face-level pulls — face pull end
FACE_IN=dict(S,el=(52,28),er=(68,28),wl=(55,24),wr=(65,24))
# Face pull start — arms extended forward at face height
FACE_OUT=dict(S,el=(42,28),er=(78,28),wl=(30,25),wr=(90,25))

# Squat (deep)
SQ=dict(hd=(60,35),sl=(49,43),sr=(71,43),el=(44,54),er=(76,54),wl=(42,66),wr=(78,66),
        hl=(52,61),hr=(68,61),kl=(43,74),kr=(77,74),fl=(40,82),fr=(80,82))
SQ_MED=lj(S,SQ,.55)

# Hip hinge (RDL-style) — torso horizontal
HINGE=dict(hd=(40,40),sl=(40,48),sr=(62,48),el=(38,62),er=(64,60),wl=(36,76),wr=(64,74),
           hl=(70,52),hr=(80,48),kl=(66,70),kr=(78,66),fl=(64,82),fr=(80,82))
HINGE_MED=lj(SA,HINGE,.5)

# Lunge — left leg forward
LUNGE=dict(hd=(58,28),sl=(48,37),sr=(70,37),el=(42,52),er=(76,52),wl=(40,68),wr=(78,68),
           hl=(54,55),hr=(66,55),kl=(40,71),kr=(74,68),fl=(36,82),fr=(80,74))

# Overhead press finish
OH=dict(S,el=(47,23),er=(73,23),wl=(44,12),wr=(76,12))
# At shoulder (rack position)
RACK=dict(S,el=(45,34),er=(75,34),wl=(48,28),wr=(72,28))

# Goblet squat (holding KB at chest while squatting)
GOBLET_UP=dict(S,el=(50,36),er=(70,36),wl=(54,32),wr=(66,32))
GOBLET_DOWN=dict(SQ,el=(50,48),er=(70,48),wl=(54,44),wr=(66,44))

# Curl up
CURL_UP=dict(S,el=(42,44),er=(78,44),wl=(42,30),wr=(78,30))
CURL_DOWN=dict(S,el=(44,49),er=(76,49),wl=(42,65),wr=(78,65))

# ── PRONE / HORIZONTAL helpers ─────────────────────────────────────────────
# These draw horizontally-oriented figures directly as SVG strings

def prone_plank(arms_y, body_y=52, head_x=16, note=None):
    """Side-view prone figure: head left, feet right.
    arms_y: y position of hands (higher = lower chest)
    """
    # head
    h = circ(head_x, body_y-3, 6.5, fill='#2a2a2a', stroke='#eaede6', sw=1.5)
    # neck→shoulder
    neck = ln(head_x+7, body_y-2, head_x+15, body_y, 3)
    # shoulder to shoulder (depth)
    shldr = ln(head_x+15, body_y, head_x+18, body_y+4, 4)
    # torso horizontal
    torso = ln(head_x+15, body_y, 95, body_y, 4.5)
    # near arm (front arm, visible)
    near_arm = (ln(head_x+18, body_y, head_x+18, arms_y, 3.5) +
                ln(head_x+18, arms_y, head_x+14, 82, 3))
    # far arm (back arm, slightly offset)
    far_arm = (ln(head_x+12, body_y+2, head_x+12, arms_y+2, 3) +
               ln(head_x+12, arms_y+2, head_x+9, 82, 2.5))
    # hips
    hip = ln(90, body_y, 93, body_y+5, 4)
    # near leg
    near_leg = (ln(92, body_y, 104, body_y+4, 4.5) +
                ln(104, body_y+4, 108, body_y+6, 3.5))
    # far leg
    far_leg = (ln(88, body_y+2, 100, body_y+6, 4) +
               ln(100, body_y+6, 104, body_y+8, 3))
    return gnd() + h + neck + shldr + torso + far_arm + far_leg + near_leg + near_arm + hip

def supine_fig(hips_y, head_x=20, legs_straight=True, fy=0):
    """Figure lying on back. hips_y: y of hips (higher = more elevated = glute bridge)"""
    # head on left
    h = circ(head_x, 58, 6.5, fill='#2a2a2a', stroke='#eaede6', sw=1.5)
    neck = ln(head_x+7, 58, head_x+16, 58, 3)
    # torso
    torso = ln(head_x+16, 58, 95, hips_y, 4.5)
    # arms on floor beside body
    arm_l = ln(head_x+18, 60, head_x+10, 75, 3.5)
    arm_r = ln(head_x+22, 62, head_x+30, 76, 3.5)
    # legs
    if legs_straight:
        kl = (90+20, hips_y+10)
        kr = (90+25, hips_y+8)
        ll = ln(90, hips_y, kl[0], kl[1], 4.5) + ln(kl[0], kl[1], 108, 72, 3.5)
        lr = ln(90, hips_y, kr[0], kr[1], 4) + ln(kr[0], kr[1], 108, 68, 3)
    else:
        # knees bent (flat feet on floor)
        ll = ln(90, hips_y, 85, 75, 4.5) + ln(85, 75, 78, 82, 3.5)
        lr = ln(90, hips_y, 95, 73, 4) + ln(95, 73, 90, 82, 3)
    return gnd() + h + neck + torso + arm_l + arm_r + ll + lr

# ── EXERCISE DEFINITIONS ──────────────────────────────────────────────────────
ANIMS = {}

# ─── BAND PULL-APART ──────────────────────────────────────────────────────────
def band_pull_apart_frames():
    poses = ping(ARMS_IN, ARMS_T)
    extras = [band_s(wl[0],wl[1],wr[0],wr[1]) if (wl:=p.get('wl')) and (wr:=p.get('wr')) else None
              for p in poses]
    return [fig(p, extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band pull-apart'] = book(band_pull_apart_frames())
ANIMS['Band pull-aparts (rest)'] = ANIMS['Band pull-apart']

# Band pull-apart at nose/face height
ARMS_IN_HIGH=dict(S,el=(50,28),er=(70,28),wl=(54,24),wr=(66,24))
ARMS_T_HIGH=dict(S,el=(34,24),er=(86,24),wl=(18,24),wr=(102,24))
def pull_apart_high_frames():
    poses=ping(ARMS_IN_HIGH,ARMS_T_HIGH)
    extras=[band_s(p['wl'][0],p['wl'][1],p['wr'][0],p['wr'][1]) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band pull-apart at nose height'] = book(pull_apart_high_frames())
ANIMS['Band pull-apart at face height'] = ANIMS['Band pull-apart at nose height']

# ─── BAND FACE PULL ───────────────────────────────────────────────────────────
# Anchor at frame right, hands pulled to temples
ANCHOR_X=108
def face_pull_frames():
    poses=ping(FACE_OUT, FACE_IN)
    extras=[band_s(p['wl'][0],p['wl'][1],ANCHOR_X,26)+
            band_s(p['wr'][0],p['wr'][1],ANCHOR_X,26)
            for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band face pull'] = book(face_pull_frames())

# Prone T-raise (floor)
def prone_t_raise_frames():
    # lying prone, arms in T at sides → slightly raised
    def frame(arm_y_off):
        body_y=55
        h=circ(16,body_y-3,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        torso=ln(23,body_y,100,body_y,4.5)
        neck=ln(16+7,body_y-2,23,body_y,3)
        arm_l=ln(55,body_y,55,body_y-arm_y_off,3.5)+ln(55,body_y-arm_y_off,20,body_y-arm_y_off,3)
        arm_r=ln(68,body_y,68,body_y-arm_y_off,3.5)+ln(68,body_y-arm_y_off,100,body_y-arm_y_off,3)
        leg_l=ln(90,body_y,102,body_y+5,4.5)+ln(102,body_y+5,110,body_y+8,3.5)
        leg_r=ln(85,body_y+3,98,body_y+8,4)+ln(98,body_y+8,108,body_y+11,3)
        return gnd()+h+neck+torso+arm_l+arm_r+leg_l+leg_r
    f=[0,6,12,6,0]
    return [frame(v) for v in f]

ANIMS['Prone T-raise (floor)'] = book(prone_t_raise_frames())
ANIMS['Prone Y/T raise (floor)'] = ANIMS['Prone T-raise (floor)']
ANIMS['Prone Y raise (floor)'] = ANIMS['Prone T-raise (floor)']

# ─── KB SWING (TWO-HAND) ─────────────────────────────────────────────────────
SWING_BOT=dict(hd=(48,40),sl=(46,50),sr=(66,50),el=(46,62),er=(68,60),wl=(50,72),wr=(70,70),
               hl=(62,62),hr=(74,55),kl=(58,76),kr=(76,68),fl=(56,82),fr=(80,82))
SWING_MID=lj(SA,SWING_BOT,.45)
SWING_TOP=dict(SA,el=(44,36),er=(76,36),wl=(44,24),wr=(76,24))

def kb_swing_frames(two_hand=True):
    poses=trio(SWING_BOT,SWING_MID,SWING_TOP)
    def ex(p,i):
        wl,wr=p.get('wl',(60,70)),p.get('wr',(60,70))
        kx=(wl[0]+wr[0])/2; ky=(wl[1]+wr[1])/2
        return kb_icon(kx,ky+4)
    return [fig(p,extras=[ex(p,i)]) for i,p in enumerate(poses)]

ANIMS['KB swing (two-hand)'] = book(kb_swing_frames())
ANIMS['KB swing (one-hand)'] = ANIMS['KB swing (two-hand)']
ANIMS['Swings only (extended set)'] = ANIMS['KB swing (two-hand)']
ANIMS['KB swing + squat complex'] = ANIMS['KB swing (two-hand)']

# ─── HIP THRUST (BENCH) ──────────────────────────────────────────────────────
def hip_thrust_frames(one_leg=False):
    frames=[]
    for hips_y in [72,62,52,62,72]:
        body_y=hips_y
        h=circ(22,60,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(29,60,38,60,3)
        torso=ln(38,60,90,body_y,4.5)
        shldr=ln(34,60,42,64,4)
        arm_l=ln(34,60,28,73,3.5)+ln(28,73,24,82,3)
        arm_r=ln(42,64,48,76,3.5)+ln(48,76,46,82,3)
        # bench under shoulders
        bench=bench_s(28,62,18,5)
        if not one_leg:
            knee_l=(82,body_y+10); knee_r=(90,body_y+8)
            ll=ln(90,body_y,knee_l[0],knee_l[1],4.5)+ln(knee_l[0],knee_l[1],78,82,3.5)
            lr=ln(90,body_y,knee_r[0],knee_r[1],4)+ln(knee_r[0],knee_r[1],92,82,3)
        else:
            knee_l=(82,body_y+10)
            ll=ln(90,body_y,knee_l[0],knee_l[1],4.5)+ln(knee_l[0],knee_l[1],78,82,3.5)
            lr=ln(90,body_y,104,body_y-4,4)
        frames.append(gnd()+bench+h+neck+shldr+torso+arm_l+arm_r+ll+lr)
    return frames

ANIMS['Hip thrust (bench)'] = book(hip_thrust_frames())
ANIMS['Single-leg hip thrust'] = book(hip_thrust_frames(one_leg=True))

# Glute bridge (floor)
def glute_bridge_frames():
    frames=[]
    for hips_y in [76,66,58,66,76]:
        h=circ(22,62,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(29,62,38,62,3)
        torso=ln(38,62,90,hips_y,4.5)
        shldr=ln(34,62,42,66,4)
        arm_l=ln(34,62,28,75,3.5)+ln(28,75,24,82,3)
        arm_r=ln(42,66,50,78,3.5)+ln(50,78,48,82,3)
        knee_l=(82,hips_y+12); knee_r=(90,hips_y+10)
        ll=ln(90,hips_y,knee_l[0],knee_l[1],4.5)+ln(knee_l[0],knee_l[1],78,82,3.5)
        lr=ln(90,hips_y,knee_r[0],knee_r[1],4)+ln(knee_r[0],knee_r[1],90,82,3)
        frames.append(gnd()+h+neck+shldr+torso+arm_l+arm_r+ll+lr)
    return frames

ANIMS['Glute bridge (floor)'] = book(glute_bridge_frames())

# ─── KB SINGLE-ARM ROW ───────────────────────────────────────────────────────
# Side view, hinge position, one arm pulls KB up
def kb_row_frames():
    frames=[]
    for elbow_y in [68,58,50,58,68]:
        body_y=50; head_x=30
        h=circ(head_x,body_y-8,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(head_x+7,body_y-7,head_x+14,body_y,3)
        torso=ln(head_x+14,body_y,88,body_y,4.5)
        shldr=ln(head_x+10,body_y,head_x+18,body_y+4,4)
        # support arm (down)
        arm_sup=ln(head_x+18,body_y+4,head_x+18,82,3.5)
        # bench under support hand
        bench=bench_s(24,72,20,5)
        # rowing arm: upper arm + forearm + KB
        ea=(head_x+18,elbow_y)
        wa=(head_x+18,elbow_y+14)
        arm_row=(ln(head_x+14,body_y,ea[0],ea[1],3.5)+
                 ln(ea[0],ea[1],wa[0],wa[1],3)+
                 kb_icon(wa[0],wa[1]+5))
        # legs (supporting stance)
        leg_l=ln(76,body_y,72,75,4.5)+ln(72,75,68,82,3.5)
        leg_r=ln(80,body_y,82,75,4)+ln(82,75,86,82,3)
        frames.append(gnd()+bench+h+neck+shldr+torso+arm_sup+leg_l+leg_r+arm_row)
    return frames

ANIMS['KB single-arm row'] = book(kb_row_frames())

# Chest-supported KB row
def chest_supported_row_frames():
    frames=[]
    bench=bench_s(25,50,70,8)
    for elbow_y in [70,60,52,60,70]:
        # figure prone on angled bench
        h=circ(20,44,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,44,34,48,3)
        torso=ln(34,48,92,52,4.5)
        shldr=ln(30,48,38,52,4)
        # both arms hanging down
        ea_l=(36,elbow_y); wa_l=(36,elbow_y+10)
        ea_r=(72,elbow_y+2); wa_r=(72,elbow_y+12)
        arm_l=ln(36,52,ea_l[0],ea_l[1],3.5)+ln(ea_l[0],ea_l[1],wa_l[0],wa_l[1],3)+kb_icon(wa_l[0],wa_l[1]+4)
        arm_r=ln(72,52,ea_r[0],ea_r[1],3)+ln(ea_r[0],ea_r[1],wa_r[0],wa_r[1],2.5)
        leg_l=ln(90,52,100,65,4.5)+ln(100,65,106,82,3.5)
        leg_r=ln(86,54,96,68,4)+ln(96,68,102,82,3)
        frames.append(gnd()+bench+h+neck+shldr+torso+arm_l+arm_r+leg_l+leg_r)
    return frames

ANIMS['Chest-supported KB row'] = book(chest_supported_row_frames())

# ─── DEAD BUG ─────────────────────────────────────────────────────────────────
def dead_bug_frames():
    frames=[]
    for t in [0, .5, 1, .5, 0]:
        # supine, alternate arm/leg extend
        h=circ(22,58,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(29,58,38,60,3)
        torso=ln(38,60,88,60,4.5)
        shldr=ln(34,58,42,62,4)
        # left arm: overhead extended → down
        al_x=lp(28,22,t); al_y=lp(46,26,t)
        arm_l=ln(36,60,al_x,al_y,3.5)
        # right arm: overhead start → stays up
        ar_x=lp(42,82,1-t); ar_y=lp(36,62,1-t)
        arm_r=ln(42,60,ar_x,ar_y,3.5)
        # left leg: 90° bent up → extended
        kl_y=lp(52,75,t); fl_y=lp(52,82,t); fl_x=lp(78,100,t)
        leg_l=ln(76,64,72,kl_y,4.5)+ln(72,kl_y,fl_x,fl_y,3.5)
        # right leg: stays bent
        leg_r=ln(84,64,84,73,4)+ln(84,73,76,82,3)
        frames.append(gnd()+h+neck+shldr+torso+arm_l+arm_r+leg_l+leg_r)
    return frames

ANIMS['Dead bug'] = book(dead_bug_frames())
ANIMS['Hollow body hold'] = ANIMS['Dead bug']

# ─── BAND PALLOF PRESS ───────────────────────────────────────────────────────
PALLOF_IN=dict(S,el=(50,38),er=(70,38),wl=(54,34),wr=(66,34))
PALLOF_OUT=dict(S,el=(44,38),er=(76,38),wl=(30,36),wr=(90,36))

def pallof_frames():
    poses=ping(PALLOF_IN,PALLOF_OUT)
    extras=[band_s(0,38,p['wl'][0],p['wl'][1]) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band Pallof press'] = book(pallof_frames())

# Side plank
def side_plank_frames():
    frames=[]
    for body_y in [55,52,55,52,55]:
        h=circ(16,body_y-14,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(16+7,body_y-13,24,body_y-10,3)
        torso=ln(24,body_y-10,95,body_y,4.5)
        shldr=ln(22,body_y-10,26,body_y-6,4)
        # support arm straight to floor
        arm_sup=ln(24,body_y-8,24,82,3.5)
        # top arm raised
        arm_top=ln(30,body_y-12,30,body_y-26,3)+ln(30,body_y-26,40,body_y-26,2.5)
        # legs stacked
        leg_l=ln(90,body_y,104,body_y+6,4.5)+ln(104,body_y+6,110,body_y+10,3.5)
        leg_r=ln(88,body_y+3,102,body_y+8,4)+ln(102,body_y+8,108,body_y+12,3)
        frames.append(gnd()+h+neck+shldr+torso+arm_sup+arm_top+leg_l+leg_r)
    return frames

ANIMS['Side plank'] = book(side_plank_frames())

# Half-kneeling chop
CHOP_UP=dict(hd=(60,24),sl=(49,33),sr=(71,33),el=(46,28),er=(74,28),wl=(40,22),wr=(80,22),
             hl=(54,55),hr=(66,55),kl=(50,70),kr=(68,70),fl=(46,82),fr=(78,82))
CHOP_DOWN=dict(hd=(60,30),sl=(49,38),sr=(71,38),el=(52,48),er=(68,48),wl=(52,58),wr=(68,58),
               hl=(54,55),hr=(66,55),kl=(50,70),kr=(68,70),fl=(46,82),fr=(78,82))
# One knee on floor (half-kneeling)
HK=dict(hd=(60,26),sl=(49,35),sr=(71,35),el=(42,50),er=(78,50),wl=(40,66),wr=(78,66),
        hl=(54,56),hr=(66,56),kl=(52,70),kr=(68,70),fl=(46,82),fr=(72,82))
CHOP_UP2=dict(HK,el=(46,29),er=(74,29),wl=(40,22),wr=(80,22))
CHOP_DOWN2=dict(HK,el=(52,50),er=(68,50),wl=(52,62),wr=(68,62))

def half_kneeling_chop_frames():
    poses=ping(CHOP_UP2,CHOP_DOWN2)
    extras=[band_s(0,26,p['wl'][0],p['wl'][1])+band_s(0,26,p['wr'][0],p['wr'][1]) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Half-kneeling chop'] = book(half_kneeling_chop_frames())
ANIMS['Half-kneeling hip flexor stretch'] = book([fig(lj(HK,CHOP_DOWN2,.3)) for _ in range(5)])

# ─── BAND EXTERNAL ROTATION ──────────────────────────────────────────────────
EXT_IN=dict(S,el=(52,42),er=(68,42),wl=(50,54),wr=(70,54))   # forearm in (neutral)
EXT_OUT=dict(S,el=(52,42),er=(68,42),wl=(40,42),wr=(80,42))  # forearm rotated out

def ext_rot_frames():
    poses=ping(EXT_IN,EXT_OUT)
    extras=[band_s(p['wl'][0],p['wl'][1],0,42) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band external rotation'] = book(ext_rot_frames())

# Side-lying external rotation
def sidelying_ext_rot_frames():
    frames=[]
    for angle in [0,.5,1,.5,0]:
        body_y=56
        h=circ(20,body_y-2,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,body_y-1,34,body_y+2,3)
        torso=ln(34,body_y+2,95,body_y+4,4.5)
        # elbow on floor, forearm rotates up
        el_x=44; el_y=body_y+4
        fa_y=lp(el_y,el_y-22,angle)
        fa_x=lp(el_x+18,el_x+8,angle)
        arm_top=ln(el_x,el_y,el_x,el_y-2,3.5)+ln(el_x,el_y-2,fa_x,fa_y,3)
        arm_bot=ln(el_x+10,body_y+6,el_x+26,body_y+6,3)
        leg_l=ln(88,body_y+4,100,body_y+10,4.5)+ln(100,body_y+10,108,body_y+14,3.5)
        leg_r=ln(84,body_y+6,96,body_y+12,4)+ln(96,body_y+12,104,body_y+16,3)
        frames.append(gnd()+h+neck+torso+arm_top+arm_bot+leg_l+leg_r)
    return frames

ANIMS['Side-lying external rotation'] = book(sidelying_ext_rot_frames())

# 90/90 shoulder stretch (arm at wall)
SHOULDER_90=dict(S,el=(74,31),er=(74,31),wl=(70,28),wr=(74,18),
                 kl=(50,68),kr=(70,68),fl=(46,82),fr=(74,82))
def shoulder_90_frames():
    poses=hold(SHOULDER_90)
    extras=['<line x1="112" y1="10" x2="112" y2="90" stroke="#888" stroke-width="3"/>' for _ in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['90/90 shoulder stretch'] = book(shoulder_90_frames())

# ─── PUSH-UP ──────────────────────────────────────────────────────────────────
def push_up_frames(hand_y_high=65, hand_y_low=78, body_shift=0):
    """Side-view push-up. hand_y: where hands are (lower = arms more extended)."""
    def frame(hand_y):
        # body elevation = 82 - arm length roughly
        body_y=hand_y-18  # shoulder height above hands
        head_x=18
        h=circ(head_x,body_y-4,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(head_x+7,body_y-3,head_x+14,body_y,3)
        shldr=ln(head_x+14,body_y,head_x+18,body_y+4,4)
        torso=ln(head_x+14,body_y,94,body_y+body_shift,4.5)
        near_upper=ln(head_x+18,body_y+4,head_x+18,hand_y-8,3.5)
        near_fore=ln(head_x+18,hand_y-8,head_x+14,hand_y,3)
        far_upper=ln(head_x+12,body_y+2,head_x+12,hand_y-6,3)
        far_fore=ln(head_x+12,hand_y-6,head_x+9,hand_y,2.5)
        hip=ln(90,body_y+body_shift,94,body_y+body_shift+4,4)
        leg_n=ln(94,body_y+body_shift+2,106,body_y+body_shift+6,4.5)+ln(106,body_y+body_shift+6,110,body_y+body_shift+8,3.5)
        leg_f=ln(90,body_y+body_shift+4,102,body_y+body_shift+8,4)+ln(102,body_y+body_shift+8,108,body_y+body_shift+10,3)
        return gnd()+h+neck+shldr+torso+far_upper+far_fore+leg_f+leg_n+near_upper+near_fore+hip
    vals=[hand_y_high,lp(hand_y_high,hand_y_low,.5),hand_y_low,lp(hand_y_high,hand_y_low,.5),hand_y_high]
    return [frame(v) for v in vals]

ANIMS['Push-up (standard / incline)'] = book(push_up_frames(65,76))
ANIMS['Incline push-up (hands on bench)'] = book(push_up_frames(58,70))
ANIMS['Decline push-up (feet on bench)'] = book(push_up_frames(68,78,4))

# ─── KB OVERHEAD PRESS ───────────────────────────────────────────────────────
def kb_press_frames(bilateral=False):
    poses=ping(RACK,OH)
    def ex(p):
        wl,wr=p.get('wl',(48,28)),p.get('wr',(72,28))
        if bilateral:
            return kb_icon(wl[0],wl[1]-2)+kb_icon(wr[0],wr[1]-2)
        return kb_icon(wr[0],wr[1]-2)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB overhead press (seated / standing)'] = book(kb_press_frames())
ANIMS['Band overhead press (bilateral)'] = book([fig(p) for p in ping(RACK,OH)])

# Pike push-up
def pike_pu_frames():
    frames=[]
    for head_y in [52,60,68,60,52]:
        # figure in pike/downdog position
        hip_x=60; hip_y=30
        h=circ(60,head_y,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        # hands on floor
        hand_l=(38,82); hand_r=(82,82)
        # arms from hips to hands
        al=ln(50,hip_y+10,38,82,3.5)
        ar=ln(70,hip_y+10,82,82,3.5)
        # torso (hips up)
        torso=ln(55,hip_y+12,65,hip_y+12,4.5)
        # legs straight down from hips
        leg_l=ln(54,hip_y+14,50,60,4.5)+ln(50,60,46,82,3.5)
        leg_r=ln(66,hip_y+14,70,60,4)+ln(70,60,74,82,3)
        shldr=ln(46,hip_y+14,48,hip_y+18,4)
        # neck from shoulders to head
        neck=ln(50,hip_y+12,58,head_y-7,3)
        frames.append(gnd()+h+neck+shldr+torso+al+ar+leg_l+leg_r)
    return frames

ANIMS['Pike push-up'] = book(pike_pu_frames())

# ─── KB GOBLET SQUAT ─────────────────────────────────────────────────────────
def goblet_squat_frames():
    poses=ping(GOBLET_UP,GOBLET_DOWN)
    def ex(p):
        wl,wr=p.get('wl',(54,32)),p.get('wr',(66,32))
        return kb_icon((wl[0]+wr[0])/2,(wl[1]+wr[1])/2-4)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB goblet squat'] = book(goblet_squat_frames())
ANIMS['Band squat'] = book([fig(p) for p in ping(S,SQ)])

# ─── PLANK ────────────────────────────────────────────────────────────────────
def plank_frames(body_y=52):
    f=[prone_plank(78,body_y),prone_plank(76,body_y-1),prone_plank(78,body_y),
       prone_plank(76,body_y-1),prone_plank(78,body_y)]
    return f

ANIMS['Plank (standard / RKC)'] = book(plank_frames())

# Bear crawl hold
def bear_crawl_frames():
    frames=[]
    for offset in [0,2,0,2,0]:
        body_y=56
        h=circ(20,body_y-14,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,body_y-13,34,body_y-8,3)
        shldr=ln(32,body_y-8,38,body_y-4,4)
        torso=ln(34,body_y-8,85,body_y-6,4.5)
        # arms down to floor
        arm_l=ln(36,body_y-4,36,82,3.5)
        arm_r=ln(32,body_y-6,32,82,3)
        # legs bent, knees off floor by ~4px
        leg_l=ln(82,body_y-6,82,body_y+16+offset,4.5)+ln(82,body_y+16+offset,70,body_y+18+offset,3.5)
        leg_r=ln(76,body_y-4,76,body_y+18+offset,4)+ln(76,body_y+18+offset,64,body_y+20+offset,3)
        frames.append(gnd()+h+neck+shldr+torso+arm_l+arm_r+leg_l+leg_r)
    return frames

ANIMS['Bear crawl hold'] = book(bear_crawl_frames())

# Superman hold
def superman_frames():
    frames=[]
    for lift in [0,6,10,6,0]:
        body_y=58
        h=circ(18,body_y-lift-2,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(25,body_y-lift-1,34,body_y-lift,3)
        torso=ln(34,body_y-lift,92,body_y,4.5)
        # arms extended forward/overhead
        arm_l=ln(36,body_y-lift,20,body_y-lift-8-lift,3.5)
        arm_r=ln(36,body_y-lift+2,22,body_y-lift-6-lift,3)
        # legs extended behind, slightly raised
        leg_l=ln(88,body_y+2,104,body_y-lift+4,4.5)+ln(104,body_y-lift+4,112,body_y-lift+2,3.5)
        leg_r=ln(84,body_y+4,100,body_y-lift+6,4)+ln(100,body_y-lift+6,108,body_y-lift+4,3)
        frames.append(gnd()+h+neck+torso+arm_l+arm_r+leg_l+leg_r)
    return frames

ANIMS['Superman hold'] = book(superman_frames())

# ─── BIRD DOG ─────────────────────────────────────────────────────────────────
def bird_dog_frames():
    frames=[]
    for t in [0,.5,1,.5,0]:
        body_y=56
        h=circ(20,body_y-14,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,body_y-13,34,body_y-8,3)
        shldr=ln(32,body_y-8,38,body_y-4,4)
        torso=ln(34,body_y-8,86,body_y-8,4.5)
        # support arms
        arm_l=ln(36,body_y-4,36,82,3.5)
        # extending arm
        ax=lp(38,16,t); ay=lp(body_y-8,body_y-8,t)
        arm_ext=ln(38,body_y-8,ax,ay,3.5)
        # support legs
        leg_r=ln(80,body_y-8,80,body_y+12,4.5)+ln(80,body_y+12,70,body_y+16,3.5)
        # extending leg
        lx=lp(84,108,t); ly=lp(body_y-8,body_y-16,t)
        leg_ext=ln(84,body_y-8,lx,ly,4.5)
        frames.append(gnd()+h+neck+shldr+torso+arm_l+leg_r+arm_ext+leg_ext)
    return frames

ANIMS['Bird dog'] = book(bird_dog_frames())

# ─── KB TURKISH GET-UP ────────────────────────────────────────────────────────
def tgu_frames():
    # Frame 1: lying, arm straight up
    def f1():
        h=circ(20,58,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,58,36,60,3)
        torso=ln(36,60,86,62,4.5)
        shldr=ln(32,58,40,62,4)
        arm_up=ln(36,58,36,32,3.5)+kb_icon(36,26)
        arm_dn=ln(40,62,48,76,3.5)+ln(48,76,46,82,3)
        kl=ln(78,64,72,76,4.5)+ln(72,76,66,82,3.5)
        kr=ln(82,64,90,74,4)+ln(90,74,90,82,3)
        return gnd()+h+neck+shldr+torso+arm_up+arm_dn+kl+kr
    # Frame 3: sitting up, arm still up
    def f3():
        h=circ(28,36,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(35,37,42,42,3)
        shldr=ln(38,40,48,44,4)
        torso=ln(42,42,82,60,4.5)
        arm_up=ln(42,40,38,16,3.5)+kb_icon(38,10)
        arm_sup=ln(44,44,30,74,3.5)+ln(30,74,28,82,3)
        leg_l=ln(76,62,72,76,4.5)+ln(72,76,64,82,3.5)
        leg_r=ln(80,60,92,70,4)+ln(92,70,96,82,3)
        return gnd()+h+neck+shldr+torso+arm_up+arm_sup+leg_l+leg_r
    # Frame 5: standing with arm overhead
    def f5():
        p=dict(OH,el=(47,22),er=(73,22),wl=(46,10),wr=(74,10))
        return fig(p,extras=[kb_icon(74,8)])
    mid1=lp(0.3,0.7,0.5)
    return [f1(),f1(),f3(),f3(),f5()]

ANIMS['KB Turkish get-up'] = book(tgu_frames())
ANIMS['Half get-up (to elbow only)'] = book([tgu_frames()[0],tgu_frames()[1],tgu_frames()[2],tgu_frames()[1],tgu_frames()[0]])

# ─── KB CLEAN ─────────────────────────────────────────────────────────────────
CLEAN_BOT=SWING_BOT
CLEAN_MID=dict(SA,el=(44,38),er=(76,38),wl=(50,28),wr=(72,28))
CLEAN_RACK=dict(SA,el=(50,36),er=(72,36),wl=(54,28),wr=(72,26))

def clean_frames():
    poses=trio(CLEAN_BOT,CLEAN_MID,CLEAN_RACK)
    def ex(p,i):
        wr=p.get('wr',(72,28))
        return kb_icon(wr[0],wr[1]-4)
    return [fig(p,extras=[ex(p,i)]) for i,p in enumerate(poses)]

ANIMS['KB clean (single arm)'] = book(clean_frames())

# KB high pull
HIGH_PULL_TOP=dict(SA,el=(44,32),er=(76,32),wl=(44,20),wr=(76,20))

def high_pull_frames():
    poses=ping(SWING_BOT,HIGH_PULL_TOP)
    def ex(p):
        wl,wr=p.get('wl',(60,20)),p.get('wr',(60,20))
        return kb_icon((wl[0]+wr[0])/2,(wl[1]+wr[1])/2-2)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB high pull'] = book(high_pull_frames())

# ─── KB THRUSTER ──────────────────────────────────────────────────────────────
def thruster_frames():
    poses=trio(GOBLET_DOWN,GOBLET_UP,OH)
    def ex(p):
        wl,wr=p.get('wl',(48,28)),p.get('wr',(72,28))
        return kb_icon((wl[0]+wr[0])/2,(wl[1]+wr[1])/2-3)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB thruster (squat + press)'] = book(thruster_frames())

# ─── SUITCASE CARRY / FARMER'S CARRY ─────────────────────────────────────────
# Walking with weight — alternate leg steps
WALK_L=dict(SA,hl=(54,53),hr=(66,53),kl=(46,68),kr=(72,62),fl=(42,82),fr=(78,74))
WALK_R=dict(SA,hl=(54,53),hr=(66,53),kl=(58,62),kr=(64,74),fl=(54,74),fr=(68,82))

def carry_frames(kb_side='r'):
    poses=ping(WALK_L,WALK_R)
    def ex(p):
        if kb_side=='r':
            wr=p.get('wr',(78,63)); return kb_icon(wr[0],wr[1]+4)
        wl=p.get('wl',(38,63)); return kb_icon(wl[0],wl[1]+4)
    return [fig(p,extras=[ex(p)]) for p in poses]

def farmer_carry_frames():
    poses=ping(WALK_L,WALK_R)
    def ex(p):
        wl=p.get('wl',(38,63)); wr=p.get('wr',(78,63))
        return kb_icon(wl[0],wl[1]+4)+kb_icon(wr[0],wr[1]+4)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB suitcase carry'] = book(carry_frames('r'))
ANIMS['KB suitcase carry (single arm)'] = ANIMS['KB suitcase carry']
ANIMS["KB farmer's carry"] = book(farmer_carry_frames())

# Single-arm overhead carry
OVERHEAD_WALK_L=dict(WALK_L,er=(72,23),wr=(74,12))
OVERHEAD_WALK_R=dict(WALK_R,er=(72,23),wr=(74,12))
def overhead_carry_frames():
    poses=ping(OVERHEAD_WALK_L,OVERHEAD_WALK_R)
    def ex(p): wr=p.get('wr',(74,12)); return kb_icon(wr[0],wr[1]-3)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['Single-arm KB overhead carry'] = book(overhead_carry_frames())

# Double KB rack carry
RACK_WALK_L=dict(WALK_L,el=(50,36),er=(70,36),wl=(52,28),wr=(68,28))
RACK_WALK_R=dict(WALK_R,el=(50,36),er=(70,36),wl=(52,28),wr=(68,28))
def rack_carry_frames():
    poses=ping(RACK_WALK_L,RACK_WALK_R)
    def ex(p):
        wl=p.get('wl',(52,28)); wr=p.get('wr',(68,28))
        return kb_icon(wl[0],wl[1]-3)+kb_icon(wr[0],wr[1]-3)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['Double KB rack carry'] = book(rack_carry_frames())

# ─── KB WINDMILL ──────────────────────────────────────────────────────────────
WINDMILL_UP=dict(hd=(60,22),sl=(49,31),sr=(71,31),el=(46,23),er=(74,23),wl=(44,14),wr=(76,14),
                 hl=(54,53),hr=(66,53),kl=(51,68),kr=(69,68),fl=(48,82),fr=(72,82))
WINDMILL_DOWN=dict(hd=(50,50),sl=(44,58),sr=(68,50),el=(42,66),er=(68,48),wl=(38,78),wr=(68,42),
                   hl=(58,62),hr=(70,55),kl=(52,76),kr=(74,68),fl=(50,82),fr=(80,82))
def windmill_frames():
    poses=ping(WINDMILL_UP,WINDMILL_DOWN)
    def ex(p): wr=p.get('wr',(76,14)); return kb_icon(wr[0],wr[1]-3)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB windmill'] = book(windmill_frames())

# ─── BAND SEATED ROW ─────────────────────────────────────────────────────────
SEATED_FWD=dict(hd=(52,28),sl=(42,36),sr=(66,36),el=(36,50),er=(68,48),wl=(28,62),wr=(72,58),
                hl=(50,58),hr=(66,56),kl=(42,72),kr=(76,70),fl=(36,82),fr=(82,82))
SEATED_BACK=dict(hd=(56,28),sl=(46,36),sr=(70,36),el=(40,46),er=(74,44),wl=(48,38),wr=(68,36),
                 hl=(52,58),hr=(68,56),kl=(42,72),kr=(76,70),fl=(36,82),fr=(82,82))

def seated_row_frames():
    poses=ping(SEATED_FWD,SEATED_BACK)
    extras=[band_s(p['wl'][0],p['wl'][1],8,44)+band_s(p['wr'][0],p['wr'][1],8,44) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band seated row'] = book(seated_row_frames())

# Bench-supported KB row (bilateral)
ANIMS['Bench-supported KB row (bilateral)'] = ANIMS['Chest-supported KB row']

# ─── BAND LAT PULLDOWN ───────────────────────────────────────────────────────
LAT_UP=dict(S,el=(40,20),er=(80,20),wl=(34,12),wr=(86,12))
LAT_DOWN=dict(S,el=(44,36),er=(76,36),wl=(48,30),wr=(72,30))

def lat_pulldown_frames():
    poses=ping(LAT_UP,LAT_DOWN)
    extras=[band_s(p['wl'][0],p['wl'][1],50,5)+band_s(p['wr'][0],p['wr'][1],70,5) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band lat pulldown (kneel/sit)'] = book(lat_pulldown_frames())

# ─── KB LATERAL RAISE ────────────────────────────────────────────────────────
LAT_RAISE_DOWN=dict(SA)
LAT_RAISE_UP=dict(S,el=(38,36),er=(82,36),wl=(28,36),wr=(92,36))

def lat_raise_frames():
    poses=ping(LAT_RAISE_DOWN,LAT_RAISE_UP)
    def ex(p):
        wl=p.get('wl',(38,63)); wr=p.get('wr',(82,63))
        return kb_icon(wl[0],wl[1]+2)+kb_icon(wr[0],wr[1]+2)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB lateral raise'] = book(lat_raise_frames())

# ─── BAND BICEP CURL ─────────────────────────────────────────────────────────
CURL_SETUP=dict(SA,el=(50,48),er=(70,48),wl=(48,64),wr=(72,64))
CURL_TOP=dict(SA,el=(50,48),er=(70,48),wl=(46,30),wr=(74,30))

def bicep_curl_frames(alternating=False):
    if not alternating:
        poses=ping(CURL_SETUP,CURL_TOP)
        extras=[band_s(p['wl'][0],p['wl'][1],48,86)+band_s(p['wr'][0],p['wr'][1],72,86) for p in poses]
        return [fig(p,extras=[e]) for p,e in zip(poses,extras)]
    else:
        # alternating: left then right
        L_UP=dict(SA,el=(50,48),wl=(46,30))
        R_UP=dict(SA,er=(70,48),wr=(74,30))
        poses=[CURL_SETUP,lj(CURL_SETUP,L_UP,1),CURL_SETUP,lj(CURL_SETUP,R_UP,1),CURL_SETUP]
        def ex(p):
            wl=p.get('wl',(48,64)); wr=p.get('wr',(72,64))
            return kb_icon(wl[0],wl[1]+2)+kb_icon(wr[0],wr[1]+2)
        return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['Band bicep curl'] = book(bicep_curl_frames())
ANIMS['KB curl (alternating)'] = book(bicep_curl_frames(alternating=True))

# ─── TRICEP EXERCISES ────────────────────────────────────────────────────────
# Tricep dip (bench)
def tricep_dip_frames():
    frames=[]
    bench=bench_s(16,52,26,6)
    bench2=bench_s(78,52,26,6)
    for hip_y in [64,72,64,72,64]:
        h=circ(60,28,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(60,35,60,42,3)
        shldr=ln(46,44,74,44,4)
        torso=ln(60,42,60,hip_y,4.5)
        # arms from bench behind to hips
        arm_l=ln(46,44,30,52,3.5)+ln(30,52,28,hip_y-6,3)
        arm_r=ln(74,44,90,52,3.5)+ln(90,52,92,hip_y-6,3)
        hl=ln(56,hip_y,60,82,4.5)+ln(60,82,52,82,3.5)
        hr=ln(64,hip_y,68,82,4)+ln(68,82,76,82,3)
        frames.append(gnd()+bench+bench2+h+neck+shldr+torso+arm_l+arm_r+hl+hr)
    return frames

ANIMS['Tricep dip (bench)'] = book(tricep_dip_frames())

# Band tricep pushdown
PUSH_TOP=dict(S,el=(48,36),er=(72,36),wl=(50,36),wr=(70,36))
PUSH_BOT=dict(S,el=(48,36),er=(72,36),wl=(46,58),wr=(74,58))

def tricep_pushdown_frames():
    poses=ping(PUSH_TOP,PUSH_BOT)
    extras=[band_s(p['wl'][0],p['wl'][1],p['wr'][0],p['wr'][1])+
            band_s((p['wl'][0]+p['wr'][0])/2,p['wl'][1],60,4) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band tricep pushdown'] = book(tricep_pushdown_frames())

# KB overhead tricep extension
OTE_UP=dict(S,el=(52,22),er=(68,22),wl=(50,12),wr=(70,12))
OTE_DOWN=dict(S,el=(52,22),er=(68,22),wl=(50,36),wr=(70,36))

def ote_frames():
    poses=ping(OTE_UP,OTE_DOWN)
    def ex(p):
        wl,wr=p.get('wl',(50,12)),p.get('wr',(70,12))
        return kb_icon((wl[0]+wr[0])/2,(wl[1]+wr[1])/2-3)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB overhead tricep extension'] = book(ote_frames())

# ─── KB ROMANIAN DEADLIFT ────────────────────────────────────────────────────
RDL_TOP=dict(SA,hl=(54,53),hr=(66,53))
RDL_BOT=HINGE

def rdl_frames(single_leg=False):
    poses=ping(RDL_TOP,RDL_BOT)
    def ex(p):
        wl=p.get('wl',(38,66)); wr=p.get('wr',(78,66))
        kx=(wl[0]+wr[0])/2; ky=(wl[1]+wr[1])/2
        return kb_icon(kx,ky+2)
    if single_leg:
        SL_BOT=dict(HINGE,fr=(78,40),kr=(70,55))
        slposes=ping(RDL_TOP,SL_BOT)
        return [fig(p,extras=[ex(p)]) for p in slposes]
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['KB Romanian deadlift'] = book(rdl_frames())
ANIMS['Single-leg KB RDL'] = book(rdl_frames(single_leg=True))

# Band pull-through
PULLT_BOT=dict(HINGE,wl=(60,70),wr=(72,68))
PULLT_TOP=dict(SA,wl=(48,60),wr=(72,60))

def pull_through_frames():
    poses=ping(PULLT_BOT,PULLT_TOP)
    extras=[band_s(p['wl'][0],p['wl'][1],5,72) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band pull-through'] = book(pull_through_frames())

# ─── BAND HIP ABDUCTION ──────────────────────────────────────────────────────
def clamshell_frames():
    frames=[]
    for top_knee_x in [72,80,86,80,72]:
        body_y=56
        h=circ(20,body_y-4,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,body_y-3,34,body_y,3)
        torso=ln(34,body_y,88,body_y+4,4.5)
        shldr=ln(30,body_y,38,body_y+4,4)
        arm=ln(30,body_y,22,body_y+16,3.5)+ln(22,body_y+16,20,body_y+24,3)
        # bottom leg
        bot_leg=ln(86,body_y+4,92,body_y+16,4.5)+ln(92,body_y+16,88,body_y+26,3.5)
        # top leg with clamshell opening
        top_leg=ln(84,body_y+2,top_knee_x,body_y-8,4)+ln(top_knee_x,body_y-8,top_knee_x+4,body_y+6,3)
        band=band_s(76,body_y+2,top_knee_x-4,body_y-6,2)
        frames.append(gnd()+h+neck+shldr+torso+arm+bot_leg+top_leg+band)
    return frames

ANIMS['Band hip abduction (clamshell)'] = book(clamshell_frames())

# ─── REVERSE LUNGE ───────────────────────────────────────────────────────────
LUNGE_START=dict(SA)
LUNGE_BOT=LUNGE

def reverse_lunge_frames():
    poses=ping(LUNGE_START,LUNGE_BOT)
    def ex(p):
        wl=p.get('wl',(42,66))
        return kb_icon(wl[0],wl[1]+2)
    return [fig(p,extras=[ex(p)]) for p in poses]

ANIMS['Reverse lunge (KB)'] = book(reverse_lunge_frames())

# Bulgarian split squat
BSS_UP=dict(S,kl=(50,68),kr=(70,64),fl=(46,82),fr=(80,68))
BSS_DOWN=dict(hd=(60,35),sl=(50,43),sr=(70,43),el=(44,58),er=(76,58),wl=(42,74),wr=(78,74),
              hl=(52,60),hr=(68,60),kl=(42,74),kr=(70,64),fl=(38,82),fr=(82,68))

def bss_frames():
    poses=ping(BSS_UP,BSS_DOWN)
    bench=bench_s(68,62,24,5)
    return [fig(p,extras=[bench]) for p in poses]

ANIMS['Bulgarian split squat (bench)'] = book(bss_frames())

# Step-up
STEP_MID=dict(S,kl=(52,60),fl=(46,68),hl=(54,46),hr=(66,52))
STEP_UP=dict(SA,kl=(52,54),fl=(46,62),kl2=(52,68),fl2=(48,82))

def step_up_frames():
    bench=bench_s(30,62,60,5)
    poses=trio(SA,STEP_MID,STEP_MID)
    return [fig(p,extras=[bench]) for p in poses]

ANIMS['Step-up (bench)'] = book(step_up_frames())

# ─── BENCH LEG RAISE ─────────────────────────────────────────────────────────
def leg_raise_frames():
    frames=[]
    bench=bench_s(10,54,100,6)
    for leg_y in [80,70,58,70,80]:
        h=circ(20,48,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,48,36,52,3)
        torso=ln(36,52,86,54,4.5)
        shldr=ln(32,50,40,54,4)
        arm_l=ln(32,52,24,62,3.5)+ln(24,62,20,70,3)
        arm_r=ln(40,54,50,64,3.5)+ln(50,64,52,72,3)
        # legs raise
        leg_l=ln(84,54,92,leg_y,4.5)+ln(92,leg_y,96,leg_y+4,3.5)
        leg_r=ln(80,54,86,leg_y+2,4)+ln(86,leg_y+2,90,leg_y+6,3)
        frames.append(gnd()+bench+h+neck+shldr+torso+arm_l+arm_r+leg_l+leg_r)
    return frames

ANIMS['Bench leg raise'] = book(leg_raise_frames())

# ─── KB BENCH PRESS ──────────────────────────────────────────────────────────
def kb_bench_press_frames():
    frames=[]
    bench=bench_s(10,52,100,6)
    for arm_y in [44,52,60,52,44]:
        h=circ(20,46,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,46,36,50,3)
        torso=ln(36,50,86,52,4.5)
        shldr=ln(32,48,40,52,4)
        arm_l=ln(34,50,32,arm_y,3.5)+ln(32,arm_y,28,arm_y-2,3)+kb_icon(24,arm_y-5)
        arm_r=ln(40,52,42,arm_y,3.5)+ln(42,arm_y,46,arm_y-2,3)+kb_icon(50,arm_y-5)
        leg_l=ln(82,52,88,68,4.5)+ln(88,68,84,82,3.5)
        leg_r=ln(78,52,82,70,4)+ln(82,70,86,82,3)
        frames.append(gnd()+bench+h+neck+shldr+torso+arm_l+arm_r+leg_l+leg_r)
    return frames

ANIMS['KB bench press'] = book(kb_bench_press_frames())

# ─── BAND CHEST PRESS / FLY ──────────────────────────────────────────────────
CHEST_PRESS_IN=dict(S,el=(46,36),er=(74,36),wl=(40,30),wr=(80,30))
CHEST_PRESS_OUT=dict(S,el=(40,34),er=(80,34),wl=(26,32),wr=(94,32))

def band_chest_press_frames():
    poses=ping(CHEST_PRESS_IN,CHEST_PRESS_OUT)
    extras=[band_s(p['wl'][0],p['wl'][1],0,36)+band_s(p['wr'][0],p['wr'][1],120,36) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band chest press (anchored)'] = book(band_chest_press_frames())

FLY_IN=dict(S,el=(50,36),er=(70,36),wl=(52,32),wr=(68,32))
FLY_OUT=dict(S,el=(34,34),er=(86,34),wl=(20,38),wr=(100,38))

def band_fly_frames():
    poses=ping(FLY_IN,FLY_OUT)
    extras=[band_s(p['wl'][0],p['wl'][1],0,36)+band_s(p['wr'][0],p['wr'][1],120,36) for p in poses]
    return [fig(p,extras=[e]) for p,e in zip(poses,extras)]

ANIMS['Band chest fly'] = book(band_fly_frames())

# ─── PUSH-UP → BAND ROW SUPERSET ─────────────────────────────────────────────
def pu_row_frames():
    pu=push_up_frames(65,76)
    row=kb_row_frames()
    return [pu[0],pu[2],pu[0],row[0],row[2]]

ANIMS['Push-up → band row superset'] = book(pu_row_frames())

# ─── WALK ────────────────────────────────────────────────────────────────────
WALK_STEP_L=dict(SA,kl=(46,65),kr=(72,72),fl=(40,82),fr=(78,78))
WALK_STEP_R=dict(SA,kl=(50,72),kr=(68,65),fl=(46,78),fr=(74,82))

def walk_frames():
    poses=ping(WALK_STEP_L,WALK_STEP_R)
    return [fig(p) for p in poses]

ANIMS['Walk 15–30 min'] = book(walk_frames())
ANIMS['Light mobility circuit'] = ANIMS['Walk 15–30 min']

# Easy bike ride
def bike_frames():
    frames=[]
    for t in [0,.5,1,.5,0]:
        # figure seated on bike, legs pedaling
        h=circ(50,30,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(50,37,50,44,3)
        shldr=ln(42,46,62,46,4)
        # lean forward torso
        torso=ln(52,44,72,58,4.5)
        # handle bars
        arm_l=ln(42,46,34,52,3.5)+ln(34,52,30,56,3)
        arm_r=ln(62,46,70,52,3.5)+ln(70,52,74,56,3)
        # bike frame
        bike=rect_s(50,58,40,6,fill='#1c1c1c',stroke='#888',sw=1)
        # pedaling legs
        angle_l=t*3.14159; angle_r=t*3.14159+3.14159
        import math
        kl_x=70+14*math.sin(angle_l); kl_y=68+8*math.cos(angle_l)
        fl_x=70+10*math.sin(angle_l*1.4); fl_y=72+10*math.cos(angle_l*1.4)
        kr_x=70+14*math.sin(angle_r); kr_y=68+8*math.cos(angle_r)
        fr_x=70+10*math.sin(angle_r*1.4); fr_y=72+10*math.cos(angle_r*1.4)
        leg_l=ln(72,58,kl_x,kl_y,4.5)+ln(kl_x,kl_y,fl_x,fl_y,3.5)
        leg_r=ln(72,58,kr_x,kr_y,4)+ln(kr_x,kr_y,fr_x,fr_y,3)
        frames.append(gnd()+bike+h+neck+shldr+torso+arm_l+arm_r+leg_l+leg_r)
    return frames

ANIMS['Easy bike ride'] = book(bike_frames())

# ─── COUCH STRETCH ───────────────────────────────────────────────────────────
def couch_stretch_frames():
    wall='<line x1="110" y1="10" x2="110" y2="90" stroke="#888" stroke-width="3"/>'
    frames=[]
    for lean in [0,3,5,3,0]:
        h=circ(54,26+lean,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(54,33+lean,54,40+lean,3)
        shldr=ln(44,42+lean,64,42+lean,4)
        torso=ln(54,40+lean,68,60,4.5)
        arm_l=ln(44,42+lean,36,54+lean,3.5)+ln(36,54+lean,34,66+lean,3)
        arm_r=ln(64,42+lean,72,54+lean,3.5)+ln(72,54+lean,74,66+lean,3)
        # front leg: kneeling
        fl_leg=ln(64,60,58,76,4.5)+ln(58,76,56,82,3.5)
        # back leg: foot against wall at shin level
        bk_foot=ln(72,62,80,56,4)+ln(80,56,108,52,3.5)
        frames.append(gnd()+wall+h+neck+shldr+torso+arm_l+arm_r+fl_leg+bk_foot)
    return frames

ANIMS['Couch stretch'] = book(couch_stretch_frames())

# Half-kneeling hip flexor stretch
def hkf_stretch_frames():
    frames=[]
    for lean in [0,2,4,2,0]:
        h=circ(58,28+lean,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(58,35+lean,58,42+lean,3)
        shldr=ln(48,44+lean,68,44+lean,4)
        torso=ln(58,42+lean,66,60,4.5)
        arm_l=ln(48,44+lean,42,58+lean,3.5)+ln(42,58+lean,40,72+lean,3)
        arm_r=ln(68,44+lean,74,58+lean,3.5)+ln(74,58+lean,76,72+lean,3)
        # front foot flat on floor
        front_leg=ln(62,60,52,76,4.5)+ln(52,76,44,82,3.5)
        # back knee on floor, shin flat
        back_leg=ln(66,60,76,66,4.5)+ln(76,66,88,68,3.5)
        frames.append(gnd()+h+neck+shldr+torso+arm_l+arm_r+front_leg+back_leg)
    return frames

ANIMS['Half-kneeling hip flexor stretch'] = book(hkf_stretch_frames())

# ─── THORACIC ROTATIONS ──────────────────────────────────────────────────────
THOR_L=dict(hd=(54,24),sl=(40,34),sr=(64,34),el=(34,34),er=(64,34),wl=(24,34),wr=(64,34),
            hl=(52,54),hr=(64,54),kl=(48,70),kr=(68,70),fl=(44,82),fr=(72,82))
THOR_R=dict(hd=(66,24),sl=(56,34),sr=(80,34),el=(56,34),er=(86,34),wl=(56,34),wr=(96,34),
            hl=(52,54),hr=(64,54),kl=(48,70),kr=(68,70),fl=(44,82),fr=(72,82))

ANIMS['Thoracic rotations'] = book([fig(p) for p in ping(THOR_L,THOR_R)])

# ─── WALL ANGELS ─────────────────────────────────────────────────────────────
WA_LOW=dict(S,el=(44,42),er=(76,42),wl=(38,36),wr=(82,36))
WA_HIGH=dict(S,el=(42,26),er=(78,26),wl=(36,18),wr=(84,18))

def wall_angel_frames():
    wall='<line x1="4" y1="10" x2="4" y2="90" stroke="#888" stroke-width="3"/>'
    poses=ping(WA_LOW,WA_HIGH)
    return [fig(p,extras=[wall]) for p in poses]

ANIMS['Wall angels'] = book(wall_angel_frames())

# ─── CAT-COW ─────────────────────────────────────────────────────────────────
def cat_cow_frames():
    frames=[]
    for curve in [-10,0,10,0,-10]:  # negative=cat arch, positive=cow dip
        h=circ(20,56+curve//3,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(27,56+curve//3,34,58,3)
        # torso with arch/dip — use a control point
        mid_y=52+curve
        torso_path=path_s(f'M34,58 Q60,{mid_y} 88,58',4.5)
        shldr=ln(30,58,38,62,4)
        arm_l=ln(34,60,34,82,3.5)
        arm_r=ln(30,60,30,82,3)
        leg_l=ln(86,60,90,76,4.5)+ln(90,76,82,82,3.5)
        leg_r=ln(82,60,86,76,4)+ln(86,76,90,82,3)
        frames.append(gnd()+h+neck+torso_path+shldr+arm_l+arm_r+leg_l+leg_r)
    return frames

ANIMS['Cat-cow'] = book(cat_cow_frames())

# ─── THREAD THE NEEDLE ───────────────────────────────────────────────────────
def thread_needle_frames():
    frames=[]
    for reach in [0,.5,1,.5,0]:
        h_x=lp(20,50,reach); h_y=lp(56,68,reach)
        h=circ(h_x,h_y,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        body_y=58
        neck=ln(h_x+7,h_y,34,body_y,3)
        torso=ln(34,body_y,88,body_y,4.5)
        shldr=ln(30,body_y,38,body_y+4,4)
        arm_stay=ln(36,body_y+4,36,82,3.5)  # support arm
        arm_l=ln(36,body_y,h_x+7,h_y,3)  # threading arm
        leg_l=ln(86,body_y+2,90,74,4.5)+ln(90,74,84,82,3.5)
        leg_r=ln(82,body_y+4,86,76,4)+ln(86,76,90,82,3)
        frames.append(gnd()+h+neck+torso+shldr+arm_stay+arm_l+leg_l+leg_r)
    return frames

ANIMS['Thread the needle'] = book(thread_needle_frames())

# ─── 90/90 HIP MOBILITY ──────────────────────────────────────────────────────
def hip_90_frames():
    frames=[]
    for t in [0,.5,1,.5,0]:
        # seated 90/90 position, rotating between sides
        h=circ(60,30,6.5,fill='#2a2a2a',stroke='#eaede6',sw=1.5)
        neck=ln(60,37,60,44,3)
        shldr=ln(48,46,72,46,4)
        torso=ln(60,44,60,62,4.5)
        arm_l=ln(48,46,36,58,3.5)+ln(36,58,32,70,3)
        arm_r=ln(72,46,84,58,3.5)+ln(84,58,88,70,3)
        # front leg 90°
        fl_x=lp(42,30,t); fl_y=lp(74,76,t)
        front_leg=ln(58,62,fl_x,fl_y,4.5)+ln(fl_x,fl_y,lp(38,28,t),82,3.5)
        # back leg 90°
        bl_x=lp(78,90,t); bl_y=lp(70,72,t)
        back_leg=ln(62,62,bl_x,bl_y,4)+ln(bl_x,bl_y,lp(90,96,t),82,3)
        frames.append(gnd()+h+neck+shldr+torso+arm_l+arm_r+front_leg+back_leg)
    return frames

ANIMS['90/90 hip mobility drill'] = book(hip_90_frames())
ANIMS['90/90 shoulder stretch'] = ANIMS['90/90 shoulder stretch']  # already defined

# ─── OUTPUT ──────────────────────────────────────────────────────────────────

if __name__=='__main__':
    print('// Auto-generated — do not edit. Run gen_anims_ts.py to regenerate.')
    print('export const ANIMS: Record<string, string> = {')
    for name,svg in ANIMS.items():
        escaped=svg.replace('\\','\\\\').replace('"','\\"')
        print(f'  "{name}": "{escaped}",')
    print('}')
