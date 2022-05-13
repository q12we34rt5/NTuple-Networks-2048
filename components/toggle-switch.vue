<template>
  <div class="container">
    <div class="slider-container" @click="click()">
      <div class="slider" :class="value ? 'slider-1' : 'slider-0'"></div>
    </div>
    <span v-if="value === 0">{{ s0text }}</span>
    <span v-if="value === 1">{{ s1text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    size: {
      type: [Number],
      default: 20,
    },
    init: {
      type: [Number],
      default: 0,
    },
    s0text: {
      type: [String],
      default: "",
    },
    s1text: {
      type: [String],
      default: "",
    },
  },
  data() {
    return {
      value: this.init,
    };
  },
  methods: {
    click() {
      this.value = 1 - this.value;
      this.$emit("change", this.value);
    },
  },
  mounted() {
    this.$emit("change", this.value);
  },
};
</script>

<style scoped>
.container {
  height: v-bind(size + "px");
  display: flex;
  flex-direction: row;
  background: #046d00;
}
.slider-container {
  cursor: pointer;
  width: v-bind(1.5 * size + "px");
  height: v-bind(0.8 * size + "px");
  border: v-bind(0.1 * size + "px") solid rgb(91, 182, 88);
  border-radius: v-bind(0.9 * size + "px");
  background: #058b00;
  display: flex;
  box-shadow: inset 0 0 5px 0 black;
  margin-right: v-bind(0.3 * size + "px");
}
.slider {
  margin: auto;
  width: v-bind(0.75 * size + "px");
  height: v-bind(0.75 * size + "px");
  border-radius: 100%;
  background: white;
  transition: 0.2s;
}
.slider-0 {
  transform: translateX(v-bind(-0.35 * size + "px"));
}
.slider-1 {
  transform: translateX(v-bind(0.35 * size + "px"));
}
span {
  user-select: none;
  font: v-bind(size + "px") arial, sans-serif;
  line-height: v-bind(size + "px");
  color: white;
  text-shadow: v-bind(0.05 * size + "px") v-bind(0.05 * size + "px")
    v-bind(0.025 * size + "px") #00000041;
}
</style>