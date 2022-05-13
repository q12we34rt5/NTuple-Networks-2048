<template>
  <div ref="Tdl2048" class="Tdl2048">
    <div class="container">
      <div ref="game-container" class="game-container">
        <TdBoard ref="board" class="td-board" />
        <div class="reset-board" @click="onReset()">reset</div>
      </div>
      <div class="network-container">
        <div class="setting-container">
          <div class="patternsel-container" ref="patternsel-container">
            <TdPatternSel ref="patternsel" />
          </div>
          <div class="tdnetwork-container">
            <TdNetworks
              ref="networks"
              :widthscale="layout.widthscale"
              :onCreateNetwork="onCreateNetwork"
              :onUseNetwork="onUseNetwork"
              :onSaveNetwork="onSaveNetwork"
              :onDeleteNetwork="onDeleteNetwork"
              :onRenameNetwork="onRenameNetwork"
              :onAllocateMemory="onAllocateMemory"
              :onReleaseMemory="onReleaseMemory"
              :onPlayGame="onPlayGame"
              :onStartTraining="onStartTraining"
              :onStopTraining="onStopTraining"
            />
          </div>
        </div>
        <div class="fs-container">
          <FileSys
            ref="filesys"
            :onFileUpload="onFileUpload"
            :onUse="onUse"
            :onDownload="onDownload"
            :onDelete="onDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tdboard from "./td-board.vue";
import tdpatternsel from "./pattern-select.vue";
import filesys from "./file-sys.vue";
import tdnetwork from "./networks.vue";
export default {
  props: {
    onWindowResize: { type: [Function] },
    onFileUpload: { type: [Function] },
    onUse: { type: [Function] },
    onDownload: { type: [Function] },
    onDelete: { type: [Function] },
    onCreateNetwork: { type: [Function] },
    onUseNetwork: { type: [Function] },
    onSaveNetwork: { type: [Function] },
    onDeleteNetwork: { type: [Function] },
    onRenameNetwork: { type: [Function] },
    onAllocateMemory: { type: [Function] },
    onReleaseMemory: { type: [Function] },
    onPlayGame: { type: [Function] },
    onStartTraining: { type: [Function] },
    onStopTraining: { type: [Function] },
    onReset: { type: [Function] },
  },
  data() {
    return {
      layout: {
        widthscale: 1,
        design: {
          width: 1920,
        },
        patternselheight: 0,
      },
      ros: {
        app: null,
        sel: null,
      },
      n_patterns: 0,
      patterns: [],
    };
  },
  methods: {
    onResize() {
      //this.layout.width = document.body.clientWidth;
      //this.layout.height =
      //  (document.body.clientWidth * window.innerHeight) / window.innerWidth;
      this.layout.widthscale =
        this.$refs.Tdl2048.clientWidth / this.layout.design.width;
      // game resize
      const game_container_width = this.$refs["game-container"].offsetWidth;
      const board = this.$refs["board"];
      board.layout.scale =
        (0.8 * game_container_width) / board.layout.board.width;

      if (this.onWindowResize) this.onWindowResize();
    },
  },
  computed: {
    board() {
      return this.$refs.board;
    },
    patternsel() {
      return this.$refs.patternsel;
    },
    networks() {
      return this.$refs.networks;
    },
    filesys() {
      return this.$refs.filesys;
    },
  },
  mounted() {
    this.ros.app = new ResizeObserver(this.onResize).observe(
      this.$refs.Tdl2048
    );
    this.ros.sel = new ResizeObserver(() => {
      this.layout.patternselheight =
        this.$refs["patternsel-container"].clientHeight;
    }).observe(this.$refs["patternsel-container"]);
  },
  beforeDestroy() {
    this.ros.app.unobserve(this.$refs.Tdl2048);
    this.ros.sel.unobserve(this.$refs["patternsel-container"]);
  },
  components: {
    TdBoard: tdboard,
    TdPatternSel: tdpatternsel,
    FileSys: filesys,
    TdNetworks: tdnetwork,
  },
};
</script>

<style scoped>
.Tdl2048 {
  background: rgb(5, 139, 0);
  position: relative;
  width: 100vw;
  height: 100vh;
  /* width: v-bind(layout.width + "px"); */
  /* height: v-bind(layout.height + "px"); */
}
.td-board {
  margin: auto;
}
.td-pattern {
  margin: auto;
}
.container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
}
.game-container {
  width: 30%;
  height: 92%;
  margin: auto;
  margin-right: 0;
  display: flex;
  position: relative;
  box-shadow: 0 0 0 6px #afffad;
}
.network-container {
  width: 60%;
  height: 92%;
  margin: auto;
  display: flex;
  position: relative;
  box-shadow: 0 0 0 6px #afffad;
}
.setting-container {
  width: 60%;
  display: flex;
  flex-direction: column;
}
.fs-container {
  width: 40%;
}
.patternsel-container {
  width: 100%;
  margin: auto;
}
.tdnetwork-container {
  width: 100%;
  height: calc(100% - v-bind(layout.patternselheight + "px"));
  margin: auto;
}
.reset-board {
  left: 30%;
  top: 80%;
  width: 40%;
  position: absolute;
  text-align: center;
  color: white;
  cursor: pointer;
  user-select: none;
  border-radius: v-bind(layout.widthscale * 10 + "px");
  text-shadow: v-bind(layout.widthscale * 2 + "px")
    v-bind(layout.widthscale * 2 + "px") v-bind(layout.widthscale * 5 + "px")
    #00000041;
  box-shadow: inset 0 0 v-bind(layout.widthscale * 5 + "px") 0 black;
  border: v-bind(layout.widthscale * 5 + "px") solid rgb(91, 182, 88);
  line-height: v-bind(layout.widthscale * 50 + "px");
  font-size: v-bind(layout.widthscale * 50 + "px");
}
.reset-board:hover {
  background: rgb(6, 187, 0);
}
</style>