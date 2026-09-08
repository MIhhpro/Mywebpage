// A printable copy preserves the document's version and draft status.
const printTerms = document.querySelector('[data-print-terms]');
if (printTerms) {
  printTerms.hidden = false;
  printTerms.addEventListener('click', () => window.print());
}
