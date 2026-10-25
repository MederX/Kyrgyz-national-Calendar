// Real browser geometry/interaction audit. Node 22+ and Chromium; no extra packages.
// Start API + Vite, then: node scripts/check-responsive.cjs http://127.0.0.1:5177 /tmp/calendar-responsive.json
const { spawn } = require('node:child_process');
const { mkdtempSync, readFileSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const url = process.argv[2] || 'http://127.0.0.1:5173';
const reportPath = process.argv[3] || '/tmp/calendar-responsive.json';
const profileDir = mkdtempSync(join(tmpdir(), 'calendar-responsive-'));
const browser = spawn(process.env.CHROMIUM || '/usr/bin/chromium', [
    '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
    '--remote-debugging-port=0', `--user-data-dir=${profileDir}`, 'about:blank',
], { stdio: 'ignore' });
// CSS viewport sizes from Chromium's EmulatedDevices.ts (reviewed 2026-10-11).
const profiles = [
    ['Narrow phone', 320, 568, 2], ['Galaxy A55', 360, 800, 2.25],
    ['iPhone SE', 375, 667, 2], ['iPhone 16', 393, 852, 3, 59, 34],
    ['iPhone 16 Pro', 402, 874, 3, 62, 34], ['Pixel 9 / 10', 412, 924, 2.625, 58],
    ['Pixel 9 Pro', 427, 952, 3, 68], ['iPhone 16 Plus', 430, 932, 3, 59, 34],
    ['iPhone 16 Pro Max', 440, 956, 3, 62, 34], ['Pixel 9 Pro XL', 448, 997, 3, 66],
    ['Galaxy Tab S4', 712, 1138, 2.25], ['iPad Mini preset', 768, 1024, 2],
    ['Surface Pro 7', 912, 1368, 2], ['Surface Pro 10', 960, 1440, 2],
    ['iPad Pro 13', 1032, 1376, 2], ['Laptop 1280', 1280, 720, 1],
    ['Laptop 1366', 1366, 768, 1], ['Laptop 1440', 1440, 900, 2],
    ['Laptop 1536', 1536, 864, 1.25], ['Desktop 1920', 1920, 1080, 1], ['Pixel short window', 412, 500, 2.625, 58],
    ['Keyboard-sized window', 412, 300, 2.625],
];
for (const p of profiles.slice(0, 15)) {
    const [name, w, h, dpr, top = 0, bottom = 0] = p;
    profiles.push([`${name} landscape`, h, w, dpr, 0, bottom ? 21 : 0, name.startsWith('iPhone') ? top : 0, top]);
}
if(process.env.QUICK==='1') {
    const names=['Narrow phone','Pixel 9 / 10','iPhone 16 Pro Max','iPad Mini preset','iPad Pro 13','iPad Pro 13 landscape','Laptop 1366','Pixel short window','Keyboard-sized window','Galaxy A55 landscape'];
    for(let i=profiles.length-1;i>=0;i--)if(!names.includes(profiles[i][0]))profiles.splice(i,1);
}
const results = [];
const failures = [];
let ws, send, evaluate;
let currentInsets = {top:0,bottom:0,left:0,right:0};
function check(condition, message, context) {
    if (!condition) failures.push({ context, message });
}
async function waitFor(expression, description) {
    for (let i = 0; i < 100; i++) {
        if (await evaluate(expression)) return;
        await delay(100);
    }
    throw new Error(`Timed out: ${description}`);
}
async function frame() {
    await evaluate('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
}
async function click(selector, needle) {
    const found = await evaluate(`(() => {
        const e = [...document.querySelectorAll(${JSON.stringify(selector)})]
            .find(e => ${needle ? `e.textContent.includes(${JSON.stringify(needle)})` : 'true'});
        if (!e) return false;
        e.scrollIntoView({block:'center'}); e.focus({preventScroll:true}); window.__auditOpener=e; e.click(); return true;
    })()`);
    if (!found) throw new Error(`Missing control ${selector} ${needle || ''}`);
    await frame();
}
async function viewport(p) {
    const [name, width, height, dpr, top = 0, bottom = 0, left = 0, right = 0] = p;
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: width < 1200 });
    currentInsets={top,bottom,left,right};
    await send('Emulation.setSafeAreaInsetsOverride', { insets: currentInsets });
    await frame();
}
async function pageCheck(context) {
    const data = await evaluate(`(() => {
        const rect = e => e.getBoundingClientRect();
        const outside = [...document.querySelectorAll('#root *')].filter(e => {
            if (e.closest('[class*=bgWatermark]') || e.closest('svg') || !e.getClientRects().length) return false;
            const r = rect(e); return r.left < -1 || r.right > innerWidth + 1;
        }).map(e => ({class:String(e.className),text:e.textContent.slice(0,50)})).slice(0,8);
        const clippedLabels = [...document.querySelectorAll('[class*=lunarDay]')].filter(e => {
            const range = document.createRange(); range.selectNodeContents(e);
            const outer = rect(e);
            return [...range.getClientRects()].some(r => r.left < outer.left - 1 || r.right > outer.right + 1 || r.top < outer.top - 1 || r.bottom > outer.bottom + 1);
        }).map(e => e.textContent);
        const collisions = [...document.querySelectorAll('[class*=lunarDay]')].filter(e => {
            const date = e.parentElement.querySelector('[class*=gregorianDay]');
            return date && rect(date).bottom > rect(e).top;
        }).length;
        const markerOverflow = [...document.querySelectorAll('[class*=additionalCount], [class*=primaryMarkerWithCount]')].filter(e => {
            const r=rect(e), cell=rect(e.closest('[class*=cell]'));
            return r.left < cell.left - 1 || r.right > cell.right + 1;
        }).length;
        const grid = document.querySelector('[class*=yearGrid]');
        return {viewport:[innerWidth,innerHeight], documentWidth:document.documentElement.scrollWidth,
            outside,clippedLabels,collisions,markerOverflow,
            months:document.querySelectorAll('[class*=monthCard]').length,
            columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length};
    })()`);
    check(data.documentWidth <= data.viewport[0], 'Page horizontally overflows', context);
    check(!data.outside.length, `Elements outside viewport: ${JSON.stringify(data.outside)}`, context);
    check(!data.clippedLabels.length, `Lunar labels clipped: ${data.clippedLabels}`, context);
    check(!data.collisions, 'Lunar and Gregorian dates overlap', context);
    check(!data.markerOverflow, 'Multiple-event markers overflow day cells', context);
    check(data.months === 12, 'Year overview must retain 12 months', context);
    if (data.viewport[0] <= 760) check(data.columns === 1, 'Phone months must form one column', context);
    return data;
}
// Runs inside the page. Container bounds alone do not prove nested text is reachable.
function dialogTextMetrics() {
    const dialog=document.querySelector('dialog[open]'),body=dialog.querySelector('[data-dialog-body]');
    const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT),issues=[];
    let node,lastRange,lineCount=0;
    while(node=walker.nextNode()) {
        if(!node.textContent.trim() || node.parentElement.closest('svg'))continue;
        const range=document.createRange();range.selectNodeContents(node);
        if(!range.getClientRects().length)continue;
        lastRange=range;
        for(let index=0;index<range.getClientRects().length;index++) {
            const line=range.getClientRects()[index],viewport=body.getBoundingClientRect();
            body.scrollTop+=line.top-(viewport.top+viewport.height/2);
            const visibleLine=range.getClientRects()[index],visibleBody=body.getBoundingClientRect();
            lineCount++;
            if(visibleLine.top<visibleBody.top-1 || visibleLine.bottom>visibleBody.bottom+1) {
                issues.push({text:node.textContent.trim().slice(0,100),reason:'unreachable line'});
            }
            for(let ancestor=node.parentElement;ancestor && ancestor!==body;ancestor=ancestor.parentElement) {
                if(!/hidden|clip|auto|scroll/.test(getComputedStyle(ancestor).overflowY))continue;
                const bounds=ancestor.getBoundingClientRect();
                if(visibleLine.top<bounds.top-1 || visibleLine.bottom>bounds.bottom+1) {
                    issues.push({text:node.textContent.trim().slice(0,100),reason:'clipped inside '+ancestor.className});
                }
            }
        }
    }
    body.scrollTop=body.scrollHeight;
    return {lineCount,issues,lastText:lastRange?.toString().trim(),lastTextBottom:lastRange?.getClientRects().item(lastRange.getClientRects().length-1)?.bottom};
}
async function dialogBottomVisible() {
    return evaluate(`(() => {
        const d=document.querySelector('dialog[open]'),b=d.querySelector('[data-dialog-body]');
        return b.scrollTop>=b.scrollHeight-b.clientHeight-1 && b.getBoundingClientRect().bottom<=d.getBoundingClientRect().bottom+1;
    })()`);
}
async function dialogCheck(context) {
    await waitFor('!!document.querySelector("dialog[open]")', 'dialog open');
    const data = await evaluate(`(() => {
        const d=document.querySelector('dialog[open]'), b=d.querySelector('[data-dialog-body]');
        const r=d.getBoundingClientRect(), c=d.querySelector('[class*=closeBtn]').getBoundingClientRect();
        const i=d.querySelector('[class*=illustration]'), svg=i?.querySelector('svg');
        const outside=[...b.querySelectorAll('*')].filter(e=>{
            if(e.closest('svg'))return false;
            const x=e.getBoundingClientRect(); return x.left<r.left-1 || x.right>r.right+1;
        }).map(e=>e.className).slice(0,6);
        const text=(${dialogTextMetrics.toString()})();
        const bodyRect=b.getBoundingClientRect();
        return {rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},viewport:[innerWidth,innerHeight],
            width:b.clientWidth,scrollWidth:b.scrollWidth,scrollHeight:b.scrollHeight,height:b.clientHeight,
            scrollTop:b.scrollTop,bodyTop:bodyRect.top,bodyBottom:bodyRect.bottom,text,
            closeVisible:c.top>=r.top && c.bottom<=r.bottom, closeSize:[c.width,c.height],
            focusedInside:d.contains(document.activeElement), bodyLocked:document.body.style.overflow==='hidden',
            illustration:i?{height:i.clientHeight,svgHeight:svg.getBoundingClientRect().height}:null, outside};
    })()`);
    check(data.rect.left >= -1 && data.rect.right <= data.viewport[0]+1 && data.rect.top >= -1 && data.rect.bottom <= data.viewport[1]+1, 'Dialog exceeds viewport', context);
    check(data.rect.top>=currentInsets.top+8 && data.rect.bottom<=data.viewport[1]-currentInsets.bottom-8 && data.rect.left>=currentInsets.left+8 && data.rect.right<=data.viewport[0]-currentInsets.right-8, 'Dialog enters device safe area',context);
    check(data.scrollWidth <= data.width+1 && !data.outside.length, `Dialog horizontal overflow ${JSON.stringify(data.outside)}`, context);
    check(data.bodyTop>=data.rect.top && data.bodyBottom<=data.rect.bottom+1,'Scroll body extends outside dialog',context);
    check(!data.text.issues.length, `Nested text cannot be read: ${JSON.stringify(data.text.issues)}`,context);
    check(data.text.lastTextBottom<=data.bodyBottom+1,'Last text line cannot be reached by scrolling',context);
    check(data.closeVisible && data.closeSize.every(v=>v>=44), 'Close button clipped or too small', context);
    check(data.focusedInside && data.bodyLocked, 'Focus or page scroll escaped the modal', context);
    if(data.illustration) check(data.illustration.height >= data.illustration.svgHeight, 'Illustration collapses/clips', context);
    const exactRegression=/^ky\/dark\/(Pixel 9 \/ 10|Pixel short window|iPad Pro 13(?: landscape)?)\/(arsar|2026-02-17)$/.test(context);
    if(context==='ky/dark/Pixel short window/togool' || exactRegression) {
        await evaluate('document.querySelector("[data-dialog-body]").scrollTop=0');
        const x=(data.rect.left+data.rect.right)/2,y=data.bodyBottom-30;
        const distance=Math.min(data.bodyBottom-data.bodyTop-60,350);
        await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
        for(let swipe=0;swipe<12;swipe++) {
            if(await dialogBottomVisible())break;
            await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
            for(let n=1;n<=10;n++) {
                await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-distance*n/10}]});
                await delay(20);
            }
            await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
            await delay(200);
        }
        check(await dialogBottomVisible(),'Touch gesture cannot reach the end of the dialog',context);
        data.touchReachedBottom=await dialogBottomVisible();
        const shot=await send('Page.captureScreenshot',{format:'png'});
        writeFileSync(reportPath.replace('.json','-'+context.replaceAll(/[^a-z0-9-]/gi,'_')+'.png'),Buffer.from(shot.data,'base64'));
        await send('Emulation.setTouchEmulationEnabled',{enabled:false});
    }
    // Browser wheel scrolling, including keeping the header visible at the bottom.
    if (data.scrollHeight > data.height + 1) {
        await evaluate('document.querySelector("[data-dialog-body]").scrollTop=0');
        await send('Input.dispatchMouseEvent', {type:'mouseWheel',x:(data.rect.left+data.rect.right)/2,y:data.rect.bottom-40,deltaY:10000,deltaX:0});
        await delay(100);
        data.wheelReachedBottom=await dialogBottomVisible();
        check(data.wheelReachedBottom, 'Browser wheel cannot reach the end of the dialog', context);
    }
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
    check(await evaluate('document.querySelector("dialog").contains(document.activeElement)'), 'Tab focus escaped dialog', context);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
    await waitFor('!document.querySelector("dialog[open]")',`Escape closes dialog ${context}`);
    check(await evaluate('document.body.style.overflow!=="hidden"'), 'Page scroll not restored', context);
    check(await evaluate('document.activeElement===window.__auditOpener'),'Focus not restored to opener',context);
    return data;
}
async function menuCheck(selector,context) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    await frame();
    const before=await evaluate('scrollY');
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await frame();
    const data=await evaluate(`(() => {
        const m=document.querySelector('[role=listbox]'),r=m.getBoundingClientRect(),s=m.querySelector('[aria-selected=true]')?.getBoundingClientRect();
        const clipped=[...m.querySelectorAll('span')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
        return {rect:{top:r.top,bottom:r.bottom,left:r.left,right:r.right},viewport:[innerWidth,innerHeight],scrollY,
            selectedVisible:!!s && s.top>=r.top-1 && s.bottom<=r.bottom+1,clipped};
    })()`);
    check(data.rect.top>=-1 && data.rect.bottom<=data.viewport[1]+1 && data.rect.left>=-1 && data.rect.right<=data.viewport[0]+1, 'Menu exceeds viewport',context);
    check(data.rect.top>=currentInsets.top+10 && data.rect.bottom<=data.viewport[1]-currentInsets.bottom-10 && data.rect.left>=currentInsets.left+10 && data.rect.right<=data.viewport[0]-currentInsets.right-10, 'Menu enters device safe area',context);
    check(data.selectedVisible, 'Current option is not visible',context);
    check(!data.clipped.length, `Dropdown labels clipped: ${data.clipped}`,context);
    check(Math.abs(data.scrollY-before)<1,'Opening a menu moves the page',context);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
    await frame();
    return data;
}
async function main() {
    let targets;
    for (let i=0;i<60;i++) {
        try { targets=await (await fetch(`http://127.0.0.1:${readFileSync(join(profileDir,'DevToolsActivePort'),'utf8').split('\n')[0]}/json/list`)).json(); if(targets.length)break; } catch {}
        await delay(100);
    }
    if(!targets?.length)throw new Error('Chromium debugging endpoint unavailable');
    ws=new WebSocket(targets[0].webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
    let nextId=0;const pending=new Map();
    ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.id && pending.has(d.id)){pending.get(d.id)(d);pending.delete(d.id);}};
    send=async(method,params={})=>{
        const d=await new Promise(resolve=>{const id=++nextId;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}));});
        if(d.error)throw new Error(`${method}: ${d.error.message}`);return d.result;
    };
    evaluate=async(expression)=>{
        const d=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
        if(d.exceptionDetails)throw new Error(d.exceptionDetails.text+' '+d.exceptionDetails.exception?.description);
        return d.result.value;
    };
    await send('Page.enable');await send('Runtime.enable');
    await send('Page.navigate',{url});
    await waitFor('document.querySelectorAll("[class*=lunarDay]").length>20','calendar API data');
    await evaluate('document.fonts.ready.then(()=>true)');
    // The reported three-event date is a fixed regression, independent of today's year.
    if(!await evaluate('document.querySelector("[class*=yearButton]").textContent.includes("2026")')) {
        await click('[class*=yearButton]');
        const selected=await evaluate(`(() => {
            const option=[...document.querySelectorAll('[role=option]')].find(e=>e.textContent.trim()==='2026');
            if(!option)return false;option.click();return true;
        })()`);
        if(!selected)throw new Error('2026 is unavailable for the February 17 regression');
        await waitFor('document.querySelector("[class*=yearButton]").textContent.includes("2026") && document.querySelectorAll("[class*=lunarDay]").length>20','2026 calendar data');
    }
    // Include all active breakpoints and grid transitions ±1 px, plus a 16 px sweep.
    const widths=new Set([320,350,360,375,380,381,393,402,412,427,430,440,448,520,521,599,600,601,639,640,641,759,760,761,767,768,819,820,821,870,871,872,1024,1251,1252,1253,1345,1346,1347,1440,1920]);
    for(let w=320;w<=1920;w+=16) widths.add(w);
    for(const w of [901,902,903,1313,1314,1315,1361])widths.add(w);
    if(process.env.QUICK==='1') {for(const w of widths)if(![320,380,381,393,412,440,520,521,600,601,760,761,768,820,821,1024,1280,1366,1440,1920].includes(w))widths.delete(w);}
    for(const language of ['ky','ru']) {
        if(language==='ru')await click('[class*=langToggle]');
        for(const theme of ['dark','light']) {
            await evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
            for(const width of [...widths].sort((a,b)=>a-b)) {
                await viewport(['sweep',width,800,1]);
                const context=`${language}/${theme}/sweep/${width}`;
                results.push({context,page:await pageCheck(context)});
            }
            for(const p of profiles) {
                await viewport(p);
                const context=`${language}/${theme}/${p[0]}`;
                const row={context,profile:p,page:await pageCheck(context),dialogs:{}};
                for(const [name,needle] of [['togool','Тогол'],['arsar','Арсар ай'],['muchol','Мүчөл']]) {
                    await click('[class*=clickable]',needle);
                    row.dialogs[name]=await dialogCheck(`${context}/${name}`);
                }
                await click('[class*=locationRow]');
                row.dialogs.location=await dialogCheck(`${context}/location`);
                // Include the exact reported date as well as generic event samples.
                const candidates=await evaluate(`(() => {
                    const cells=[...document.querySelectorAll('[aria-label^="Open day details"]')];
                    const february=document.querySelectorAll('[class*=monthCard]')[1];
                    return [cells.findIndex(e=>e.querySelector('[class*=additionalCount]')),cells.findIndex(e=>e.querySelector('[class*=primaryMarker]')?.style.color.includes('--color-new-moon')),
                        cells.findIndex(e=>february.contains(e) && e.getAttribute('aria-label')==='Open day details for day 17')];
                })()`);
                for(const [kind,index] of [['multiple',candidates[0]],['new_moon',candidates[1]],['2026-02-17',candidates[2]]]) {
                    if(index<0)throw new Error(`No event sample: ${kind}`);
                    await evaluate(`(() => {const e=document.querySelectorAll('[aria-label^="Open day details"]')[${index}];e.scrollIntoView({block:'center'});e.focus({preventScroll:true});window.__auditOpener=e;e.click();})()`);
                    await frame();
                    if(kind==='2026-02-17')check(await evaluate('document.querySelector("dialog[open]").textContent.includes("'+(language==='ky'?'Мүчөл башы':'Начало года')+'")'),'February 17 is missing the Muchol event',context);
                    row.dialogs[kind]=await dialogCheck(`${context}/${kind}`);
                }
                row.yearMenu=await menuCheck('[class*=yearButton]',`${context}/yearMenu`);
                row.monthMenu=await menuCheck('[class*=monthSelectButton]',`${context}/monthMenu`);
                results.push(row);
            }
            writeFileSync(reportPath,JSON.stringify({profiles,widths:[...widths],results,failures},null,2));
            console.log(`${language}/${theme}: ${widths.size} widths + ${profiles.length} full profiles checked; ${failures.length} issues`);
        }
    }
    // Resize a dialog while it is open; ensure its content and scroll position remain usable.
    for(const [selector,needle,name] of [
        ['[class*=clickable]','Тогол','togool'],['[class*=clickable]','Арсар ай','arsar'],
        ['[class*=clickable]','Мүчөл','muchol'],['[class*=locationRow]',null,'location'],
    ]) {
        await viewport(['initial',412,924,2.625]);
        await click(selector,needle);
        for(const [w,h] of [[320,568],[924,412],[768,1024],[412,300]]) {
            await viewport(['resized',w,h,1]);
            const data=await evaluate(`(() => {
                const d=document.querySelector('dialog[open]'),b=d.querySelector('[data-dialog-body]'),r=d.getBoundingClientRect();
                const text=(${dialogTextMetrics.toString()})();
                return {text:d.textContent,fit:r.top>=0 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth,
                    lastVisible:!text.issues.length && text.lastTextBottom<=b.getBoundingClientRect().bottom+1 && b.getBoundingClientRect().bottom<=r.bottom+1};
            })()`);
            check(data.fit && data.lastVisible, 'Open dialog does not adapt when resized',`resize/${name}/${w}x${h}`);
            results.push({context:`resize/${name}/${w}x${h}`,data});
        }
        await click('dialog [class*=closeBtn]');
        check(await evaluate('!document.querySelector("dialog[open]")'),'Close button does not close dialog',`resize/${name}`);
    }
    // Inspect every returned lunar month, including long names and Arsar if present.
    for(const language of ['ru','ky']) {
        if(language==='ky')await click('[class*=langToggle]');
        for(const w of [320,412,768,1280]) {
            await viewport(['all lunar months',w,800,1]);
            await click('[class*=monthSelectButton]');
            const count=await evaluate('document.querySelectorAll("[role=option]").length');
            await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
            for(let index=0;index<count;index++) {
                await click('[class*=monthSelectButton]');
                await evaluate(`document.querySelectorAll('[role=option]')[${index}].click()`);
                await frame();
                const context=`allMonths/${language}/${w}/${index}`;
                results.push({context,page:await pageCheck(context)});
            }
        }
    }
    writeFileSync(reportPath,JSON.stringify({url,generatedAt:new Date().toISOString(),browser:await send('Browser.getVersion'),profiles,widths:[...widths].sort((a,b)=>a-b),results,failures},null,2));
    console.log(`Report: ${reportPath}; ${results.length} scenarios; ${failures.length} failures`);
    if(failures.length){console.log(JSON.stringify(failures.slice(0,15),null,2));process.exitCode=1;}
}
main().catch(e=>{console.error(e);writeFileSync(reportPath,JSON.stringify({results,failures,error:e.message},null,2));process.exitCode=1;}).finally(async()=>{
    ws?.close();browser.kill('SIGTERM');await delay(300);rmSync(profileDir,{recursive:true,force:true});
});
