<template>
  <div class="container">
    <div class="controller">
      <div class="name-container">
        <input
          type="text"
          placeholder="Set network name here"
          v-model="networkname"
        />
      </div>
      <div
        class="create-network button-style"
        @click="onCreateNetwork(networkname)"
      >
        <span> create network </span>
      </div>
      <div v-if="false" class="button-style" @click="onRenameNetwork(networkname)">
        <span> rename network </span>
      </div>
      <div v-if="false" class="button-style" @click="onAllocateMemory(networkname)">
        <span> allocate memory </span>
      </div>
      <div v-if="false" class="button-style" @click="onReleaseMemory(networkname)">
        <span> release memory </span>
      </div>
      <table>
        <tbody>
          <tr class="current-use">
            <td>
              <span> current: </span>
            </td>
            <td>
              <span>{{ current }}</span>
            </td>
          </tr>
          <tr class="current-state">
            <td>
              <span> state: </span>
            </td>
            <td>
              <span>{{ state }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="switch-container">
        <ToggleSwitch
          @change="(value) => (controllermode = value)"
          :size="widthscale * 30"
          :init="0"
          :s0text="'play mode'"
          :s1text="'train mode'"
        />
      </div>
      <div class="play-container" :class="!controllermode ? '' : 'hidden-div'">
        <div class="button-style" @click="onPlayGame(networkname)">
          <span> play game </span>
        </div>
      </div>
      <div class="train-container" :class="controllermode ? '' : 'hidden-div'">
        <div class="button-style" @click="onStartTraining(networkname)">
          <span> start training </span>
        </div>
        <div class="button-style" @click="onStopTraining(networkname)">
          <span> stop training </span>
        </div>
        <div class="training-statistic" ref="training-statistic"></div>
      </div>
    </div>
    <div class="network-list">
      <div class="card" v-for="info in networks" :key="info">
        <NetworkInfo
          :widthscale="widthscale"
          :info="info"
          :onUse="onUseNetwork"
          :onSave="onSaveNetwork"
          :onDelete="onDeleteNetwork"
        />
      </div>
    </div>
  </div>
</template>

<script>
import networkinfo from "./network-info.vue";
import toggleswitch from "./toggle-switch.vue";
export default {
  props: {
    widthscale: {
      type: [Number],
      default: 1,
    },
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
  },
  data() {
    return {
      networks: [],
      networkname: "",
      current: "",
      state: "",
      controllermode: 0,
    };
  },
  methods: {
    find(name) {
      for (let i = 0; i < this.networks.length; i++)
        if (this.networks[i].name == name) return i;
      return -1;
    },
    addNetwork(info) {
      this.deleteNetwork(info.name);
      this.networks.push(info);
    },
    deleteNetwork(name) {
      const index = this.find(name);
      if (index != -1) this.networks.splice(index, 1);
    },
    setCurrentUse(name) {
      this.current = name;
    },
    setState(state) {
      this.state = state;
    },
  },
  computed: {
    tstatistic() {
      return this.$refs["training-statistic"];
    },
  },
  components: {
    NetworkInfo: networkinfo,
    ToggleSwitch: toggleswitch,
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
.controller {
  width: 50%;
  height: calc(100% - 20px);
  background: #046d00;
  border-top: 10px solid #058b00;
  border-bottom: 10px solid #058b00;
  border-left: 10px solid #058b00;
  overflow-y: auto;
}
::-webkit-scrollbar {
  display: none;
}
.name-container {
  width: calc(100% - 4px);
  height: v-bind(widthscale * 40 + "px");
  border: v-bind(widthscale * 2 + "px") solid #046d00;
  border-bottom: v-bind(widthscale * 3 + "px") solid #023d00;
  background: #5bb658;
  position: relative;
  display: flex;
  overflow: hidden;
}
.name-container > input {
  width: 100%;
  height: 100%;
  margin: auto;
  outline: none;
  background: #5bb658;
  border: 0;
  font: v-bind(widthscale * 30 + "px") arial, sans-serif;
  line-height: v-bind(widthscale * 30 + "px");
  color: rgb(58, 58, 58);
  text-shadow: 1px 1px 2px #00000041;
  box-shadow: inset 1px 1px 2px 0px black;
}
.button-style {
  user-select: none;
  background: #76ff74;
  border-left: v-bind(widthscale * 3 + "px") solid #046d00;
  border-right: v-bind(widthscale * 3 + "px") solid #046d00;
  border-bottom: v-bind(widthscale * 3 + "px") solid #023d00;
  text-shadow: 1px 1px 2px #00000041;
  font: v-bind(widthscale * 30 + "px") arial, sans-serif;
  color: rgb(58, 58, 58);
  filter: blur(0.3px);
  cursor: pointer;
}
.button-style:hover {
  background: #00ff15;
}
.button-style > span {
  margin-left: 10px;
}
.switch-container {
  padding-left: v-bind(widthscale * 5 + "px");
  border-bottom: v-bind(widthscale * 3 + "px") solid #023d00;
}
.current-use,
.current-state {
  font: v-bind(widthscale * 25 + "px") arial, sans-serif;
  line-height: v-bind(widthscale * 30 + "px");
  text-shadow: 1px 1px 2px #00000041;
  filter: blur(0.3px);
  color: white;
}
.current-use span,
.current-state span {
  margin-left: 10px;
}
.training-statistic {
  width: 100%;
}
.network-list {
  width: 50%;
  height: calc(100% - 20px);
  background: #5bb658;
  border-top: 10px solid #058b00;
  border-bottom: 10px solid #058b00;
  border-left: 10px solid #058b00;
  box-shadow: inset 2px 2px 3px 0 black;
}
.card {
  width: 96%;
  margin: 2% auto 0 auto;
}
.hidden-div {
  height: 0;
  visibility: hidden;
}
</style>