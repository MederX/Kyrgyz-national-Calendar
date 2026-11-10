// Node 24 + Chromium. Start FastAPI and `npm run dev:mobile` first.
// Real API requests are retained; only the browser clock is fixed to a regression date.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const url = process.argv[2] || 'http://127.0.0.1:5178';
const reportPath = process.argv[3] || '/tmp/calendar-mobile-audit.json';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'calendar-mobile-browser-'));
const browser = spawn(process.env.CHROMIUM || '/usr/bin/chromium', ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=0', `--user-data-dir=${directory}`, 'about:blank'], { stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [], errors = [], screenshots = [];
let ws, send, evaluate;
let fault = 'unavailable';
function check(condition, message) { if (!condition) throw Error(message); }
async function frame() { await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))'); }
async function waitFor(expression, label) {
    for (let i = 0; i < 450; i++) { if (await evaluate(`Boolean(${expression})`)) return; await delay(100); }
    throw Error(`Timed out: ${label}; ${await evaluate('document.body.innerText.slice(-900)')}`);
}
async function click(selector, text) {
    const found = await evaluate(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>${text ? `e.textContent.includes(${JSON.stringify(text)})` : 'true'});if(!e)return false;e.scrollIntoView({block:'nearest'});e.focus({preventScroll:true});e.click();return true})()`);
    check(found, `Missing control: ${selector} ${text || ''}`); await frame();
}
async function screenshot(name) {
    await delay(300);
    const filename = path.join(path.dirname(reportPath), `calendar-mobile-${name}.png`);
    fs.writeFileSync(filename, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    screenshots.push(filename);
}
async function layout(context) {
    const data = await evaluate(`(()=>{
        const app=document.querySelector('[data-mobile-app]'), header=app.querySelector('header'), nav=app.querySelector('nav'), main=app.querySelector('main');
        const r=e=>e.getBoundingClientRect();const h=r(header),n=r(nav),m=r(main);
        const outside=[...app.querySelectorAll('*')].filter(e=>{if(e.closest('svg')||e.closest('[class*=watermark]')||!e.getClientRects().length)return false;const b=r(e);return b.left<-.5||b.right>innerWidth+.5}).map(e=>String(e.className)).slice(0,5);
        const title=header.querySelector('[class*=brandTitle]'),range=document.createRange();range.selectNodeContents(title);const b=r(title);
        const titleClipped=[...range.getClientRects()].some(t=>t.left<b.left-1||t.right>b.right+1||t.bottom>b.bottom+1);
        const tablet=innerWidth>=768&&innerHeight>=600,screen=app.querySelector('[data-screen]')?.dataset.screen;
        let pair=screen==='today'?[app.querySelector('[class*=todaySummary]'),app.querySelector('[class*=todayEvents]')]:screen==='guide'?[app.querySelector('[class*=guideTerms]'),app.querySelector('footer')]:screen==='calendar'&&innerWidth>=960?[app.querySelector('[class*=monthPanel]'),app.querySelector('[class*=selectedDayPanel]')]:[];
        const panelsSeparated=!tablet||!pair.length||pair.every(Boolean)&&r(pair[0]).right<=r(pair[1]).left+1;
        return{width:innerWidth,height:innerHeight,tablet,appWidth:r(app).width,panelsSeparated,documentWidth:document.documentElement.scrollWidth,outside,titleClipped,mainHeight:m.height,navVisible:n.top>=h.bottom-1&&n.bottom<=innerHeight+1,scrollWidth:main.scrollWidth,clientWidth:main.clientWidth};
    })()`);
    check(data.documentWidth <= data.width && !data.outside.length && !data.titleClipped && data.navVisible && data.mainHeight > 0 && data.scrollWidth <= data.clientWidth, `${context}: ${JSON.stringify(data)}`);
    check(!data.tablet||(data.appWidth>=Math.min(data.width,1360)-1&&data.panelsSeparated), `${context}: tablet layout still behaves like a narrow phone: ${JSON.stringify(data)}`);
    results.push({ context, ...data });
}
async function closeDialog() { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await frame(); check(await evaluate('!document.querySelector("dialog[open]")'), 'Escape did not close the dialog'); }
async function selectedEventDetails(type, context) {
    const detail = await evaluate(`(()=>{const d=document.querySelector('dialog[open]');return{types:[...d.querySelectorAll('[data-event-type]')].map(e=>e.dataset.eventType),aiBashy:!!d.querySelector('[class*=aiBashyNote]')}})()`);
    check(detail.types.length === 1 && detail.types[0] === type, `${context}: unrelated events in popup: ${JSON.stringify(detail)}`);
    check(!detail.aiBashy, `${context}: Ramadan start must have its own popup, not a folded note`);
    results.push({ context, selectedEvent: type, ...detail });
}
async function lunarShortcut(context) {
    const expected = await evaluate(`({month:document.querySelector('[class*=lunarCard] [class*=eyebrow]').textContent,day:document.querySelector('[class*=lunarDay]').textContent})`);
    await click('[class*=lunarCard]');
    await waitFor('document.querySelector("[data-screen=calendar]")', 'lunar shortcut calendar');
    const actual = await evaluate(`(()=>{const day=document.querySelector('[data-date="2026-02-17"]');return{mode:document.querySelectorAll('[class*=segment] button')[1].getAttribute('aria-pressed'),month:document.querySelector('[class*=monthHeading] h2').textContent,day:day?.querySelector('span').textContent,selected:day?.getAttribute('aria-pressed'),year:document.querySelector('[class*=yearButton]').textContent}})()`);
    check(actual.mode==='true'&&actual.month===expected.month&&actual.day===expected.day&&actual.selected==='true'&&actual.year.includes('2026'), `${context}: wrong lunar destination ${JSON.stringify({expected,actual})}`);
    results.push({ context, lunarShortcut: actual });
}
async function moonPhases() {
    await click('[data-nav=today]');
    for (const [date, day, fraction, side] of [
        ['2026-02-17T12:01:00Z','17',0.000066,-1],
        ['2026-02-24T12:00:00Z','24',0.499057,1],
        ['2026-03-03T12:00:00Z','3',0.999986,-1],
        ['2026-03-11T12:00:00Z','11',0.492055,-1],
    ]) {
        await evaluate(`window.__auditNow=${JSON.stringify(date)};window.dispatchEvent(new Event('focus'))`);
        await waitFor(`document.querySelector('[class*=dayNumber]')?.textContent===${JSON.stringify(day)}&&document.querySelector('[data-moon-phase]')`, 'updated lunar phase');
        const moon = await evaluate(`(()=>{const e=document.querySelector('[data-moon-phase]'),r=e.getBoundingClientRect();return{fraction:Number(e.dataset.moonIllumination),side:Number(e.dataset.litSide),label:e.getAttribute('aria-label'),size:[r.width,r.height],path:e.querySelector('[data-moon-lit]')?.getAttribute('d')}})()`);
        check(Math.abs(moon.fraction-fraction)<0.001&&moon.side===side&&moon.label&&moon.path&&moon.size.every(n=>n>=40), `Wrong current moon appearance at ${date}: ${JSON.stringify(moon)}`);
        results.push({ context: `moon-phase/${date}`, ...moon });
    }
    await evaluate(`window.__auditNow='2026-02-17T12:00:00Z';window.dispatchEvent(new Event('focus'))`);
    await waitFor('document.querySelector("[class*=dayNumber]")?.textContent==="17"', 'restored audit clock');
}
async function calendarTargets(context) {
    const sizes = await evaluate('Array.from(document.querySelectorAll("[data-screen=calendar] [data-date]")).map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})');
    check(sizes.length && sizes.every(([width,height])=>width>=43.8&&height>=43.8),`${context}: date targets below 44 px: ${JSON.stringify(sizes.filter(([w,h])=>w<43.8||h<43.8).slice(0,3))}`);
    const headings = await evaluate(`(()=>{const app=document.querySelector('[data-mobile-app]'),probe=document.createElement('span');probe.style.fontSize='var(--month-heading-size)';app.append(probe);const expected=getComputedStyle(probe).fontSize;probe.remove();return Array.from(document.querySelectorAll('[class*=monthHeading] h2,[data-year-overview] h2 button')).map(e=>({size:getComputedStyle(e).fontSize,expected,family:getComputedStyle(e).fontFamily,parentFamily:getComputedStyle(e.parentElement).fontFamily}))})()`);
    check(headings.length && headings.every(h=>h.size===h.expected&&(context!=='year'||h.family===h.parentFamily)), `${context}: month headings lost their typography: ${JSON.stringify(headings)}`);
    const yearLayout = await evaluate(`(()=>{const y=document.querySelector('[data-year-overview]');return y&&innerWidth>=768&&innerHeight>=600?{columns:getComputedStyle(y).gridTemplateColumns.split(' ').length,expected:innerWidth>=1200?3:2,months:y.children.length}:null})()`);
    check(!yearLayout||(yearLayout.columns===yearLayout.expected&&yearLayout.months===12), `${context}: incorrect tablet year overview: ${JSON.stringify(yearLayout)}`);
}
async function lunarCellBounds(context) {
    const data = await evaluate(`(()=>{
        const grid=document.querySelector('[data-calendar-grid]'),gr=grid.getBoundingClientRect();
        const cells=[...grid.querySelectorAll('[data-date]')].map(e=>({e,r:e.getBoundingClientRect()}));
        const overlaps=[],textOutside=[],outsideGrid=[];
        for(let i=0;i<cells.length;i++){
            const {e,r:a}=cells[i];
            if(a.left<gr.left-.5||a.right>gr.right+.5)outsideGrid.push(e.dataset.date);
            for(let j=i+1;j<cells.length;j++){
                const b=cells[j].r;
                if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5)overlaps.push([e.dataset.date,cells[j].e.dataset.date]);
            }
            for(const child of [e.firstElementChild,e.querySelector('small')].filter(Boolean)){
                const range=document.createRange();range.selectNodeContents(child);
                if([...range.getClientRects()].some(b=>b.left<a.left-.5||b.right>a.right+.5||b.top<a.top-.5||b.bottom>a.bottom+.5))textOutside.push({date:e.dataset.date,text:child.textContent});
            }
        }
        return{cells:cells.length,overlaps:overlaps.slice(0,5),textOutside,outsideGrid};
    })()`);
    check(data.cells>=29&&!data.overlaps.length&&!data.textOutside.length&&!data.outsideGrid.length, `${context}: lunar cells overlap or text escapes: ${JSON.stringify(data)}`);
    results.push({context,lunarGrid:data});
}
async function dialog(context) {
    const data = await evaluate(`(()=>{const d=document.querySelector('dialog[open]'),b=d.querySelector('[data-dialog-body]'),c=d.querySelector('button');b.scrollTop=b.scrollHeight;const r=d.getBoundingClientRect(),br=b.getBoundingClientRect(),cr=c.getBoundingClientRect();const walker=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);let node,last=null;while(node=walker.nextNode())if(node.textContent.trim()){const range=document.createRange();range.selectNodeContents(node);const lines=[...range.getClientRects()];if(lines.length)last=lines.at(-1)}return{fit:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1,closeVisible:cr.top>=r.top&&cr.bottom<=r.bottom,closeSize:[cr.width,cr.height],lastVisible:!last||last.bottom<=br.bottom+1,scrollHeight:b.scrollHeight,height:b.clientHeight,bodyLocked:document.body.style.overflow==='hidden'}})()`);
    check(data.fit && data.closeVisible && data.lastVisible && data.bodyLocked && data.closeSize.every(n => n >= 44), `${context}: ${JSON.stringify(data)}`);
    results.push({ context, dialog: data });
}
async function selectYear(year) {
    await click('[class*=yearButton]');
    await evaluate(`(()=>{const e=[...document.querySelectorAll('[role=option]')].find(e=>e.textContent.trim().startsWith('${year}'));if(!e)throw Error('Missing year');e.click()})()`);
    await waitFor('document.querySelector("[data-screen=calendar]")','calendar year data');
}
async function main() {
    let port;
    for (let i = 0; i < 100; i++) { try { port = Number(fs.readFileSync(path.join(directory, 'DevToolsActivePort'), 'utf8').split('\n')[0]); break; } catch {} await delay(100); }
    check(port, 'Chromium did not start');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    const pending = new Map(); let id = 0;
    ws.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
        if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
        if (data.method === 'Fetch.requestPaused') {
            const year=JSON.parse(data.params.request.postData).year;
            void send('Fetch.fulfillRequest', { requestId: data.params.requestId, responseCode: fault==='malformed'?200:503, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(fault==='malformed'?JSON.stringify({year,events:[null],periods:[],lunar_months:[]}):'{"detail":"audit failure"}').toString('base64') });
        }
    };
    send = async (method, params = {}) => { const data = await new Promise(resolve => { const next = ++id; pending.set(next, resolve); ws.send(JSON.stringify({ id: next, method, params })); }); if (data.error) throw Error(`${method}: ${data.error.message}`); return data.result; };
    evaluate = async expression => { const data = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (data.exceptionDetails) throw Error(data.exceptionDetails.exception?.description || data.exceptionDetails.text); return data.result.value; };
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{window.__auditNow='2026-02-17T12:00:00Z';const ActualDate=Date;class AuditDate extends ActualDate{constructor(...args){super(...(args.length?args:[window.__auditNow]))}static now(){return new ActualDate(window.__auditNow).getTime()}}window.Date=AuditDate})()` });
    await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url });
    await waitFor('document.querySelector("[data-screen=today]")','live calendar data');
    await evaluate('document.fonts.ready');
    check(await evaluate('document.documentElement.lang==="ky"'), 'Default language should be Kyrgyz');
    check(await evaluate('document.querySelector("[class*=locationButton]").textContent==="Бишкек · GMT+6"'), 'Location is missing its timezone');
    check(await evaluate('document.querySelector("[class*=dayNumber]").textContent==="17"'), 'Today does not use the current date');
    check(await evaluate('document.querySelector("[class*=weekday]").textContent==="Шейшемби"'),'Kyrgyz weekday fell back to another language');
    check(await evaluate('document.querySelectorAll("[data-event]").length===3'), 'Three events must have three independent cards');
    await layout('ky/light/today'); await screenshot('today-ky');
    await click('[data-language]');
    check(await evaluate('document.querySelector("[class*=brandTitle]").textContent==="Кыргызский национальный календарь"'),'Website title changed');
    await click('[data-event=nooruz]'); await dialog('ru/event/17-Feb');
    await selectedEventDetails('nooruz', 'ru/today/muchol-only');
    // Exercise the real shared store while the native dialog blocks background buttons.
    await evaluate(`import('/src/features/calendar/store/calendarStore.ts').then(m=>m.useCalendarStore.getState().setLanguage('ky'))`); await frame();
    check(await evaluate('document.querySelector("dialog[open]").textContent.includes("Мүчөл башы")'),'Open sheet did not change language');
    await closeDialog(); await click('[data-language]');
    for (const type of ['new_moon', 'ai_bashi']) {
        await click(`[data-event=${type}]`); await selectedEventDetails(type, `ru/today/${type}-only`); await closeDialog();
    }
    await click('[data-nav=calendar]'); await waitFor('document.querySelector("[data-screen=calendar]")','calendar screen');
    check(await evaluate('document.querySelector("[data-animal-year]").textContent==="Год лошади"'), 'Calendar is missing the selected animal year');
    await click('[data-date="2026-02-03"]');
    check(await evaluate('!!document.querySelector("[data-empty-day]")'),'An empty day cannot be selected');
    await selectYear(2025);
    check(await evaluate('document.querySelector("[data-animal-year]").textContent==="Год змеи"'), 'Animal year did not follow the selected year');
    await click('[data-nav=today]');
    check(await evaluate('document.querySelector("[class*=dateMonth]").textContent.includes("2026")'),'Calendar browsing changed Today');
    await click('[data-nav=calendar]');
    check(await evaluate('document.querySelector("[class*=yearButton]").textContent.includes("2025")'),'Calendar selection was lost');
    await selectYear(2026);
    await click('[data-nav=today]'); await lunarShortcut('ru/shortcut-after-browsing-another-year');
    await click('[class*=segment] button','Солнечный календарь');
    await click('button[aria-label="Годовой обзор"]');
    check(await evaluate('document.querySelectorAll("[data-year-overview]>section").length===12'),'Annual overview lost months');
    await click('button[aria-label="Просмотр месяца"]');
    await click('[class*=segment] button','Лунный календарь');
    check(await evaluate('document.querySelectorAll("[data-calendar-grid] [data-date]").length>=29'),'Lunar grid missing days');
    await click('[class*=segment] button','Солнечный календарь');
    await click('[data-date="2026-02-17"]'); await screenshot('calendar-ru');
    check(await evaluate('document.querySelectorAll("[data-event]").length===3'), 'February 17 must show three event cards in Calendar');
    for (const type of ['nooruz', 'new_moon', 'ai_bashi']) {
        await click(`[data-event=${type}]`); await selectedEventDetails(type, `ru/calendar/17-Feb/${type}`); await closeDialog();
    }
    for (let month = 0; month < 9; month++) await click('[class*=monthHeading] button:last-child');
    await click('[data-date="2026-11-24"]');
    check(await evaluate('document.querySelectorAll("[data-event]").length===2'), 'November 24 must show two independent event cards');
    for (const type of ['togool', 'full_moon']) {
        await click(`[data-event=${type}]`); await selectedEventDetails(type, `ru/calendar/24-Nov/${type}`); await closeDialog();
        check(await evaluate(`document.querySelector('[data-date="2026-11-24"]').getAttribute('aria-pressed')==='true'`), 'Closing event details changed selected date');
    }
    for (let month = 0; month < 9; month++) await click('[class*=monthHeading] button:first-child');
    await click('[data-date="2026-02-17"]');
    await click('[data-nav=guide]'); await click('[data-info=arsar]'); await dialog('ru/arsar'); await screenshot('arsar-ru'); await closeDialog();
    for (const language of ['ru','ky']) {
        if (await evaluate('document.documentElement.lang') !== language) await click('[data-language]');
        for (const theme of ['light','dark']) {
            if (await evaluate('document.documentElement.dataset.theme') !== theme) await click('[data-theme-toggle]');
            for (const [width,height] of [[320,568],[350,720],[360,800],[393,852],[768,1024],[1024,768],[844,390],[412,500],[744,1133],[1133,744],[834,1194],[900,1200],[960,1280],[1024,1366],[1032,1376],[1200,800],[1376,1032]]) {
                await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true}); await frame();
                for (const tab of ['today','calendar','guide']) { await click(`[data-nav=${tab}]`); await waitFor(`document.querySelector('[data-screen=${tab}]')`,'screen'); await layout(`${language}/${theme}/${width}x${height}/${tab}`); if(tab==='calendar'){await calendarTargets('month');await click(`button[aria-label=${JSON.stringify(language==='ky'?'Жылдык көрүнүш':'Годовой обзор')}]`);await calendarTargets('year');await click(`button[aria-label=${JSON.stringify(language==='ky'?'Айлык көрүнүш':'Просмотр месяца')}]`);} }
                await click('[data-nav=calendar]');await click('[class*=segment] button:last-child');
                await calendarTargets('lunar');await lunarCellBounds(`${language}/${theme}/${width}x${height}/lunar`);
                await click('[class*=segment] button:first-child');await click('[data-nav=guide]');
                for (const kind of ['muchol','arsar','togool']) { await click(`[data-info=${kind}]`); await dialog(`${language}/${theme}/${width}x${height}/${kind}`); await closeDialog(); }
            }
            await click('[data-nav=today]');
            await lunarShortcut(`${language}/${theme}/today-to-lunar`);
            await click('[data-nav=today]');
            const upcomingDate = await evaluate('document.querySelector("[class*=upcomingButton] time").dateTime');
            await click('[class*=upcomingButton]'); await waitFor('document.querySelector("[data-screen=calendar]")','upcoming date');
            check(await evaluate(`document.querySelectorAll('[class*=segment] button')[0].getAttribute('aria-pressed')==='true'&&document.querySelector('[data-date="${upcomingDate}"]').getAttribute('aria-pressed')==='true'`), 'Upcoming event must keep its solar-calendar destination');
            await click('[data-nav=today]'); await lunarShortcut(`${language}/${theme}/return-to-current-lunar-day`);
            await click('[class*=segment] button',language==='ky'?'Күн календары':'Солнечный календарь');
            await click('[data-nav=today]');
            for (const type of ['nooruz', 'new_moon', 'ai_bashi']) {
                await click(`[data-event=${type}]`); await selectedEventDetails(type, `${language}/${theme}/today/${type}-only`); await closeDialog();
            }
            console.log(`${language}/${theme}: layouts, navigation and full explanation scrolling passed`);
        }
    }
    await send('Emulation.setDeviceMetricsOverride',{width:393,height:852,deviceScaleFactor:1,mobile:true});
    if(await evaluate('document.documentElement.lang')!=='ru')await click('[data-language]');
    if(await evaluate('document.documentElement.dataset.theme')!=='dark')await click('[data-theme-toggle]');
    await click('[data-nav=today]');await screenshot('today-dark');
    await evaluate('window.__auditBeforeReload=true');await send('Page.reload');await waitFor('!window.__auditBeforeReload && document.querySelector("[data-screen=today]")','reopened app');
    check(await evaluate('document.documentElement.lang==="ru"&&document.documentElement.dataset.theme==="dark"'),'Preferences were not restored');
    await click('[data-nav=calendar]');await waitFor('document.querySelector("[data-screen=calendar]")','calendar');
    await send('Fetch.enable',{patterns:[{urlPattern:'*/api/calendar/events',requestStage:'Request'}]});
    await click('[class*=yearButton]');await evaluate(`document.querySelectorAll('[role=option]')[124].click()`);
    await waitFor('document.querySelector("[role=alert]")','API failure state');
    check(await evaluate('!document.querySelector("[data-empty-day]")'),'Failed request was presented as an empty day');
    await send('Fetch.disable');await click('[class*=retryButton]');await waitFor('document.querySelector("[data-screen=calendar]")','retry succeeds');
    fault='malformed';await send('Fetch.enable',{patterns:[{urlPattern:'*/api/calendar/events',requestStage:'Request'}]});
    await click('[class*=yearButton]');await evaluate(`document.querySelectorAll('[role=option]')[123].click()`);
    await waitFor('document.querySelector("[role=alert]")','malformed API response state');
    check(await evaluate('!document.querySelector("[data-empty-day]")'),'Malformed data was presented as an empty day');
    await send('Fetch.disable');await click('[class*=retryButton]');await waitFor('document.querySelector("[data-screen=calendar]")','malformed response retry succeeds');
    await moonPhases();
    check(!errors.length,`Runtime errors: ${errors.join('\n')}`);
    const report={url,generatedAt:new Date().toISOString(),browser:await send('Browser.getVersion'),scenarios:results.length,results,screenshots,errors,limits:['Browser uses a controlled date with real API data.','Android device gestures, GPS permission prompts and hardware back require native testing.']};
    fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
    console.log(`PASS: ${results.length} layout/dialog scenarios, live API, date navigation, empty days, persistence, retry. Report: ${reportPath}`);
}
main().catch(error=>{console.error(error);fs.writeFileSync(reportPath,JSON.stringify({error:error.message,results,errors,screenshots},null,2));process.exitCode=1;}).finally(async()=>{ws?.close();browser.kill('SIGTERM');await delay(300);fs.rmSync(directory,{recursive:true,force:true});});
