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
<meta name="theme-color" content="#070a0f">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>KAIRO ZYNEX— Whatsapp Pairing</title>
<style>
:root{--bg:#05070d;--panel:rgba(12,18,32,.72);--line:rgba(255,255,255,.12);--text:#f8fbff;--muted:#98a7bd;--accent:#00ffa3;--accent2:#ff3d9a;--good:#00ffa3;--danger:#ff4d6d}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-x:hidden}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:28px 16px;overscroll-behavior:none}
body:before,body:after{content:"";position:fixed;z-index:-2;border-radius:50%;filter:blur(70px);opacity:.25;animation:float 10s ease-in-out infinite}
body:before{width:300px;height:300px;background:#00ffa3;top:-90px;left:-90px}
body:after{width:320px;height:320px;background:#ff3d9a;right:-130px;bottom:-120px;animation-delay:-4s}
@keyframes float{50%{transform:translate3d(20px,30px,0) scale(1.08)}}

.badge{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.05);color:#cbd6e8;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.badge i{width:7px;height:7px;border-radius:50%;background:var(--good);box-shadow:0 0 16px var(--good)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:18px 0}
.stat{padding:13px 10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);border-radius:17px;text-align:center}
.stat strong{display:block;font-size:16px}.stat span{font-size:10px;color:var(--muted)}
.features{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:15px}
.feature{padding:12px;border-radius:16px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}
.feature b{font-size:12px}.feature small{display:block;color:var(--muted);line-height:1.4;margin-top:4px}
@media(max-width:430px){.features{grid-template-columns:1fr}.stats{gap:6px}.stat{padding:11px 5px}}
.shell{width:min(100%,520px);position:relative}
.topbar{display:flex;justify-content:flex-end;margin-bottom:12px}
.icon-btn{width:44px;height:44px;border:1px solid var(--line);background:rgba(255,255,255,.055);color:#fff;border-radius:14px;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(14px);transition:.2s}
.icon-btn:hover{background:rgba(255,255,255,.1);transform:translateY(-1px)}
svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.card{position:relative;overflow:hidden;background:var(--panel);border:1px solid var(--line);border-radius:30px;padding:30px;box-shadow:0 30px 90px rgba(0,0,0,.45);backdrop-filter:blur(22px);animation:rise .55s ease both}
@keyframes rise{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}
.card:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,255,163,.14),transparent 42%,rgba(255,61,154,.10));pointer-events:none}
.brand{position:relative;display:flex;align-items:center;gap:14px;margin-bottom:24px}
.logo{width:52px;height:52px;border-radius:17px;background:linear-gradient(135deg,#00ffa3,#ff3d9a);display:grid;place-items:center;box-shadow:0 10px 35px rgba(99,82,255,.3);font-weight:900;font-size:20px;letter-spacing:-1px}
.brand h1{font-size:21px;margin:0;font-weight:800;letter-spacing:-.4px}.brand p{margin:4px 0 0;color:var(--muted);font-size:12px}
.hero{position:relative;margin-bottom:22px}.eyebrow{font-size:11px;letter-spacing:1.7px;text-transform:uppercase;color:#aeb8c8;font-weight:800}.hero h2{font-size:34px;line-height:1.05;letter-spacing:-1.4px;margin:7px 0 10px}.hero p{color:var(--muted);font-size:14px;line-height:1.6;margin:0}
.field{position:relative;margin-top:22px}.field label{display:block;color:#cbd2dc;font-size:12px;font-weight:700;margin-bottom:8px}.input-wrap{display:flex;align-items:center;background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:16px;padding:0 14px;transition:.2s}.input-wrap:focus-within{border-color:rgba(0,255,163,.85);box-shadow:0 0 0 4px rgba(0,255,163,.12)}.prefix{color:#7f8a9b;font-size:14px;margin-right:4px}input{width:100%;height:54px;border:0;outline:0;background:transparent;color:#fff;font-size:16px;letter-spacing:.3px}input::placeholder{color:#657081}
.primary{width:100%;height:54px;margin-top:13px;border:0;border-radius:16px;background:linear-gradient(100deg,#00ffa3,#ff3d9a 55%,#a855f7);color:#fff;font-weight:800;font-size:14px;letter-spacing:.1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 12px 30px rgba(0,255,163,.25);transition:.2s}.primary:hover{transform:translateY(-1px);filter:brightness(1.06)}.primary:active{transform:translateY(1px)}.primary:disabled{opacity:.55;cursor:wait;transform:none}
.status{min-height:21px;text-align:center;color:var(--muted);font-size:12px;margin:14px 0 0}.status.good{color:var(--good)}.status.bad{color:var(--danger)}
.code-box{display:none;margin-top:16px;border:1px solid rgba(53,208,127,.22);background:rgba(53,208,127,.055);border-radius:18px;padding:15px}.code-box.show{display:block;animation:pop .3s ease}.code-label{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#8f9aaa;font-weight:800;text-align:center}.code{font-size:31px;letter-spacing:7px;text-align:center;font-weight:900;margin:8px 0 12px;font-variant-numeric:tabular-nums}.copy{width:100%;height:44px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.06);color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;cursor:pointer}.copy:hover{background:rgba(255,255,255,.1)}
@keyframes pop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.steps{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:22px}.step{border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:14px;padding:12px 8px;text-align:center}.step b{display:block;font-size:10px;color:#cfd6e0}.step span{display:block;color:#717c8d;font-size:9px;margin-top:4px}
.footer{position:relative;text-align:center;color:#687384;font-size:10px;margin-top:17px}.footer strong{color:#a5afbd}
.drawer{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(7px);display:none;z-index:20}.drawer.open{display:block}.panel{position:absolute;right:0;top:0;height:100%;width:min(88vw,360px);background:#0b0f16;border-left:1px solid var(--line);padding:22px;transform:translateX(100%);transition:.28s ease}.drawer.open .panel{transform:none}.panel-head{display:flex;align-items:center;justify-content:space-between}.panel h3{margin:0;font-size:18px}.panel p{color:var(--muted);font-size:12px;line-height:1.55}.nav-link{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--line);border-radius:15px;color:#fff;text-decoration:none;margin:9px 0;background:rgba(255,255,255,.035)}.nav-link svg{width:21px;height:21px}.nav-link span{font-size:13px;font-weight:750}.nav-link small{display:block;color:#727d8d;font-size:10px;margin-top:2px}.sound{width:100%;height:46px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:#fff;border-radius:13px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;cursor:pointer;margin-top:14px}
@media(max-width:420px){body{padding:16px 12px}.card{padding:23px 18px;border-radius:25px}.hero h2{font-size:30px}.steps{gap:6px}.step{padding:10px 5px}}
</style>
</head>
<body>
<main class="shell">
<div class="topbar"><button class="icon-btn" id="menuBtn" aria-label="Open menu">${icon('menu')}</button></div>
<section class="card">
<div class="brand"><div class="logo"><img src="/logo.jpg" alt="KAIRO ZYNEX" style="width:100%;height:100%;object-fit:cover;border-radius:17px"></div><div><h1>KAIRO ZYNEX</h1><p>Secure WhatsApp pairing</p></div></div>
<div class="hero"><div class="badge"><i></i> Multi-device • Secure pairing</div><h2>Connect your WhatsApp.</h2><p>Fast pairing, clean controls and a redesigned KAIRO ZYNEX experience. Enter your number and link this device in seconds.</p></div><div class="stats"><div class="stat"><strong>5.5.0</strong><span>BOT VERSION</span></div><div class="stat"><strong>10+</strong><span>NEW COMMANDS</span></div><div class="stat"><strong>24/7</strong><span>READY</span></div></div><div class="features"><div class="feature"><b>⚡ Faster</b><small>Stable session reconnects and command routing.</small></div><div class="feature"><b>🛡️ Safer</b><small>Input validation and private pairing-code flow.</small></div><div class="feature"><b>🎛️ Smarter</b><small>Group tools, utilities and bot diagnostics.</small></div><div class="feature"><b>✨ Modern</b><small>Responsive glass UI built for mobile first.</small></div></div>

<div class="field">
<label for="number">WhatsApp number</label>
<div class="input-wrap"><span class="prefix">+</span><input id="number" type="tel" inputmode="tel" autocomplete="tel" placeholder="509 xxx xxx" maxlength="20"></div>
</div>

<button class="primary" id="generate">${icon('refresh')}<span>Generate your code</span></button>
<div class="status" id="status" aria-live="polite"></div>
<div class="code-box" id="codeBox"><div class="code-label">Your pairing code</div><div class="code" id="code">--------</div><button class="copy" id="copy">${icon('copy')}<span>Copy code</span></button></div>

<div class="steps"><div class="step"><b>01</b><span>Generate code</span></div><div class="step"><b>02</b><span>Open Linked devices</span></div><div class="step"><b>03</b><span>Link by phone</span></div></div>
<div class="footer">Powered by <strong>KAIRO DEV</strong> · Keep your pairing code private.</div>
</section>
</main>

<div class="drawer" id="drawer">
<aside class="panel">
<div class="panel-head"><h3>KAIRO ZYNEX Menu</h3><button class="icon-btn" id="closeMenu" aria-label="Close menu">${icon('x')}</button></div>
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
