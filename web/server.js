import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { startSession } from '../utils/connector.js';

const LOGO_PATH = path.resolve('menu.jpg');

const PORT = Number(process.env.PORT || 3000);
const PAIRING_SECRET = process.env.PAIRING_SECRET || '';

const TELEGRAM_URL = 'https://t.me/druzz_dev2';
const WHATSAPP_URL = 'https://whatsapp.com/channel/0029VbCMDOSFnSzHxgIjpw06';
const SOUND_URL = 'https://files.catbox.moe/jwmgkf.mp3';

const icon = (name) => {
    const icons = {
        link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"/><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 7 20l1.15-1.15"/></svg>',
        copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8.1 8.1 0 0 0-15.5-2"/><path d="M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2"/><path d="M20 20v-5h-5"/></svg>',
        menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
        x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
        telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4L3.8 10.7c-1.2.5-1.2 1.2-.2 1.5l4.4 1.4 1.7 5.2c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.1-2 4.4 3.2c.8.4 1.4.2 1.6-.7L22 5.1c.3-1.1-.4-1.6-1-1.1z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.7 11.7 0 0 0 12.2 0C5.7 0 .5 5.2.5 11.7c0 2 .5 4 1.5 5.7L.4 23.9l6.7-1.7a11.8 11.8 0 0 0 5.1 1.2h.1c6.5 0 11.7-5.2 11.7-11.7 0-3.1-1.2-6-3.5-8.2zM12.3 21.3c-1.6 0-3.2-.4-4.6-1.2l-.3-.2-4 .9 1.1-3.9-.2-.4a9.6 9.6 0 0 1-1.4-5c0-5.3 4.3-9.6 9.6-9.6 2.6 0 5 1 6.8 2.8a9.5 9.5 0 0 1 2.8 6.8c0 5.3-4.3 9.6-9.6 9.6z"/><path d="M17.7 14.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.5-.7-2.5-1.3-3.5-2.9-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.6-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.8 0 1.6 1.2 3.2 1.4 3.4.2.2 2.3 3.6 5.6 4.9 2.1.8 2.9.8 3.9.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.2-.1-.4-.2-.7-.4z"/></svg>',
        shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v5c0 5.2-3.4 8.9-8 10-4.6-1.1-8-4.8-8-10V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
        volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11"/></svg>'
    };
    return icons[name] || '';
};

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#050810">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>KAIRO ZYNEX — Whatsapp Pairing</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#050810;--panel:#0a0f1c;--line:rgba(120,170,255,.18);--text:#e9f0ff;--muted:#5f6c88;--accent:#3f8bff;--accent2:#7fd8ff;--good:#5fe0ff;--danger:#ff5470}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;overflow-x:hidden}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:26px 14px;overscroll-behavior:none;position:relative}
body:before{content:"";position:fixed;inset:0;z-index:-2;background:
  linear-gradient(rgba(90,150,255,.06) 1px,transparent 1px) 0 0/100% 34px,
  linear-gradient(90deg,rgba(90,150,255,.06) 1px,transparent 1px) 0 0/34px 100%;
  mask-image:radial-gradient(ellipse 70% 55% at 50% 30%,#000 40%,transparent 80%)}
body:after{content:"";position:fixed;z-index:-1;width:380px;height:380px;top:-140px;left:50%;transform:translateX(-50%);background:radial-gradient(circle,rgba(63,139,255,.30),transparent 70%);filter:blur(10px)}
svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.shell{width:min(100%,460px);position:relative}
.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.5px}
.topbar .live{display:inline-flex;align-items:center;gap:7px;color:var(--good)}
.topbar .live i{width:6px;height:6px;border-radius:50%;background:var(--good);box-shadow:0 0 10px var(--good);animation:blink 1.6s ease-in-out infinite}
@keyframes blink{50%{opacity:.35}}
.icon-btn{width:34px;height:34px;border:1px solid var(--line);background:rgba(63,139,255,.06);color:#cfe0ff;border-radius:9px;display:grid;place-items:center;cursor:pointer;transition:.2s}
.icon-btn:hover{background:rgba(63,139,255,.14)}

.term{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:14px;box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 0 1px rgba(63,139,255,.05) inset;animation:rise .5s ease both;overflow:hidden}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.term-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--line);background:rgba(63,139,255,.045)}
.term-bar .dot{width:9px;height:9px;border-radius:50%}
.term-bar .dot:nth-child(1){background:#ff5f57}.term-bar .dot:nth-child(2){background:#febc2e}.term-bar .dot:nth-child(3){background:#28c840}
.term-bar .path{margin-left:8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)}
.term-body{padding:26px 24px 24px}

.brand-row{display:flex;align-items:center;gap:13px;margin-bottom:20px}
.logo{width:46px;height:46px;border-radius:11px;overflow:hidden;border:1px solid rgba(63,139,255,.4);box-shadow:0 0 22px rgba(63,139,255,.35);flex-shrink:0}
.logo img{width:100%;height:100%;object-fit:cover}
.brand-row h1{margin:0;font-size:18px;font-weight:700;letter-spacing:.5px}
.brand-row p{margin:2px 0 0;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--muted);letter-spacing:1px}

.log{font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.9;color:#8ea3c9;border-left:2px solid rgba(63,139,255,.3);padding-left:12px;margin-bottom:22px}
.log b{color:var(--accent2);font-weight:500}

h2.title{font-size:22px;line-height:1.3;font-weight:600;margin:0 0 22px;letter-spacing:-.2px}

.field label{display:block;font-family:'JetBrains Mono',monospace;color:#9fb0d1;font-size:11px;letter-spacing:1px;margin-bottom:9px}
.input-wrap{display:flex;align-items:center;background:#050810;border:1px solid var(--line);border-radius:10px;padding:0 14px;transition:.2s}
.input-wrap:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px rgba(63,139,255,.15)}
.prefix{font-family:'JetBrains Mono',monospace;color:var(--accent2);font-size:14px;margin-right:2px}
input{width:100%;height:50px;border:0;outline:0;background:transparent;color:#fff;font-size:15px;font-family:'JetBrains Mono',monospace;letter-spacing:.4px}
input::placeholder{color:#3d4763}

.primary{width:100%;height:50px;margin-top:12px;border:1px solid rgba(63,139,255,.5);border-radius:10px;background:linear-gradient(180deg,rgba(63,139,255,.22),rgba(63,139,255,.08));color:#eaf3ff;font-weight:600;font-size:13.5px;letter-spacing:.3px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;transition:.2s;font-family:'JetBrains Mono',monospace}
.primary:hover{background:linear-gradient(180deg,rgba(63,139,255,.32),rgba(63,139,255,.14));box-shadow:0 0 24px rgba(63,139,255,.25)}
.primary:active{transform:translateY(1px)}
.primary:disabled{opacity:.5;cursor:wait}

.status{min-height:18px;text-align:left;font-family:'JetBrains Mono',monospace;color:var(--muted);font-size:11.5px;margin:12px 0 0}
.status:before{content:"> "}
.status.good{color:var(--good)}.status.bad{color:var(--danger)}

.code-box{display:none;margin-top:16px;border:1px solid rgba(95,224,255,.3);background:rgba(95,224,255,.05);border-radius:10px;padding:16px}
.code-box.show{display:block;animation:pop .3s ease}
@keyframes pop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.code-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;color:#7fa3c9;text-align:center}
.code{font-family:'JetBrains Mono',monospace;font-size:28px;letter-spacing:7px;text-align:center;font-weight:700;color:var(--good);margin:9px 0 13px}
.copy{width:100%;height:40px;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.03);color:#dce6f7;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:12px}
.copy:hover{background:rgba(255,255,255,.07)}

.steps{font-family:'JetBrains Mono',monospace;font-size:11px;color:#7686a6;margin-top:24px;line-height:2.1;border-top:1px solid var(--line);padding-top:16px}
.steps span{color:var(--accent2);margin-right:8px}

.footer{text-align:center;font-family:'JetBrains Mono',monospace;color:#3d4763;font-size:10px;margin-top:16px;letter-spacing:.5px}
.footer strong{color:#6b7fa8}

.drawer{position:fixed;inset:0;background:rgba(2,4,10,.6);backdrop-filter:blur(6px);display:none;z-index:20}
.drawer.open{display:block}
.panel{position:absolute;right:0;top:0;height:100%;width:min(88vw,340px);background:#080c16;border-left:1px solid var(--line);padding:20px;transform:translateX(100%);transition:.28s ease}
.drawer.open .panel{transform:none}
.panel-head{display:flex;align-items:center;justify-content:space-between}
.panel h3{margin:0;font-size:16px;font-family:'JetBrains Mono',monospace;letter-spacing:.5px}
.panel p{color:var(--muted);font-size:12px;line-height:1.55}
.nav-link{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--line);border-radius:10px;color:#fff;text-decoration:none;margin:9px 0;background:rgba(63,139,255,.04)}
.nav-link span{font-size:13px;font-weight:600}
.nav-link small{display:block;color:#5f6c88;font-size:10px;margin-top:2px}
.sound{width:100%;height:42px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:#fff;border-radius:9px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;cursor:pointer;margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:12px}
@media(max-width:420px){.term-body{padding:20px 17px}h2.title{font-size:19px}}
</style>
</head>
<body>
<main class="shell">
<div class="topbar"><span class="live"><i></i> SYSTEM ONLINE</span><button class="icon-btn" id="menuBtn" aria-label="Open menu">${icon('menu')}</button></div>

<section class="term">
<div class="term-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="path">~/kairo-zynex/pair</span></div>
<div class="term-body">
<div class="brand-row"><div class="logo"><img src="/logo.jpg" alt="KAIRO ZYNEX"></div><div><h1>KAIRO ZYNEX</h1><p>WHATSAPP BOT · PAIRING CONSOLE</p></div></div>

<div class="log">
&gt; kairo_zynex: fullstack bot<br>
&gt; mode: <b>pairing</b><br>
&gt; status: <b>awaiting number</b><br>
&gt; ...
</div>

<h2 class="title">Link a device to run KAIRO ZYNEX on your number.</h2>

<div class="field">
<label for="number">wa_number</label>
<div class="input-wrap"><span class="prefix">+</span><input id="number" type="tel" inputmode="tel" autocomplete="tel" placeholder="509xxxxxxxx" maxlength="20"></div>
</div>

<button class="primary" id="generate">${icon('refresh')}<span>generate_code()</span></button>
<div class="status" id="status" aria-live="polite"></div>
<div class="code-box" id="codeBox"><div class="code-label">PAIRING CODE</div><div class="code" id="code">--------</div><button class="copy" id="copy">${icon('copy')}<span>copy_to_clipboard()</span></button></div>

<div class="steps">
<div><span>01</span>Generate the code above</div>
<div><span>02</span>WhatsApp → Linked devices</div>
<div><span>03</span>Link with phone number → enter code</div>
</div>
</div>
</section>

<div class="footer">Powered by <strong>KAIRO DEV</strong> — keep your pairing code private.</div>
</main>

<div class="drawer" id="drawer">
<aside class="panel">
<div class="panel-head"><h3>KAIRO_ZYNEX/menu</h3><button class="icon-btn" id="closeMenu" aria-label="Close menu">${icon('x')}</button></div>
<p>Official channels and quick instructions.</p>
<a class="nav-link" href="${TELEGRAM_URL}" target="_blank" rel="noopener noreferrer">${icon('telegram')}<div><span>Telegram</span><small>Join the developer channel</small></div></a>
<a class="nav-link" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}<div><span>WhatsApp Channel</span><small>Follow official updates</small></div></a>
<button class="sound" id="soundTest">${icon('volume')}<span>Test pairing sound</span></button>
<p style="margin-top:18px"><strong>How to link:</strong><br>Generate the code above, then open WhatsApp → Linked devices → Link a device → Link with phone number.</p>
</aside>
</div>

<audio id="pairSound" preload="auto" src="${SOUND_URL}"></audio>
<script>
const numberEl=document.getElementById('number');
const generate=document.getElementById('generate');
const statusEl=document.getElementById('status');
const codeBox=document.getElementById('codeBox');
const codeEl=document.getElementById('code');
const copy=document.getElementById('copy');
const audio=document.getElementById('pairSound');
const drawer=document.getElementById('drawer');

function cleanNumber(v){return String(v||'').replace(/[^0-9]/g,'');}
function setStatus(text,type=''){statusEl.textContent=text;statusEl.className='status '+type}
function unlockSound(){audio.play().then(()=>{audio.pause();audio.currentTime=0}).catch(()=>{});}
function playSound(){audio.currentTime=0;audio.play().catch(()=>{});}
let firstInteractionSoundPlayed=false;
function playSoundOnFirstInteraction(){
  if(firstInteractionSoundPlayed) return;
  firstInteractionSoundPlayed=true;
  playSound();
}
['pointerdown','touchstart','click','keydown'].forEach(evt=>document.addEventListener(evt,playSoundOnFirstInteraction,{once:true,passive:true}));
async function getStatus(){
  const r=await fetch('/api/status',{cache:'no-store'});
  return await r.json();
}
async function waitForCode(number){
  for(let i=0;i<35;i++){
    await new Promise(r=>setTimeout(r,1000));
    try{
      const d=await getStatus();
      if(d.number!==number) continue;
      if(d.status==='connected'){setStatus('WhatsApp is already connected on this session.','good');generate.disabled=false;generate.querySelector('span').textContent='Generate pairing code';return;}
      if(d.status==='ready' && d.code){
        codeEl.textContent=d.code;
        codeBox.classList.add('show');
        setStatus('Pairing code ready. Use it in WhatsApp.','good');
        generate.disabled=false;
        generate.querySelector('span').textContent='Generate new code';
        playSound();
        return;
      }
      if(d.status==='error'){
        setStatus(d.message||'Unable to generate the code.','bad');
        generate.disabled=false;
        generate.querySelector('span').textContent='Try again';
        return;
      }
    }catch(e){}
  }
  setStatus('The request is taking longer than expected. Tap Generate again if needed.','');
  generate.disabled=false;
  generate.querySelector('span').textContent='Generate pairing code';
}
async function pair(){
  const number=cleanNumber(numberEl.value);
  if(number.length<7||number.length>15){setStatus('Enter a valid WhatsApp number with country code.','bad');return;}
  unlockSound();
  generate.disabled=true;
  generate.querySelector('span').textContent='Generating…';
  codeBox.classList.remove('show');
  codeEl.textContent='--------';
  setStatus('Connecting securely…');
  try{
    const body={number};

    const r=await fetch('/api/pair',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok){setStatus(d.message||'Request failed.','bad');generate.disabled=false;generate.querySelector('span').textContent='Try again';return;}
    setStatus('Waiting for pairing code…');
    await waitForCode(number);
  }catch(e){
    setStatus('Connection error. Check the service and try again.','bad');
    generate.disabled=false;
    generate.querySelector('span').textContent='Try again';
  }
}
generate.addEventListener('click',pair);
copy.addEventListener('click',async()=>{
  const value=codeEl.textContent.trim();
  if(!value||value==='--------')return;
  try{await navigator.clipboard.writeText(value);copy.querySelector('span').textContent='Copied';setTimeout(()=>copy.querySelector('span').textContent='Copy code',1400)}
  catch{setStatus('Copy is unavailable. Select the code manually.','bad')}
});
numberEl.addEventListener('input',()=>{numberEl.value=numberEl.value.replace(/[^0-9+ ()-]/g,'').slice(0,20)});
document.getElementById('menuBtn').addEventListener('click',()=>drawer.classList.add('open'));
document.getElementById('closeMenu').addEventListener('click',()=>drawer.classList.remove('open'));
drawer.addEventListener('click',e=>{if(e.target===drawer)drawer.classList.remove('open')});
document.getElementById('soundTest').addEventListener('click',()=>{unlockSound();playSound()});

// Prevent browser zoom gestures where supported.
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['+','-','=','0'].includes(e.key))e.preventDefault()});
</script>
</body>
</html>`;

function json(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
    });
    res.end(JSON.stringify(data));
}

async function readBody(req) {
    let data = '';
    for await (const chunk of req) data += chunk;
    if (data.length > 5000) throw new Error('Request too large');
    return JSON.parse(data || '{}');
}

let pairing = null;

export function getPairingState() {
    return pairing;
}

export async function startPairingServer(handleMessage) {
    const server = http.createServer(async (req, res) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

            if (req.method === 'GET' && url.pathname === '/') {
                res.writeHead(200, {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-store',
                    'X-Content-Type-Options': 'nosniff'
                });
                return res.end(page);
            }

            if (req.method === 'GET' && url.pathname === '/logo.jpg') {
                try {
                    const buf = fs.readFileSync(LOGO_PATH);
                    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' });
                    return res.end(buf);
                } catch {
                    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                    return res.end('Not found');
                }
            }

            if (req.method === 'GET' && url.pathname === '/api/status') {
                return json(res, 200, pairing || { status: 'idle' });
            }

            if (req.method === 'POST' && url.pathname === '/api/pair') {
                const body = await readBody(req);
                const number = String(body.number || '').replace(/\D/g, '');
                if (number.length < 7 || number.length > 15) {
                    return json(res, 400, { message: 'Invalid phone number.' });
                }

                if (pairing?.status === 'waiting' && pairing.number === number) {
                    return json(res, 200, { message: 'Pairing request already active.', status: pairing.status, code: pairing.code });
                }
                if (pairing?.status === 'waiting' && pairing.number !== number) {
                    return json(res, 409, { message: 'Another pairing request is already active.' });
                }

                pairing = { status: 'waiting', number, code: null };

                const existing = await import('../utils/connector.js');
                if (existing.getSession(number)?.user) {
                    pairing = { status: 'connected', number, code: null, message: 'This WhatsApp session is already connected.' };
                    return json(res, 200, { message: pairing.message, status: pairing.status });
                }

                await startSession(number, handleMessage, true, (code, n, error) => {
                    if (error) pairing = { status: 'error', number: n, code: null, message: error.message };
                    else if (code) pairing = { status: 'ready', number: n, code };
                });

                return json(res, 200, { message: 'Pairing request started.', status: pairing.status, code: pairing.code });
            }

            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
        } catch (e) {
            console.error('Web server:', e);
            json(res, 500, { message: e.message });
        }
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Pairing website listening on port ${PORT}`);
    });

    return server;
}
