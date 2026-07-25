// ============================
//  LINKED LIST VISUALIZER
// ============================

// ---- Node Class ----
class LLNode {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
    this.state = 'default'; // default | visiting | found | inserting | deleting | reversed
    this.x = 0;
    this.y = 0;
  }
}

// ---- Linked List Manager ----
class LinkedList {
  constructor(type = 'singly') {
    this.head = null;
    this.tail = null;
    this.type = type; // singly | doubly | circular | doubly-circular
    this.size = 0;
    this.nodes = [];
  }

  getNodePositions() {
    const startX = 60;
    const startY = 200;
    const spacing = 120;
    this.nodes.forEach((node, i) => {
      node.x = startX + i * spacing;
      node.y = startY;
    });
  }

  resetStates() {
    this.nodes.forEach(n => n.state = 'default');
  }

  // ---- INSERT ----
  insert(data, position = 'end', index = -1) {
    const node = new LLNode(data);
    const isCircular = this.type === 'circular' || this.type === 'doubly-circular';
    const isDoubly = this.type === 'doubly' || this.type === 'doubly-circular';

    if (this.size === 0) {
      this.head = node;
      this.tail = node;
      if (isCircular) {
        node.next = node;
        if (isDoubly) node.prev = node;
      }
      this.nodes.push(node);
      this.size++;
      this.getNodePositions();
      return { success: true, message: `Inserted ${data} as the first node.` };
    }

    if (position === 'beginning') {
      node.next = this.head;
      if (isDoubly) this.head.prev = node;
      this.head = node;
      if (isCircular) this.tail.next = this.head;
      if (isDoubly && isCircular) this.head.prev = this.tail;
      this.nodes.unshift(node);
      this.size++;
      this.getNodePositions();
      return { success: true, message: `Inserted ${data} at the beginning.` };
    }

    if (position === 'position' && index >= 0 && index <= this.size) {
      if (index === 0) return this.insert(data, 'beginning');
      if (index === this.size) return this.insert(data, 'end');

      let current = this.head;
      for (let i = 0; i < index - 1; i++) current = current.next;

      node.next = current.next;
      if (current.next) current.next.prev = node;
      current.next = node;
      if (isDoubly) node.prev = current;
      if (isCircular && index === this.size) this.tail.next = this.head;
      this.nodes.splice(index, 0, node);
      this.size++;
      this.getNodePositions();
      return { success: true, message: `Inserted ${data} at position ${index}.` };
    }

    // End
    this.tail.next = node;
    if (isDoubly) {
      node.prev = this.tail;
    }
    this.tail = node;
    if (isCircular) this.tail.next = this.head;
    if (isDoubly && isCircular) this.head.prev = this.tail;
    this.nodes.push(node);
    this.size++;
    this.getNodePositions();
    return { success: true, message: `Inserted ${data} at the end.` };
  }

  // ---- DELETE ----
  delete(data) {
    if (this.size === 0) return { success: false, message: 'List is empty.' };

    const isCircular = this.type === 'circular' || this.type === 'doubly-circular';
    const isDoubly = this.type === 'doubly' || this.type === 'doubly-circular';
    let current = this.head;
    let prev = null;
    let found = false;

    for (let i = 0; i < this.size; i++) {
      if (current.data === data) {
        found = true;
        if (i === 0) {
          // Delete head
          if (this.size === 1) {
            this.head = null;
            this.tail = null;
          } else {
            this.head = this.head.next;
            if (isDoubly) this.head.prev = null;
            if (isCircular) this.tail.next = this.head;
            if (isDoubly && isCircular) this.head.prev = this.tail;
          }
          this.nodes.shift();
        } else if (i === this.size - 1) {
          // Delete tail
          if (isDoubly) {
            this.tail = this.tail.prev;
            this.tail.next = null;
          } else {
            let temp = this.head;
            while (temp.next !== this.tail) temp = temp.next;
            this.tail = temp;
            this.tail.next = isCircular ? this.head : null;
          }
          if (isCircular) this.tail.next = this.head;
          this.nodes.pop();
        } else {
          // Delete middle
          if (prev) prev.next = current.next;
          if (current.next && isDoubly) current.next.prev = prev;
          this.nodes.splice(i, 1);
        }
        this.size--;
        this.getNodePositions();
        return { success: true, message: `Deleted node with value ${data}.` };
      }
      prev = current;
      current = current.next;
      if (isCircular && current === this.head) break;
    }

    return { success: false, message: `Value ${data} not found in the list.` };
  }

  // ---- SEARCH ----
  async search(data, visualizer) {
    if (this.size === 0) {
      visualizer.setStatus('List is empty.');
      return null;
    }

    this.resetStates();
    const isCircular = this.type === 'circular' || this.type === 'doubly-circular';
    let current = this.head;
    let index = 0;

    for (let i = 0; i < this.size; i++) {
      if (!current) break;
      this.nodes[index].state = 'visiting';
      visualizer.draw();
      await sleep(500);

      if (current.data === data) {
        this.nodes[index].state = 'found';
        visualizer.draw();
        visualizer.setStatus(`Found value ${data} at index ${index}.`);
        return index;
      }

      this.nodes[index].state = 'default';
      current = current.next;
      index++;
      if (isCircular && current === this.head) break;
    }

    visualizer.draw();
    visualizer.setStatus(`Value ${data} not found in the list.`);
    return null;
  }

  // ---- REVERSE ----
  reverse() {
    if (this.size <= 1) return { success: false, message: 'List has 0 or 1 nodes, nothing to reverse.' };

    const isCircular = this.type === 'circular' || this.type === 'doubly-circular';
    const isDoubly = this.type === 'doubly' || this.type === 'doubly-circular';

    let prev = null;
    let current = this.head;
    let next = null;

    if (isCircular) {
      const oldHead = this.head;
      for (let i = 0; i < this.size; i++) {
        next = current.next;
        current.next = prev;
        if (isDoubly) current.prev = next;
        prev = current;
        current = next;
      }
      this.head = prev;
      this.tail = oldHead;
      this.tail.next = this.head;
      if (isDoubly) this.head.prev = this.tail;
    } else {
      this.tail = this.head;
      for (let i = 0; i < this.size; i++) {
        next = current.next;
        current.next = prev;
        if (isDoubly) current.prev = next;
        prev = current;
        current = next;
      }
      this.head = prev;
      if (this.head) this.head.prev = null;
    }

    // Reverse the nodes array
    this.nodes.reverse();
    this.getNodePositions();
    this.nodes.forEach(n => n.state = 'reversed');
    return { success: true, message: 'Linked list reversed!' };
  }

  // ---- CLEAR ----
  clear() {
    this.head = null;
    this.tail = null;
    this.nodes = [];
    this.size = 0;
  }

  // ---- GENERATE RANDOM ----
  generateRandom(count = 5) {
    this.clear();
    for (let i = 0; i < count; i++) {
      const val = Math.floor(Math.random() * 90) + 10;
      this.insert(val, 'end');
    }
  }
}

// ============================
//  VISUALIZER (Canvas Renderer)
// ============================

class Visualizer {
  constructor(canvasId, list) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.list = list;
    this.dpr = window.devicePixelRatio || 1;
    this.resizeCanvas();
    this.bindControls();
    this.draw();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = 400 * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.canvas.style.height = '400px';
  }

  setStatus(msg) {
    document.getElementById('status-text').textContent = msg;
  }

  updateSize() {
    document.getElementById('list-size').textContent = `Size: ${this.list.size}`;
  }

  // ---- DRAWING ----
  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;

    ctx.clearRect(0, 0, w, h);

    if (this.list.size === 0) {
      ctx.fillStyle = '#555';
      ctx.font = '20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔗 Empty List — Insert nodes to visualize', w / 2, h / 2);
      this.updateSize();
      return;
    }

    const isDoubly = this.list.type === 'doubly' || this.list.type === 'doubly-circular';
    const isCircular = this.list.type === 'circular' || this.list.type === 'doubly-circular';

    // Draw arrows (first, behind nodes)
    this.drawArrows(ctx, w, h, isDoubly, isCircular);

    // Draw nodes
    this.list.nodes.forEach((node, i) => {
      this.drawNode(ctx, node, i, this.list.head === node, this.list.tail === node);
    });

    this.updateSize();
  }

  drawArrows(ctx, w, h, isDoubly, isCircular) {
    const nodes = this.list.nodes;
    for (let i = 0; i < nodes.length; i++) {
      const from = nodes[i];
      const to = from.next;

      if (!to) {
        if (isCircular && nodes.length > 1) {
          // Arrow from tail back to head
          if (i === nodes.length - 1) {
            this.drawArrow(ctx, from.x + 40, from.y, nodes[0].x - 40, nodes[0].y, '#7b2ff7', true);
          }
        }
        continue;
      }

      // Find toIndex
      const toIndex = nodes.indexOf(to);
      if (toIndex === -1) continue;

      const fromX = from.x + 35;
      const fromY = from.y - 5;
      const toX = nodes[toIndex].x - 35;
      const toY = nodes[toIndex].y - 5;

      // Always draw next pointer
      this.drawArrow(ctx, fromX, fromY, toX, toY, '#3a8fff', false);

      // Draw prev pointer (doubly)
      if (isDoubly) {
        const pFromX = nodes[toIndex].x - 35;
        const pFromY = nodes[toIndex].y + 15;
        const pToX = from.x + 35;
        const pToY = from.y + 15;
        this.drawArrow(ctx, pFromX, pFromY, pToX, pToY, '#ff6b35', true);
      }
    }
  }

  drawArrow(ctx, x1, y1, x2, y2, color, dashed) {
    const headLen = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = color;

    if (dashed) ctx.setLineDash([5, 4]);
    else ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.35), y2 - headLen * Math.sin(angle - 0.35));
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.35), y2 - headLen * Math.sin(angle + 0.35));
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawNode(ctx, node, index, isHead, isTail) {
    const x = node.x;
    const y = node.y;
    const w = 70;
    const h = 50;
    const r = 10;

    // Color based on state
    const stateColors = {
      default: '#2a4a8a',
      visiting: '#cc8800',
      found: '#00a856',
      inserting: '#0088aa',
      deleting: '#cc2222',
      reversed: '#aa00aa'
    };
    const fillColor = stateColors[node.state] || stateColors.default;
    const glowColor = node.state !== 'default' ? fillColor : 'transparent';

    // Glow effect for active states
    if (node.state !== 'default') {
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20;
      ctx.fillStyle = fillColor;
      this.roundRect(ctx, x - w / 2, y - h / 2, w, h, r);
      ctx.fill();
      ctx.restore();
    }

    // Node box
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = '#6a8aff';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x - w / 2, y - h / 2, w, h, r);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Data text
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.data, x, y);
    ctx.restore();

    // Head / Tail labels
    ctx.save();
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    if (isHead) {
      ctx.fillStyle = '#00d4ff';
      ctx.fillText('HEAD', x, y - h / 2 - 6);
    }
    if (isTail) {
      ctx.fillStyle = '#ff6b35';
      ctx.fillText('TAIL', x, y + h / 2 + 16);
    }
    ctx.restore();

    // Index label
    ctx.save();
    ctx.fillStyle = '#888';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`[${index}]`, x, y + h / 2 + 28);
    ctx.restore();

    // Next pointer label
    if (node.next) {
      ctx.save();
      ctx.fillStyle = '#3a8fff';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('next', x + 40, y - 18);
      ctx.restore();
    }
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ---- BIND CONTROLS ----
  bindControls() {
    // Mode switch
    document.getElementById('list-mode').addEventListener('change', (e) => {
      this.list.type = e.target.value;
      this.list.clear();
      this.draw();
      this.setStatus(`Switched to ${e.target.options[e.target.selectedIndex].text}.`);
    });

    // Insert position toggle
    document.getElementById('insert-position').addEventListener('change', (e) => {
      const idxInput = document.getElementById('insert-index');
      idxInput.hidden = e.target.value !== 'position';
    });

    // Insert button
    document.getElementById('btn-insert').addEventListener('click', () => {
      const val = parseInt(document.getElementById('insert-value').value);
      if (isNaN(val)) { this.setStatus('Please enter a valid number.'); return; }

      const pos = document.getElementById('insert-position').value;
      const idx = parseInt(document.getElementById('insert-index').value);

      if (pos === 'position' && (isNaN(idx) || idx < 0 || idx > this.list.size)) {
        this.setStatus(`Invalid index. Must be between 0 and ${this.list.size}.`);
        return;
      }

      const result = this.list.insert(val, pos, idx);
      this.list.resetStates();
      if (result.success) {
        // Highlight inserted node
        if (pos === 'beginning') this.list.nodes[0].state = 'inserting';
        else if (pos === 'position' && !isNaN(idx)) this.list.nodes[idx].state = 'inserting';
        else this.list.nodes[this.list.nodes.length - 1].state = 'inserting';
      }
      this.draw();
      this.setStatus(result.message);
    });

    // Delete button
    document.getElementById('btn-delete').addEventListener('click', () => {
      const val = parseInt(document.getElementById('delete-value').value);
      if (isNaN(val)) { this.setStatus('Please enter a valid number.'); return; }

      // Highlight the node to delete before removal (if found)
      const foundIdx = this.list.nodes.findIndex(n => n.data === val);
      if (foundIdx !== -1) {
        this.list.nodes[foundIdx].state = 'deleting';
        this.draw();
        setTimeout(() => {
          const result = this.list.delete(val);
          this.draw();
          this.setStatus(result.message);
        }, 400);
      } else {
        const result = this.list.delete(val);
        this.draw();
        this.setStatus(result.message);
      }
    });

    // Search button
    document.getElementById('btn-search').addEventListener('click', () => {
      const val = parseInt(document.getElementById('search-value').value);
      if (isNaN(val)) { this.setStatus('Please enter a valid number.'); return; }
      this.list.search(val, this);
    });

    // Reverse button
    document.getElementById('btn-reverse').addEventListener('click', () => {
      const result = this.list.reverse();
      this.draw();
      this.setStatus(result.message);
      // Reset states after a moment
      setTimeout(() => {
        this.list.resetStates();
        this.draw();
      }, 1500);
    });

    // Clear button
    document.getElementById('btn-clear').addEventListener('click', () => {
      this.list.clear();
      this.draw();
      this.setStatus('List cleared.');
    });

    // Generate random
    document.getElementById('btn-generate').addEventListener('click', () => {
      this.list.generateRandom(5);
      this.draw();
      this.setStatus('Generated 5 random nodes.');
    });
  }
}

// ---- Utility ----
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  const list = new LinkedList('singly');
  const viz = new Visualizer('linked-list-canvas', list);

  // Insert some demo nodes
  list.insert(10);
  list.insert(20);
  list.insert(30);
  list.insert(40);
  list.insert(50);
  viz.draw();
  viz.setStatus('Demo ready — try operations on the list!');
});

