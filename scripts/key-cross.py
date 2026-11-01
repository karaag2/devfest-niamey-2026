# Détoure la boucle 9:16 de la croix d'Agadez (fond bleu, grille, main, ombre retirés)
# et l'encode en vidéo transparente : WebM VP9 alpha (Chrome, Firefox) + HEVC alpha (Safari, iOS).
# Usage : python3 scripts/key-cross.py assets/videos/V03_agadez-cross-microchip_loop_9x16.mp4 media/video/V03_agadez-cross-cutout
# Prérequis : ffmpeg (avec hevc_videotoolbox, donc macOS), Pillow, numpy.
import subprocess, sys, numpy as np
from PIL import Image
src, out, W, H = sys.argv[1], sys.argv[2], 540, 960
probe = int(sys.argv[3]) if len(sys.argv) > 3 else -1
dec = subprocess.Popen(['ffmpeg','-v','error','-i',src,'-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
frames=[]
while True:
    b = dec.stdout.read(W*H*3)
    if len(b) < W*H*3: break
    frames.append(np.frombuffer(b,np.uint8).reshape(H,W,3))
def key(f):
    f = f.astype(np.float32)
    r,g,b = f[...,0],f[...,1],f[...,2]
    blue = b - np.maximum(r,g)              # « bleuitude »
    a = 1 - np.clip((blue - 22) / 38, 0, 1)
    yy, xx = np.mgrid[0:H,0:W]
    a[(xx > W*0.80) & (yy > H*0.58)] = 0     # la main
    a[yy > H*0.90] = 0
    a[(yy > H*0.79) & (xx > W*0.42)] = 0     # l ombre portée au sol
    # nettoyage : érosion légère du bord (min 3x3) pour enlever le liseré
    p = np.pad(a,1,mode='edge')
    a = np.minimum.reduce([p[i:i+H,j:j+W] for i in range(3) for j in range(3)])
    # despill : on retire le reflet bleu des bords argentés
    cap = np.maximum(r,g)*1.04+6
    b2 = np.where(a < 1, np.minimum(b, cap), b)
    rgb = np.stack([r,g,b2],-1)
    return np.dstack([rgb, a*255]).clip(0,255).astype(np.uint8)
if probe >= 0:
    Image.fromarray(key(frames[probe])).save(out); sys.exit()
keyed=[key(f) for f in frames]
Image.fromarray(keyed[0]).save(out+'.poster.webp', quality=86, method=6)
raw = b''.join(k.tobytes() for k in keyed)
common = ['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',f'{W}x{H}','-r','24','-i','-']
subprocess.run(common+['-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','34','-row-mt','1','-an',out+'.webm'],input=raw,check=True)
subprocess.run(common+['-pix_fmt','bgra','-c:v','hevc_videotoolbox','-alpha_quality','0.8','-q:v','58','-tag:v','hvc1','-an','-movflags','+faststart',out+'.mov'],input=raw,check=True)
print(len(keyed),'frames')
