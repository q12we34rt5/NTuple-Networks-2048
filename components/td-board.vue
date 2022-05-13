<template>
  <div class="board">
    <div class="block-container" v-for="i in 16" :key="i">
      <div class="block">
        <div class="tile-container" :ref="'t' + (i - 1)"></div>
        <div class="tile-container" :ref="'m' + (i - 1)"></div>
      </div>
    </div>
    <pre id="board-data-hook"></pre>
  </div>
</template>

<script>
import LookupTable from "./LookupTable.vue";
export default {
  data() {
    return {
      layout: {
        scale: 1,
        board: {
          width: 300,
          height: 300,
          padding: 3,
        },
        block: {
          width: 69,
          height: 69,
        },
      },
      board: {
        data: new Uint8Array(
          Array(16)
            .fill()
            .map((_, i) => i)
        ), //new Uint8Array(16),
      },
      animation: {
        enable: true,
        delay: 100,
        easing: "ease-in-out",
      },
      ACTIONS: {
        LEFT: 0,
        RIGHT: 1,
        UP: 2,
        DOWN: 3,
      },
      state: 1,
      enablehook: true,
      onStateChanged: null,
    };
  },
  watch: {
    state() {
      if (this.onStateChanged) this.onStateChanged(this.state);
    },
  },
  methods: {
    reset() {
      const data = this.board.data;
      for (let i = 0; i < 16; i++) data[i] = 0;
      this.popup();
      this.popup();
      this.state = 1;
      if (this.enablehook) this.mapHook(); // hook data
      this.mapTile();
    },
    move(direction) {
      let score = 0,
        valid = false;
      const dir = direction & 1;
      const updown = direction >> 1;
      const diff = updown ? 4 : 1;
      const odiff = updown ? 1 : 4;
      const data = this.board.data;
      const movedir = dir ? "right" : "left";
      const moveact = dir ? "moveRight" : "moveLeft";
      const movetype = dir ? "mergeRight" : "mergeLeft";
      for (let r = 0; r < 4; r++) {
        const offset = r * odiff;
        const pos0 = offset + 0 * diff,
          pos1 = offset + 1 * diff,
          pos2 = offset + 2 * diff,
          pos3 = offset + 3 * diff;
        const t0 = data[pos0],
          t1 = data[pos1],
          t2 = data[pos2],
          t3 = data[pos3];
        const row = (t0 << 0) | (t1 << 4) | (t2 << 8) | (t3 << 12);
        const state = LookupTable[row];
        score += state.score;
        const movedrow = state[movedir];
        valid ||= row != movedrow;
        let cache0, cache1, cache2, cache3;
        data[pos0] = cache0 = (movedrow >> 0) & 0xf;
        data[pos1] = cache1 = (movedrow >> 4) & 0xf;
        data[pos2] = cache2 = (movedrow >> 8) & 0xf;
        data[pos3] = cache3 = (movedrow >> 12) & 0xf;
        if (!this.animation.enable) continue;
        // animation part
        const poses = [pos0, pos1, pos2, pos3];
        const mvtypes = state[movetype];
        if (cache0) this.createTile(pos0, cache0, mvtypes[0]);
        if (cache1) this.createTile(pos1, cache1, mvtypes[1]);
        if (cache2) this.createTile(pos2, cache2, mvtypes[2]);
        if (cache3) this.createTile(pos3, cache3, mvtypes[3]);
        const move = state[moveact];
        const tmp0 = poses[move[0]],
          tmp1 = poses[move[1]],
          tmp2 = poses[move[2]],
          tmp3 = poses[move[3]];
        if (move[0] != -1) this.mcs[tmp0].innerHTML = "";
        if (move[1] != -1) this.mcs[tmp1].innerHTML = "";
        if (move[2] != -1) this.mcs[tmp2].innerHTML = "";
        if (move[3] != -1) this.mcs[tmp3].innerHTML = "";
        if (move[0] != -1) {
          let tile0 = this.moveTile(pos0, tmp0);
          this.moveAnimation(tile0, updown, ((pos0 - tmp0) / diff) | 0);
        }
        if (move[1] != -1) {
          let tile1 = this.moveTile(pos1, tmp1);
          this.moveAnimation(tile1, updown, ((pos1 - tmp1) / diff) | 0);
        }
        if (move[2] != -1) {
          let tile2 = this.moveTile(pos2, tmp2);
          this.moveAnimation(tile2, updown, ((pos2 - tmp2) / diff) | 0);
        }
        if (move[3] != -1) {
          let tile3 = this.moveTile(pos3, tmp3);
          this.moveAnimation(tile3, updown, ((pos3 - tmp3) / diff) | 0);
        }
      }
      const pos = valid ? this.popup() : -1;
      if (this.enablehook) this.mapHook(); // hook data
      if (!this.animation.enable) {
        this.mapTile(-1);
      } else if (pos != -1) {
        this.createTile(pos, data[pos], 2);
      }
      if (pos == -1) {
        if (!this.stateCheck()) this.state = 0;
        return -1;
      }
      return score;
    },
    stateCheck() {
      let valid = false;
      const data = this.board.data;
      for (let dir = 0; dir < 2; dir++) {
        const diff = dir ? 4 : 1;
        const odiff = dir ? 1 : 4;
        for (let r = 0; r < 4; r++) {
          const offset = r * odiff;
          const row =
            (data[offset + 0 * diff] << 0) |
            (data[offset + 1 * diff] << 4) |
            (data[offset + 2 * diff] << 8) |
            (data[offset + 3 * diff] << 12);
          const state = LookupTable[row];
          valid ||= row != state.left;
          valid ||= row != state.right;
        }
      }
      return valid;
    },
    popup() {
      let staticVars = this.popup.staticVars;
      if (staticVars === undefined) {
        staticVars = this.popup.staticVars = {
          buffer: new Uint8Array(16),
        };
      }
      const buffer = staticVars.buffer;
      const data = this.board.data;
      let count = 0;
      for (let i = 0; i < 16; i++) if (!data[i]) buffer[count++] = i;
      if (count) {
        const pos = buffer[(Math.random() * count) | 0];
        data[pos] = Math.random() > 0.1 ? 1 : 2;
        return pos;
      }
      return -1;
    },
    // pos: 0 ~ 15, tile: 0 ~ 15, anim: -1(none) 0(show-delay) 1(merge) 2(create)
    createTile(pos, tile, anim) {
      const new_tile = document.createElement("div");
      const animtype =
        anim == 0
          ? "show-delay"
          : anim == 1
          ? "merge-tile"
          : anim == 2
          ? "create-tile"
          : undefined;
      new_tile.classList.add("tile", "tile-" + tile, animtype);
      this.tcs[pos].appendChild(new_tile);
      return new_tile;
    },
    mapTile(anim = 2) {
      for (let i = 0; i < 16; i++) {
        this.tcs[i].innerHTML = "";
        const tile = this.board.data[i];
        if (tile) {
          this.createTile(i, tile, anim);
        }
      }
    },
    cleanTile() {
      for (let i = 0; i < 16; i++) {
        this.mcs[i].innerHTML = "";
      }
    },
    moveTile(i, j) {
      const tile = this.tcs[i].children[0];
      tile.classList.remove("create-tile", "show-delay", "merge-tile");
      this.mcs[j].appendChild(tile);
      return tile;
    },
    moveAnimation(tile, direction, offset) {
      let staticVars = this.moveAnimation.staticVars;
      if (staticVars === undefined) {
        staticVars = this.moveAnimation.staticVars = {
          off0: this.tcs[0].parentNode.parentNode,
          off5: this.tcs[5].parentNode.parentNode,
        };
      }
      const offsetX = staticVars.off5.offsetLeft - staticVars.off0.offsetLeft;
      const offsetY = staticVars.off5.offsetTop - staticVars.off0.offsetTop;
      const offsetpx = offset * (direction ? offsetY : offsetX);
      const moveAnimation = [
        { transform: `translate${direction ? "Y" : "X"}(${offsetpx}px)` },
        { transform: `translate${direction ? "Y" : "X"}(0px)` },
      ];
      tile.animate(moveAnimation, {
        duration: this.animation.delay,
        iterations: 1,
        easing: this.animation.easing,
      }).onfinish = (event) => {
        if (tile.parentNode) tile.parentNode.removeChild(tile);
      };
    },
    mapHook() {
      this.hook.innerHTML = this.board.data.toString().replaceAll(",", " ");
    },
    keyEventCallback(event) {
      let score = -2;
      switch (event.key) {
        case "ArrowLeft":
          score = this.move(this.ACTIONS.LEFT);
          break;
        case "ArrowRight":
          score = this.move(this.ACTIONS.RIGHT);
          break;
        case "ArrowUp":
          score = this.move(this.ACTIONS.UP);
          break;
        case "ArrowDown":
          score = this.move(this.ACTIONS.DOWN);
          break;
      }
      return score;
    },
  },
  computed: {
    tcs() {
      const tcs = [];
      for (let i = 0; i < 16; i++) tcs.push(this.$refs[`t${i}`]);
      return tcs;
    },
    mcs() {
      const mcs = [];
      for (let i = 0; i < 16; i++) mcs.push(this.$refs[`m${i}`]);
      return mcs;
    },
    hook() {
      return document.getElementById("board-data-hook");
    },
  },
};
</script>

<style scoped>
.board {
  background-color: rgb(5, 139, 0);
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  border-radius: 5%;
  padding: v-bind(layout.scale * layout.board.padding + "px");
  width: v-bind(layout.scale * layout.board.width + "px");
  height: v-bind(layout.scale * layout.board.height + "px");
}

.block-container {
  width: 24%;
  height: 24%;
  margin: auto;
  position: relative;
  display: flex;
}

.block {
  background-color: rgb(91, 182, 88);
  box-shadow: inset 2px 2px 4px -1px black;
  margin: auto;
  position: relative;
  border-radius: 15%;
  width: v-bind(layout.scale * layout.block.width + "px");
  height: v-bind(layout.scale * layout.block.height + "px");
}

.tile-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.tile-container >>> .tile {
  background-color: rgb(193, 241, 191);
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  margin: auto;
  border-radius: 15%;
  box-shadow: 2px 2px 3px 0px black;
  font-family: monospace;
  text-align: center;
  line-height: v-bind(layout.scale * layout.block.height + "px");
}

.tile-container >>> .create-tile {
  transform-origin: 50% 50%;
  animation: create-animate v-bind(animation.delay * 2 + "ms") linear;
}

@keyframes create-animate {
  0% {
    visibility: hidden;
  }
  25% {
    visibility: hidden;
    transform: scale(0);
  }
  62.5% {
    visibility: visible;
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.tile-container >>> .show-delay {
  transform-origin: 50% 50%;
  animation: show-delay-animate v-bind(animation.delay * 2 + "ms") linear;
}

@keyframes show-delay-animate {
  0% {
    visibility: hidden;
  }
  50% {
    visibility: hidden;
  }
  100% {
    visibility: visible;
  }
}

.tile-container >>> .merge-tile {
  transform-origin: 50% 50%;
  animation: merge-animate v-bind(animation.delay * 2 + "ms") linear;
}

@keyframes merge-animate {
  0% {
    visibility: hidden;
  }
  50% {
    visibility: hidden;
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.tile-container >>> .tile-1::before {
  content: "2";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 50 + "px");
}
.tile-container >>> .tile-1 {
  background-color: rgb(193, 241, 191);
}
.tile-container >>> .tile-2::before {
  content: "4";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 50 + "px");
}
.tile-container >>> .tile-2 {
  background-color: rgb(138, 255, 134);
}
.tile-container >>> .tile-3::before {
  content: "8";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 50 + "px");
}
.tile-container >>> .tile-3 {
  background-color: rgb(255, 252, 47);
}
.tile-container >>> .tile-4::before {
  content: "16";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 40 + "px");
}
.tile-container >>> .tile-4 {
  background-color: rgb(255, 206, 47);
}
.tile-container >>> .tile-5::before {
  content: "32";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 40 + "px");
}
.tile-container >>> .tile-5 {
  background-color: rgb(139, 193, 255);
}
.tile-container >>> .tile-6::before {
  content: "64";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 40 + "px");
}
.tile-container >>> .tile-6 {
  background-color: rgb(77, 148, 255);
}
.tile-container >>> .tile-7::before {
  content: "128";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 30 + "px");
}
.tile-container >>> .tile-7 {
  background-color: rgb(255, 255, 255);
}
.tile-container >>> .tile-8::before {
  content: "256";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 30 + "px");
}
.tile-container >>> .tile-8 {
  background-color: rgb(255, 255, 255);
}
.tile-container >>> .tile-9::before {
  content: "512";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 30 + "px");
}
.tile-container >>> .tile-9 {
  background-color: rgb(255, 255, 255);
}
.tile-container >>> .tile-10::before {
  content: "1024";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 30 + "px");
}
.tile-container >>> .tile-10 {
  background-color: rgb(255, 255, 255);
  box-shadow: 0 0 10px 0 white;
}
.tile-container >>> .tile-11::before {
  content: "2048";
  color: rgb(31, 31, 31);
  font-size: v-bind(layout.scale * layout.block.height / 69 * 30 + "px");
}
.tile-container >>> .tile-11 {
  background-color: rgb(255, 255, 255);
  box-shadow: 0 0 20px 5px white;
}
.tile-container >>> .tile-12::before {
  content: "4096";
  color: white;
  font-size: v-bind(layout.scale * layout.block.height / 69 * 30 + "px");
}
.tile-container >>> .tile-12 {
  background-color: rgb(31, 31, 31);
}
.tile-container >>> .tile-13::before {
  content: "8192";
  color: white;
  font-size: v-bind(layout.scale * layout.block.height / 69 * 30 + "px");
}
.tile-container >>> .tile-13 {
  background-color: rgb(31, 31, 31);
}
.tile-container >>> .tile-14::before {
  content: "16384";
  color: white;
  font-size: v-bind(layout.scale * layout.block.height / 69 * 23 + "px");
}
.tile-container >>> .tile-14 {
  background-color: rgb(161, 28, 28);
}
.tile-container >>> .tile-15::before {
  content: "32768";
  color: white;
  font-size: v-bind(layout.scale * layout.block.height / 69 * 23 + "px");
}
.tile-container >>> .tile-15 {
  background-color: rgb(154, 30, 255);
  box-shadow: 0 0 5px 2px rgb(154, 30, 255);
}

#board-data-hook {
  visibility: hidden;
  position: absolute;
}
</style>