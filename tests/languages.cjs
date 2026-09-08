// Bilingual behavior without live browser sessions, email or Calendly requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {setup} = require('./contact-flow.cjs');

async function run() {
  const control = {dataset:{selected:'en'}};
  const links = ['contact.html', 'contact-en.html'].map(href => ({
    href, dataset:{language:href.includes('-en')?'en':'hu'}, handlers:{},
    getAttribute() { return this.href; }, setAttribute(key, value) { this[key] = value; },
    addEventListener(event, fn) { this.handlers[event] = fn; }, closest() { return control; }
  }));
  const events = {};
  const location = {href:'https://example.test/project/contact-en.html?service=online&package=premium&email=private%40example.test#section-contact'};
  let timer, destination, reduced = false;
  location.assign = value => destination = value;
  const pageDocument = {documentElement:{lang:'en'},querySelectorAll:()=>links};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../language.js'),'utf8'), {
    URL, document:pageDocument, window:{location, addEventListener:(event, fn)=>events[event]=fn,
      matchMedia:()=>({matches:reduced}),setTimeout:fn=>timer=fn}
  });
  assert.equal(links[0].href, '/project/contact.html?service=online&package=premium#section-contact');
  assert.equal(links[1].href, '/project/contact-en.html?service=online&package=premium#section-contact');
  location.href = 'https://example.test/project/contact-en.html#section-contact-info';
  events.hashchange();
  assert.equal(links[0].href, '/project/contact.html#section-contact-info');
  let prevented = false;
  const click = {button:0,preventDefault:()=>prevented=true};
  links[0].handlers.click({...click,ctrlKey:true});
  assert.equal(prevented,false);
  reduced = true; links[0].handlers.click(click);
  assert.equal(prevented,false);
  reduced = false; links[0].handlers.click(click);
  assert.equal(control.dataset.selected,'hu');
  assert.equal(prevented,true);
  assert.equal(destination,undefined,'Navigation waits for the slide');
  timer(); assert.equal(destination,links[0].href);
  events.pageshow(); assert.equal(control.dataset.selected,'en','Back navigation restores the correct highlight');
  pageDocument.baseURI = 'https://example.test/';
  location.href = 'https://example.test/missing/deep/path';
  links[0].href = '404.html'; links[1].href = '404-en.html';
  events.hashchange();
  assert.equal(links[0].href, '/404.html');
  assert.equal(links[1].href, '/404-en.html');

  const calendar = setup('online', true, 'en');
  assert.equal(calendar.form.children['#route-submit'].textContent, 'Choose a time');
  await calendar.form.fire('submit');
  const prefill = calendar.calls[0].prefill;
  assert.equal(prefill.name, 'Árvíz Tűrő');
  assert.equal(new URL(calendar.calls[0].url).searchParams.get('name'), 'Árvíz Tűrő');
  assert.ok(prefill.customAnswers.a1.includes('Phone: not provided'));
  assert.ok(prefill.customAnswers.a1.includes('Message: Erősödnék. & Kérdés?\nMásodik sor.'));
  assert.equal(calendar.nodes['#calendly-embed'].children.iframe.attrs.title, 'online – appointment booking');
  calendar.burger.fire('click');
  assert.equal(calendar.burger.attrs['aria-label'], 'Close menu');

  const inquiry = setup('program', true, 'en');
  assert.equal(inquiry.form.children['#route-submit'].textContent, 'Prepare enquiry');
  await inquiry.form.fire('submit');
  assert.equal(inquiry.calls.length, 0);
  const gmail = new URL(inquiry.nodes['#inquiry-email-link'].href);
  assert.equal(gmail.searchParams.get('su'), 'program – website enquiry');
  assert.ok(gmail.searchParams.get('body').includes('Name: Árvíz Tűrő'));
  assert.ok(inquiry.nodes['#inquiry-copy-button'].dataset.copyText.startsWith('To: coach@example.test\nSubject:'));
  const empty = setup('', true, 'en');
  assert.equal(empty.form.children['#route-submit'].textContent, 'Continue');
  assert.ok(empty.form.children['#route-note'].textContent.startsWith('Choose the free consultation'));
  console.log('PASS: language counterpart links, section/package retention, no personal-data copying, English booking prefill, enquiry and menu labels.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
