<script>
class Lookup {
  static cache = new Int8Array(65536 * 4 * 4);

  raw;
  left;
  right;
  score;
  moveLeft; // new Int8Array([0, 1, 2, 3]);
  moveRight; // new Int8Array([0, 1, 2, 3]);
  mergeLeft;
  mergeRight;

  static row = 0;
  static table = Array(65536)
    .fill()
    .map(() => new Lookup());

  constructor() {
    const offset = Lookup.row * 16;
    this.moveLeft = new Int8Array(
      Lookup.cache.buffer,
      (offset + 0) * Int8Array.BYTES_PER_ELEMENT,
      4
    );
    this.moveRight = new Int8Array(
      Lookup.cache.buffer,
      (offset + 4) * Int8Array.BYTES_PER_ELEMENT,
      4
    );
    this.mergeLeft = new Int8Array(
      Lookup.cache.buffer,
      (offset + 8) * Int8Array.BYTES_PER_ELEMENT,
      4
    );
    this.mergeRight = new Int8Array(
      Lookup.cache.buffer,
      (offset + 12) * Int8Array.BYTES_PER_ELEMENT,
      4
    );
    if (Lookup.row < 65536) this.init(Lookup.row++);
  }

  init(r) {
    this.raw = r;

    const V = [
      (r >> 0) & 0x0f,
      (r >> 4) & 0x0f,
      (r >> 8) & 0x0f,
      (r >> 12) & 0x0f,
    ];
    const L = [V[0], V[1], V[2], V[3]];
    const R = [V[3], V[2], V[1], V[0]]; // mirrored

    this.moveLeft[0] = -1;
    this.moveLeft[1] = -1;
    this.moveLeft[2] = -1;
    this.moveLeft[3] = -1;
    this.moveRight[0] = -1;
    this.moveRight[1] = -1;
    this.moveRight[2] = -1;
    this.moveRight[3] = -1;

    this.score = Lookup.mvleft(L, this.moveLeft, this.mergeLeft);
    this.left = (L[0] << 0) | (L[1] << 4) | (L[2] << 8) | (L[3] << 12);

    this.score = Lookup.mvleft(R, this.moveRight, this.mergeRight);
    R.reverse();
    this.moveRight.reverse();
    this.mergeRight.reverse();
    this.moveRight.forEach(
      (v, i, a) => (a[i] = a[i] != -1 ? (a[i] != 3 - i ? 3 - a[i] : i) : -1)
    );
    this.right = (R[0] << 0) | (R[1] << 4) | (R[2] << 8) | (R[3] << 12);
  }

  static mvleft(row, move, merge) {
    let top = 0;
    let tmp = 0;
    let tmp_pos = 0;
    let score = 0;

    for (let i = 0; i < 4; i++) {
      let tile = row[i];
      if (tile == 0) continue;
      row[i] = 0;
      if (tmp != 0) {
        if (tile == tmp) {
          tile = tile + 1;
          move[tmp_pos] = top;
          move[i] = top;
          merge[top] = 1;
          row[top++] = tile;
          score += 1 << tile;
          tmp = 0;
        } else {
          move[tmp_pos] = top;
          row[top++] = tmp;
          tmp = tile;
          tmp_pos = i;
        }
      } else {
        tmp = tile;
        tmp_pos = i;
      }
    }
    if (tmp != 0) {
      move[tmp_pos] = top;
      row[top] = tmp;
    }
    return score;
  }
}

export default Lookup.table;
</script>