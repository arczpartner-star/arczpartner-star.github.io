import sys, subprocess, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
HTML = Path('/tmp/claude-0/art2/art.html').as_uri(); OUT = Path('/tmp/claude-0/art2/out'); OUT.mkdir(exist_ok=True)
SZ = {'W': (1920, 820), 'M': (1080, 710)}
NAME = {'W': 'arcz_hero_art_1920x820', 'M': 'arcz_hero_art_mobile_1080x710'}
full = '--full' in sys.argv
with sync_playwright() as p:
    b = p.chromium.launch()
    for fmt in ('W', 'M'):
        w, h = SZ[fmt]; pg = b.new_page(viewport={'width': w, 'height': h})
        pg.goto(f'{HTML}?f={fmt}'); pg.wait_for_function('window.__ready===true'); pg.wait_for_timeout(300)
        if not full:
            for t in (1.2, 3.3, 5.6): pg.evaluate(f'render({t})'); pg.screenshot(path=str(OUT / f'check_{fmt}_{t}.png'))
            continue
        tmp = Path(tempfile.mkdtemp())
        for i in range(300): pg.evaluate(f'render({i/30})'); pg.screenshot(path=str(tmp / f'f{i:04d}.png'))
        pg.evaluate('render(1.2)'); pg.screenshot(path=str(OUT / f'{NAME[fmt]}_poster.png'))
        n = NAME[fmt]
        subprocess.run(['ffmpeg','-v','error','-y','-framerate','30','-i',str(tmp/'f%04d.png'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','22','-preset','slow','-movflags','+faststart','-an',str(OUT/f'{n}.mp4')],check=True)
        subprocess.run(['ffmpeg','-v','error','-y','-framerate','30','-i',str(tmp/'f%04d.png'),'-c:v','libvpx-vp9','-pix_fmt','yuv420p','-b:v','0','-crf','34','-row-mt','1','-an',str(OUT/f'{n}.webm')],check=True)
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(OUT/f'{n}_poster.png'),'-q:v','3',str(OUT/f'{n}_poster.jpg')],check=True)
        print('done', n)
    b.close()
