/**
 * Splits text inside an element into character-level spans for staggered reveals.
 * Recursively walks text nodes to preserve nested element tags (like <span> or <a>).
 * @param {HTMLElement} element
 */
export function splitTextIntoChars(element) {
  const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  let node;
  while ((node = walk.nextNode())) {
    textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const parent = node.parentNode;
    const text = node.nodeValue;
    const chars = text.split('');
    const fragment = document.createDocumentFragment();

    chars.forEach((char) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'split-char-wrapper';
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.verticalAlign = 'bottom';

      const inner = document.createElement('span');
      inner.className = 'split-char-inner';
      inner.style.display = 'inline-block';
      inner.style.transform = 'translateY(100%)';
      inner.style.willChange = 'transform';

      if (char === ' ') {
        inner.innerHTML = '&nbsp;';
      } else {
        inner.textContent = char;
      }

      wrapper.appendChild(inner);
      fragment.appendChild(wrapper);
    });

    parent.replaceChild(fragment, node);
  });
}

/**
 * Splits plain text inside an element into lines based on layout offsets.
 * Wraps each line in an overflow-hidden container for smooth line reveals.
 * @param {HTMLElement} element
 */
export function splitTextIntoLines(element) {
  const text = element.textContent.trim();
  if (!text) return;

  const chars = text.split('');

  // 1. Wrap each character in a temporary span to measure its layout offsetTop
  element.innerHTML = chars
    .map((char) => {
      if (char === ' ') {
        return '<span class="temp-char-measure">&nbsp;</span>';
      }
      return `<span class="temp-char-measure">${char}</span>`;
    })
    .join('');

  const charSpans = element.querySelectorAll('.temp-char-measure');
  const lines = [];
  let currentLine = [];
  let lastTop = -1;

  charSpans.forEach((span) => {
    const top = span.offsetTop;
    // Tolerance of 5px for subpixel/line-height variances
    if (lastTop === -1 || Math.abs(top - lastTop) < 5) {
      currentLine.push(span.textContent);
    } else {
      lines.push(currentLine);
      currentLine = [span.textContent];
    }
    lastTop = top;
  });
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // 2. Clear element and rebuild using clean line wrappers
  element.innerHTML = '';
  lines.forEach((lineChars) => {
    const lineWrapper = document.createElement('div');
    lineWrapper.className = 'split-line-wrapper';
    lineWrapper.style.display = 'block';
    lineWrapper.style.overflow = 'hidden';

    const lineInner = document.createElement('div');
    lineInner.className = 'split-line-inner';
    lineInner.style.display = 'block';
    lineInner.style.transform = 'translateY(100%)';
    lineInner.style.willChange = 'transform';
    lineInner.innerHTML = lineChars.map((char) => (char === ' ' ? '&nbsp;' : char)).join('');

    lineWrapper.appendChild(lineInner);
    element.appendChild(lineWrapper);
  });
}
