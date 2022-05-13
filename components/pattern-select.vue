<template>
  <div ref="pattern-container" id="pattern-container">
    <div
      class="pattern-placeholder"
      :class="i <= n_patterns + 1 ? '' : 'hidden-div'"
      v-for="i in max_patterns"
      :key="i"
    >
      <div class="tdpattern-container">
        <TdPattern
          class="td-pattern"
          :class="i <= n_patterns ? '' : 'hidden-div'"
          :onValueChanged="() => updatePattern(i - 1)"
          :scale="layout.pattern.scale"
          :width="layout.pattern.width"
          :height="layout.pattern.height"
          :ref="`pattern${i - 1}`"
        />
      </div>
      <div
        v-if="i <= n_patterns"
        :ref="`del${i}`"
        class="delete-pattern"
        @click="deletePattern(i - 1)"
        @mouseenter="() => ($refs[`del${i}`].style.opacity = 1)"
        @mouseleave="() => ($refs[`del${i}`].style.opacity = 0)"
      ></div>
      <div
        v-if="i == n_patterns + 1"
        id="add-pattern"
        @click="addPattern()"
      ></div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import tdpattern from "./td-pattern.vue";
export default {
  data() {
    return {
      layout: {
        pattern: {
          scale: 1,
          width: 145,
          height: 145,
          n_in_row: 6,
        },
      },
      ro: null,
      n_patterns: 0,
      patterns: [],
      max_patterns: 18,
    };
  },
  methods: {
    onResize() {
      // pattern resize
      const pattern_container_width =
        this.$refs["pattern-container"].offsetWidth;
      this.layout.pattern.scale =
        ((0.9 / this.layout.pattern.n_in_row) * pattern_container_width) /
        this.layout.pattern.width;
      for (let i = 0; i < this.max_patterns; i++) {
        const ref_elem = this.$refs[`pattern${i}`];
        ref_elem.layout.scale = this.layout.pattern.scale;
      }
    },
    addPattern() {
      this.n_patterns++;
      this.patterns.push({
        pattern: [],
        isomorphic: 8,
      });
    },
    deletePattern(i) {
      this.patterns.splice(i, 1);
      this.n_patterns--;
      for (let j = 0; j < this.n_patterns; j++) {
        const ref_elem = this.$refs[`pattern${j}`];
        const ref_pattern = this.patterns[j].pattern;
        for (let k = 0; k < 16; k++) {
          ref_elem.patterns[k] = 0;
        }
        ref_pattern.forEach((e) => (ref_elem.patterns[e] = 1));
      }
    },
    updatePattern(i) {
      const arr = [];
      this.$refs[`pattern${i}`].patterns.forEach((e, index) => {
        if (e) arr.push(index);
      });
      this.patterns[i].pattern = arr;
    },
    setPatterns(patterns) {
      this.patterns.splice(0, this.patterns.length);
      patterns.forEach((p) => {
        this.patterns.push({
          pattern: p.pattern.slice(),
          isomorphic: p.isomorphic,
        });
      });
      if (this.n_patterns == patterns.length) this.mapPatterns();
      else this.n_patterns = patterns.length;
    },
    getPatterns() {
      const patterns = [];
      for (let i = 0; i < this.patterns.length; i++) {
        patterns.push({
          pattern: this.patterns[i].pattern.slice(),
          isomorphic: this.patterns[i].isomorphic,
        });
      }
      return patterns;
    },
    mapPatterns() {
      const temp = Array(16);
      this.patterns.forEach((p, i) => {
        const ref_elem = this.$refs[`pattern${i}`];
        temp.fill(0);
        p.pattern.forEach((k) => (temp[k] = 1));
        temp.forEach((v, k) => {
          if (v != ref_elem.patterns[k]) ref_elem.patterns[k] = v;
        });
      });
    },
  },
  computed: {
    placeholderCount() {
      return (
        ((((this.n_patterns - 1) / this.layout.pattern.n_in_row) | 0) + 2) *
        this.layout.pattern.n_in_row
      );
    },
  },
  mounted() {
    this.ro = new ResizeObserver(this.onResize).observe(
      this.$refs["pattern-container"]
    );
  },
  beforeDestroy() {
    this.ro.unobserve(this.$refs["pattern-container"]);
  },
  components: {
    TdPattern: tdpattern,
  },
};
</script>

<style scoped>
.td-pattern {
  margin: auto;
}
#pattern-container {
  width: 100%;
  height: 0%;
  padding: 0.2% 1%;
  display: flex;
  flex-wrap: wrap;
}
.pattern-placeholder {
  margin: 1.2% auto 0 auto;
  width: v-bind(100 / layout.pattern.n_in_row + "%");
  position: relative;
}
#add-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0%;
  padding-bottom: 100%;
  margin: auto;
  box-shadow: 2px 2px 3px 1px black, inset 0 0 0 5px #afffad, 0 0 0 10px #5bb658,
    -2px -2px 3px 10px black;
  background: #5bb658;
  border-radius: 50%;
  transform: scale(0.5);
  cursor: pointer;
}
#add-pattern:hover {
  background: #71e06e;
}
#add-pattern:active {
  box-shadow: -2px -2px 3px 1px black, inset 0 0 0 5px #afffad,
    0 0 0 10px #5bb658, -2px -2px 3px 10px black;
}
#add-pattern::before {
  content: "";
  width: 100%;
  padding-bottom: 100%;
  background: #afffad;
  transform: scaleX(0.08) scaleY(0.5);
  position: absolute;
}
#add-pattern:after {
  content: "";
  width: 100%;
  padding-bottom: 100%;
  background: #afffad;
  transform: scaleX(0.5) scaleY(0.08);
  position: absolute;
}
.delete-pattern {
  position: absolute;
  left: 90%;
  top: -10%;
  width: 15%;
  height: 15%;
  border-radius: 50%;
  background: red;
  border: 2px solid #ff8c8c;
  transform: rotate(45deg);
  opacity: 0;
  z-index: 1;
  cursor: pointer;
}
.delete-pattern:active {
  background: rgb(184, 0, 0);
}
.delete-pattern::before {
  content: "";
  width: 100%;
  padding-bottom: 100%;
  background: #ff8c8c;
  transform: scaleX(0.08) scaleY(0.5);
  position: absolute;
}
.delete-pattern:after {
  content: "";
  width: 100%;
  padding-bottom: 100%;
  background: #ff8c8c;
  transform: scaleX(0.5) scaleY(0.08);
  position: absolute;
}
.hidden-div {
  visibility: hidden;
}
</style>