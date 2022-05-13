<template>
  <div class="pattern-board">
    <div class="block-container" v-for="i in 16" :key="i">
      <div
        class="block"
        @mouseenter="enter(i - 1)"
        @mouseleave="leave(i - 1)"
        @click="click(i - 1)"
      >
        <div v-if="patterns[i - 1] == 1" class="selected">
          <div class="selected-point"></div>
          <div v-if="checkConnect(i - 1, 0)" class="connect-up">
            <div></div>
          </div>
          <div v-if="checkConnect(i - 1, 1)" class="connect-right">
            <div></div>
          </div>
          <div v-if="checkConnect(i - 1, 2)" class="connect-down">
            <div></div>
          </div>
          <div v-if="checkConnect(i - 1, 3)" class="connect-left">
            <div></div>
          </div>
        </div>
        <div v-if="patterns[i - 1] == 2" class="selected-hint"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    scale: {
      type: [Number],
      default: 1,
    },
    width: {
      type: [Number],
      default: 145,
    },
    height: {
      type: [Number],
      default: 145,
    },
    onValueChanged: {
      type: [Function],
      default: function () {},
    },
  },
  data() {
    return {
      layout: {
        scale: this.scale,
        board: {
          width: this.width,
          height: this.height,
          padding: 1,
        },
        block: {
          width: 33,
          height: 33,
        },
      },
      patterns: Array(16).fill(0),
    };
  },
  methods: {
    click(i) {
      if (this.patterns[i] == 1) this.patterns[i] = 0;
      else this.patterns[i] = 1;
      this.onValueChanged();
    },
    enter(i) {
      if (this.patterns[i] != 1) this.patterns[i] = 2;
    },
    leave(i) {
      if (this.patterns[i] != 1) this.patterns[i] = 0;
    },
    checkConnect(i, dir) {
      const dir_offset = [-4, 1, 4, -1];
      const neighbor_index = i + dir_offset[dir];
      if (neighbor_index < 0 || neighbor_index > 15) return false;
      if (dir == 1 && i % 4 == 3) return false;
      if (dir == 3 && i % 4 == 0) return false;
      if (this.patterns[neighbor_index] == 1) return true;
      return false;
    },
  },
};
</script>

<style scoped>
.pattern-board {
  background-color: rgb(5, 139, 0);
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  border-radius: 4%;
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
  box-shadow: inset 0px 0px 3px 1px rgba(0, 0, 0, 0.8);
  margin: auto;
  position: relative;
  display: flex;
  border-radius: 10%;
  cursor: pointer;
  width: v-bind(layout.scale * layout.block.width + "px");
  height: v-bind(layout.scale * layout.block.height + "px");
}

.selected,
.selected-hint {
  width: 40%;
  height: 40%;
  margin: auto;
  display: flex;
  border-radius: 100%;
  position: relative;
  filter: blur(0.4px);
}

.selected-hint {
  background-color: #ffffff50;
  box-shadow: 0 0 0 v-bind(layout.scale * 2.5 + "px") #00000050;
}

.selected-point {
  width: 100%;
  height: 100%;
  margin: auto;
  border-radius: 100%;
  background-color: white;
  box-shadow: 0 0 0 v-bind(layout.scale * 2.5 + "px") black;
  z-index: 1;
}

.connect-up,
.connect-right,
.connect-down,
.connect-left {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: auto;
  background: white;
}
.connect-up {
  box-shadow: inset 7px 0px 0px 0px black, inset -7px 0px 0px 0px black;
  transform: scaleX(0.7) scaleY(0.94) translateY(-100%);
}
.connect-right {
  box-shadow: inset 0px 7px 0px 0px black, inset 0px -7px 0px 0px black;
  transform: scaleX(0.94) scaleY(0.7) translateX(100%);
}
.connect-down {
  box-shadow: inset 7px 0px 0px 0px black, inset -7px 0px 0px 0px black;
  transform: scaleX(0.7) scaleY(0.94) translateY(100%);
}
.connect-left {
  box-shadow: inset 0px 7px 0px 0px black, inset 0px -7px 0px 0px black;
  transform: scaleX(0.94) scaleY(0.7) translateX(-100%);
}

.connect-up > div,
.connect-right > div,
.connect-down > div,
.connect-left > div {
  background: white;
}
.connect-up > div {
  width: 100%;
  height: 110%;
  transform: scaleX(0.5);
}
.connect-right > div {
  margin-right: -10%;
  width: 110%;
  height: 100%;
  transform: scaleY(0.5);
}
.connect-down > div {
  margin-bottom: -10%;
  width: 100%;
  height: 110%;
  transform: scaleX(0.5);
}
.connect-left > div {
  width: 110%;
  height: 100%;
  transform: scaleY(0.5);
}
</style>