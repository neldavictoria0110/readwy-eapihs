const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pages = JSON.parse(html.match(/<script id="readwy-page-sources" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const documentSource = JSON.parse(pages.application.match(/<script type="application\/json" id="sra-express-document">([\s\S]*?)<\/script>/)[1]);
const script = documentSource.match(/<script>([\s\S]*?)<\/script>/)[1];
const books = JSON.parse(script.match(/const BOOKS=(\[[^\n]+\]);/)[1]);

test('embedded SRA reading lab ships all 60 readings and 600 questions', () => {
  new vm.Script(script);
  assert.equal(books.length, 60);
  assert.equal(books.reduce((n, b) => n + b.questions.length, 0), 600);
  assert.equal(new Set(books.map(b => b.id)).size, 60);
  assert.deepEqual([...new Set(books.map(b => b.grade))].sort((a, b) => a - b), [7, 8, 9, 10, 11, 12]);
  for (const book of books) {
    assert.equal(book.answers.length, 10);
    assert(book.answers.every(answer => /^[A-D]$/.test(answer)));
    assert(book.title && book.genre && book.source && book.paragraphs.length);
  }
});

test('build injects the BOOKS dataset into the SRA app source', () => {
  const app = fs.readFileSync(path.join(__dirname, 'v3/app.html'), 'utf8');
  const source = fs.readFileSync(path.join(__dirname, 'v3/books.js'), 'utf8').trim();
  assert(app.includes('/*__BOOKS__*/'), 'app.html should keep the injection marker');
  assert(source.startsWith('const BOOKS=['), 'books.js should define BOOKS');
  assert(!documentSource.includes('/*__BOOKS__*/'), 'the built document must not keep the marker');
  assert(documentSource.includes(source), 'the built document should contain the dataset');
});

test('SRA stage mounts the embedded document and returns to the journey map', () => {
  const handlers = {}, frame = { addEventListener() {} }, calls = [];
  const c = {
    page: 'map', activeModule: '', nav: { innerHTML: '' }, owl: { style: {} },
    stopOwlFlight() {}, stopWelcomeWandering() {}, go: page => calls.push(page),
    document: { getElementById: () => ({ textContent: JSON.stringify(documentSource) }) },
    app: { innerHTML: '', querySelector: selector => selector === '.sra-express-frame' ? frame : { addEventListener: (name, fn) => handlers[name] = fn } }
  };
  vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'express.js'), 'utf8'), c);
  c.renderSRA();
  assert.equal(c.activeModule, 'sra');
  assert.equal(c.page, 'work');
  assert.equal(frame.srcdoc, documentSource);
  assert.equal(c.owl.style.display, 'none');
  handlers.click();
  assert.deepEqual(calls, ['map']);
});
