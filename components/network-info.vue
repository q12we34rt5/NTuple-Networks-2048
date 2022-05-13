<template>
  <div class="card">
    <span>{{ info.name }}</span>
    <div class="use" @click="onUse(info.name)">↩</div>
    <div class="save" @click="onSave(info.name)">🖫</div>
    <div class="delete" @click="onDelete(info.name)">🗑</div>
  </div>
</template>

<script>
export default {
  props: {
    widthscale: {
      type: [Number],
      default: 1,
    },
    info: {
      type: [Object],
    },
    onUse: {
      type: [Function],
      default: function () {},
    },
    onSave: {
      type: [Function],
      default: function () {},
    },
    onDelete: {
      type: [Function],
      default: function () {},
    },
  },
};
</script>

<style scoped>
.card {
  width: 100%;
  height: v-bind(widthscale * 50 + "px");
  margin: auto;
  background: #058b00;
  box-shadow: v-bind(widthscale * 2 + "px") v-bind(widthscale * 2 + "px")
    v-bind(widthscale * 3 + "px") 0 black;
  display: flex;
  position: relative;
  font: v-bind(widthscale * 20 + "px") arial, sans-serif;
  line-height: v-bind(widthscale * 20 + "px");
  color: white;
}
.card > span {
  margin: auto auto auto v-bind(widthscale * 10 + "px");
}
.use,
.save,
.delete {
  width: v-bind(widthscale * 30 + "px");
  height: v-bind(widthscale * 30 + "px");
  text-align: center;
  font-size: v-bind(widthscale * 30 + "px");
  line-height: v-bind(widthscale * 30 + "px");
  border: v-bind(widthscale * 4 + "px") solid rgb(91, 182, 88);
  box-shadow: inset 0 0 v-bind(widthscale * 5 + "px") 0 black;
  cursor: pointer;
  user-select: none;
}
.use:hover,
.save:hover,
.delete:hover {
  background: #06bb00;
}
.use {
  margin: auto v-bind(widthscale * 7.5 + "px") auto 0;
}
.save {
  margin: auto v-bind(widthscale * 7.5 + "px") auto 0;
}
.delete {
  margin: auto v-bind(widthscale * 7.5 + "px") auto 0;
}
</style>