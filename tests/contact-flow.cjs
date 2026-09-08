// Exercise routing and keyboard behavior without a browser or network request.
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
class Element {
  constructor(value = '') {
    this.value = value; this.textContent = ''; this.hidden = false;
    this.style = { setProperty() {} }; this.dataset = {}; this.handlers = {}; this.attrs = {};
    this.children = {}; this.classes = new Set();
    this.classList = { add: c => this.classes.add(c), remove: c => this.classes.delete(c), contains: c => this.classes.has(c), toggle: (c, on = !this.classes.has(c)) => {on ? this.classes.add(c) : this.classes.delete(c); return on;} };
  }
  querySelector(s) { return this.children[s] || null; }
  querySelectorAll(s) { return this.children[s] || []; }
  setAttribute(k,v) { this.attrs[k] = v; }
  removeAttribute(k) { delete this.attrs[k]; }
  remove() { this.removed = true; }
  set innerHTML(value) { this.html = value; this.children = {}; }
  get innerHTML() { return this.html || ''; }
  addEventListener(k,f) { this.handlers[k] = f; }
  scrollIntoView() { this.scrollCount = (this.scrollCount || 0) + 1; }
  focus() { this.focused = true; }
  fire(type) { return this.handlers[type]?.({ preventDefault() {} }); }
}
function setup(service, calendar = true, language = 'hu') {
  const form = new Element(), select = new Element();
  Object.defineProperty(select, 'selectedOptions', {get: () => [{textContent: select.value}]});
  form.reportValidity = () => true;
  for(const [id, val] of Object.entries({fname:'Árvíz',lname:'Tűrő',email:'test@example.test',phone:'',message:'Erősödnék. & Kérdés?\nMásodik sor.'})) form.children['#'+id] = new Element(val);
  form.children['#service'] = select;
  const packageSelect = new Element();
  const packageLabels = {basic:'Basic – 29 900 Ft / hó',plus:'Plus – 39 900 Ft / hó',premium:'Premium – 49 900 Ft / hó'};
  Object.defineProperty(packageSelect, 'selectedOptions', {get: () => [{textContent: packageLabels[packageSelect.value] || ''}]});
  form.children['#online-package'] = packageSelect;
  form.children['#online-package-group'] = new Element();
  form.children['#route-note'] = new Element(); form.children['#route-submit'] = new Element();
  const nodes = {'.js-contact-form':form};
  const burger = new Element(), menu = new Element(), main = new Element(), footer = new Element();
  const menuLinks = [new Element(), new Element(), new Element()];
  menu.querySelectorAll = () => menuLinks; menu.querySelector = () => menuLinks[0];
  nodes['.hamburger'] = burger; nodes['.mobile-menu'] = menu;
  for(const selector of ['.calendly-section','.inquiry-section','#calendly-embed','#calendly-config-notice','#calendly-loading','#calendly-direct-link','#selected-service-badge','#inquiry-service-name','#inquiry-email-link','#inquiry-copy-button','.form-success','.calendly-shell']) nodes[selector] = new Element();
  nodes['.calendly-section'].children.h2 = new Element(); nodes['.inquiry-section'].children.h2 = new Element();
  const root = new Element(), body = new Element(); body.appendChild = () => {};
  root.lang = language;
  const documentListeners = {};
  const scripts = [];
  const timers = new Map(); let timerId = 0;
  const doc = {documentElement:root,body,querySelector:s=>nodes[s]||null,querySelectorAll:s=>s==='main, .site-footer'?[main,footer]:[],createElement:()=>new Element(),addEventListener:(k,f)=>{documentListeners[k]=f;}};
  doc.head = {appendChild(script) { scripts.push(script); if (calendar === false) queueMicrotask(() => script.onerror()); }};
  for(const el of [burger,...menuLinks]) el.focus = () => {doc.activeElement=el;};
  const calls = [], listeners = {};
  const win = {SITE_CONFIG:{calendlyEvents:{consult:'https://calendly.com/example/consult',pt:'https://calendly.com/example/pt',online:'https://calendly.com/example/online'},inquiryEmail:'coach@example.test'},location:{search:'?service='+service},addEventListener:(k,f)=>{listeners[k]=f;},setTimeout(){},isSecureContext:true};
  const sdk = {initInlineWidget:args=>{ calls.push(args); const iframe = new Element(); iframe.contentWindow = {}; args.parentElement.children.iframe = iframe; }};
  if(calendar === true) win.Calendly = sdk;
  const context = {window:win,document:doc,matchMedia:()=>({matches:false,addEventListener(){}}),location:{pathname:'/contact.html'},URL,URLSearchParams,requestAnimationFrame:f=>f(),addEventListener(){},scrollY:0,scrollTo(){},navigator:{},setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id),console};
  win.matchMedia=context.matchMedia;
  vm.runInNewContext(source,context);
  return {form,select,nodes,calls,win,listeners,doc,documentListeners,burger,menuLinks,main,footer,scripts,sdk,timers,context};
}
async function run() {
const routeHints = setup('program');
assert.equal(routeHints.form.children['#route-note'].hidden, true);
assert.equal(routeHints.form.children['#route-note'].textContent, '');
routeHints.select.value = 'consult'; routeHints.select.fire('change');
assert.equal(routeHints.form.children['#route-note'].hidden, false);
assert.ok(routeHints.form.children['#route-note'].textContent.includes('Calendly'));
routeHints.select.value = 'other'; routeHints.select.fire('change');
assert.equal(routeHints.form.children['#route-note'].hidden, true);
routeHints.select.value = ''; routeHints.select.fire('change');
assert.equal(routeHints.form.children['#route-note'].hidden, false);
for(const service of ['consult','pt','online']) {
  const t=setup(service); assert.equal(t.select.value,service); await t.form.fire('submit');
  assert.equal(t.calls.length,1); assert.equal(new URL(t.calls[0].url).pathname, '/example/'+service);
  assert.ok(t.calls[0].prefill.customAnswers.a1.includes('Erősödnék. & Kérdés?\nMásodik sor.'));
  assert.ok(t.calls[0].prefill.customAnswers.a1.includes('Telefon: nincs megadva'));
  assert.equal(Object.keys(t.calls[0].prefill.customAnswers).join(), 'a1');
  assert.equal(t.calls[0].prefill.name, 'Tűrő Árvíz');
  assert.equal(t.calls[0].prefill.firstName, 'Árvíz');
  assert.equal(t.calls[0].prefill.lastName, 'Tűrő');
  assert.equal(new URL(t.calls[0].url).searchParams.get('primary_color'), 'd4a843');
  assert.equal(new URL(t.calls[0].url).searchParams.get('background_color'), '100f0c');
  assert.equal(new URL(t.calls[0].url).searchParams.get('text_color'), 'f5f0e8');
  const external = new URL(t.nodes['#calendly-direct-link'].href);
  assert.equal(t.nodes['#calendly-direct-link'].href, t.calls[0].url);
  assert.equal(external.searchParams.get('name'), 'Tűrő Árvíz');
  assert.equal(external.searchParams.get('first_name'), 'Árvíz');
  assert.equal(external.searchParams.get('last_name'), 'Tűrő');
  assert.equal(external.searchParams.get('email'), 'test@example.test');
  assert.equal(external.searchParams.get('a1'), t.calls[0].prefill.customAnswers.a1);
  assert.equal(t.calls[0].prefill.email,'test@example.test');
  assert.equal(t.nodes['.inquiry-section'].hidden,true);
  assert.equal(t.nodes['.calendly-section'].hidden,false);
  assert.equal(t.nodes['.calendly-section'].scrollCount, 1, 'calendar load must not scroll the visitor a second time');
}
const editedPrefill = setup('online');
await editedPrefill.form.fire('submit');
editedPrefill.form.children['#fname'].value = '  Anna Mária  ';
editedPrefill.form.children['#lname'].value = '  Tűrő-Nagy  ';
editedPrefill.form.children['#email'].value = '  anna+coaching@example.test  ';
editedPrefill.form.fire('input');
await editedPrefill.form.fire('submit');
const updatedUrl = new URL(editedPrefill.calls[1].url);
assert.equal(updatedUrl.searchParams.get('name'), 'Tűrő-Nagy Anna Mária');
assert.equal(updatedUrl.searchParams.get('first_name'), 'Anna Mária');
assert.equal(updatedUrl.searchParams.get('email'), 'anna+coaching@example.test');
assert.ok(editedPrefill.calls[1].url.includes('Anna%20M%C3%A1ria'));
assert.ok(editedPrefill.calls[1].url.includes('anna%2Bcoaching'));
assert.ok(!editedPrefill.calls[1].url.includes('+'), 'widget must not interpret encoded spaces as literal plus signs');
const inquiry=setup('other'); await inquiry.form.fire('submit');
assert.equal(inquiry.calls.length,0);
const gmail=new URL(inquiry.nodes['#inquiry-email-link'].href);
assert.equal(gmail.searchParams.get('to'),'coach@example.test');
assert.ok(gmail.searchParams.get('body').includes('Erősödnék. & Kérdés?\nMásodik sor.'));
assert.ok(inquiry.nodes['#inquiry-copy-button'].dataset.copyText.includes('test@example.test'));
assert.equal(inquiry.nodes['.calendly-section'].hidden,true);
for (const [key, price] of [['basic','29 900'],['plus','39 900'],['premium','49 900']]) {
  const tier = setup('online&package='+key);
  assert.equal(tier.form.children['#online-package'].value,key);
  assert.equal(tier.form.children['#online-package-group'].hidden,false);
  await tier.form.fire('submit');
  assert.ok(tier.calls[0].prefill.customAnswers.a1.includes(price));
  assert.ok(tier.nodes['#selected-service-badge'].textContent.includes(price));
  tier.select.value='program'; tier.select.fire('change'); await tier.form.fire('submit');
  assert.equal(tier.calls.length,1); // Program inquiry must not create another calendar widget.
  assert.equal(tier.form.children['#online-package-group'].hidden,true);
  assert.equal(tier.form.children['#online-package'].disabled,true);
  assert.ok(!new URL(tier.nodes['#inquiry-email-link'].href).searchParams.get('body').includes(price));
}
const program = setup('program'); await program.form.fire('submit');
assert.equal(program.calls.length,0);
assert.equal(program.nodes['.inquiry-section'].hidden,false);
assert.ok(new URL(program.nodes['#inquiry-email-link'].href).searchParams.get('su').includes('program'));
const unknownTier = setup('online&package=unknown');
assert.equal(unknownTier.form.children['#online-package'].value,'');
inquiry.select.value='pt'; await inquiry.form.fire('submit');
assert.equal(inquiry.nodes['.inquiry-section'].hidden,true); assert.equal(inquiry.calls.length,1);
const missing=setup('consult',false); await missing.form.fire('submit');
assert.equal(missing.nodes['#calendly-config-notice'].hidden,false);
assert.equal(missing.nodes['#calendly-loading'].hidden,true);
assert.equal(missing.nodes['#calendly-direct-link'].hidden,false);
await missing.form.fire('submit');
assert.equal(missing.scripts.length,2); // Retry starts a fresh SDK request after a load error.
const deferred=setup('online','pending');
const pendingSubmit=deferred.form.fire('submit');
assert.equal(deferred.nodes['#calendly-loading'].hidden,false);
deferred.select.value='program'; deferred.select.fire('change');
deferred.win.Calendly=deferred.sdk; deferred.scripts[0].onload();
await pendingSubmit;
assert.equal(deferred.calls.length,0); // The abandoned online route must not appear after loading.
assert.equal(deferred.nodes['.calendly-section'].hidden,true);
const slow=setup('pt'); await slow.form.fire('submit');
assert.equal(slow.calls[0].resize, false);
const sizedEmbed = slow.nodes['#calendly-embed'];
const sizedFrame = sizedEmbed.querySelector('iframe');
const sizing = (origin, source, height) => slow.listeners.message({origin, source, data:{event:'calendly.page_height',payload:{height}}});
sizing('https://calendly.com', sizedFrame.contentWindow, '1120px');
assert.equal(sizedEmbed.style.height, '1120px');
sizing('https://wrong.example', sizedFrame.contentWindow, '600px');
assert.equal(sizedEmbed.style.height, '1120px');
sizing('https://calendly.com', {}, '600px');
assert.equal(sizedEmbed.style.height, '1120px');
for (const value of ['auto', '-10px', 'NaN', '13000', '10em']) sizing('https://calendly.com', sizedFrame.contentWindow, value);
assert.equal(sizedEmbed.style.height, '1120px');
sizing('https://calendly.com', sizedFrame.contentWindow, 740.5);
assert.equal(sizedEmbed.style.height, '741px');
assert.equal(slow.nodes['.calendly-section'].scrollCount, 1);
const readyTimeout=[...slow.timers.values()].find(timer=>timer.ms===15000);
readyTimeout.fn();
assert.equal(slow.nodes['#calendly-config-notice'].hidden,false);
const slowFrame=slow.nodes['#calendly-embed'].querySelector('iframe');
slow.listeners.message({origin:'https://calendly.com',source:slowFrame.contentWindow,data:{event:'calendly.event_type_viewed'}});
assert.equal(slow.nodes['#calendly-config-notice'].hidden,true);
assert.equal(slow.nodes['#calendly-loading'].hidden,true);
const invalid=setup('consult'); invalid.form.reportValidity=()=>false; await invalid.form.fire('submit'); assert.equal(invalid.calls.length,0);
const missingUrl=setup('online'); missingUrl.win.SITE_CONFIG.calendlyEvents.online=''; await missingUrl.form.fire('submit'); assert.equal(missingUrl.calls.length,0); assert.equal(missingUrl.nodes['#calendly-config-notice'].hidden,false);
const malformed=setup('pt'); malformed.win.SITE_CONFIG.calendlyEvents.pt='invalid url'; await malformed.form.fire('submit'); assert.equal(malformed.nodes['#calendly-config-notice'].hidden,false);
const success=setup('consult'); await success.form.fire('submit');
success.listeners.message({origin:'https://wrong.example',data:{event:'calendly.event_scheduled'}}); assert.ok(!success.nodes['.form-success'].classList.contains('visible'));
success.listeners.message({origin:'https://calendly.com',source:{},data:{event:'calendly.event_scheduled'}}); assert.ok(!success.nodes['.form-success'].classList.contains('visible'));
success.listeners.message({origin:'https://calendly.com',source:success.nodes['#calendly-embed'].querySelector('iframe').contentWindow,data:{event:'calendly.event_scheduled'}}); assert.ok(success.nodes['.form-success'].classList.contains('visible'));
assert.equal(success.form.style.display,'none');
const stale=setup('consult'); await stale.form.fire('submit');
const staleFrame=stale.nodes['#calendly-embed'].querySelector('iframe');
stale.select.value='other'; stale.select.fire('change');
stale.listeners.message({origin:'https://calendly.com',source:staleFrame.contentWindow,data:{event:'calendly.event_scheduled'}});
assert.ok(!stale.nodes['.form-success'].classList.contains('visible'));
const keyboard=setup('consult'); keyboard.burger.fire('click');
assert.equal(keyboard.burger.attrs['aria-expanded'],'true');
assert.equal(keyboard.doc.activeElement,keyboard.menuLinks[0]);
assert.equal(keyboard.main.inert,true);
keyboard.doc.activeElement=keyboard.menuLinks[2];
keyboard.documentListeners.keydown({key:'Tab',preventDefault(){}});
assert.equal(keyboard.doc.activeElement,keyboard.burger);
keyboard.documentListeners.keydown({key:'Tab',shiftKey:true,preventDefault(){}});
assert.equal(keyboard.doc.activeElement,keyboard.menuLinks[2]);
keyboard.documentListeners.keydown({key:'Escape'});
assert.equal(keyboard.doc.activeElement,keyboard.burger);
assert.equal(keyboard.burger.attrs['aria-expanded'],'false');
assert.equal(keyboard.main.inert,false);
console.log('PASS: three calendar routes, three coaching-package handoffs, standalone-program email route, invalid package, email/copy preparation, message preservation, service switching, validation, calendar failure/confirmation and keyboard menu focus. No messages sent or bookings made.');

}
module.exports = { setup, Element };
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
