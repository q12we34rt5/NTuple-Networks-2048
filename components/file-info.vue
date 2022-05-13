<template>
  <div class="card">
    <span>{{ file.path }}</span>
    <div class="use" @click="onUse(file.path)">↩</div>
    <div class="download" @click="onDownload(file.path)">⇩</div>
    <div class="delete" @click="onDelete(file.path)">🗑</div>
  </div>
</template>

<script>
export default {
  props: {
    file: {
      type: [Object],
    },
    onUse: {
      type: [Function],
      default: function () {},
    },
    onDownload: {
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
  height: 60px;
  margin: auto;
  background: #058b00;
  box-shadow: 2px 2px 3px 0px black;
  display: flex;
  position: relative;
  font: 20px arial, sans-serif;
  line-height: 20px;
  color: white;
}
.card > span {
  margin: auto auto auto 10px;
}
.use,
.download,
.delete {
  width: 35px;
  height: 35px;
  text-align: center;
  font-size: 35px;
  line-height: 35px;
  border: 5px solid rgb(91, 182, 88);
  box-shadow: inset 0 0 5px 0 black;
  cursor: pointer;
  user-select: none;
}
.use:hover,
.download:hover,
.delete:hover {
  background: rgb(6, 187, 0);
}
.use {
  margin: auto 7.5px auto 0;
}
.download {
  margin: auto 7.5px auto 0;
}
.delete {
  margin: auto 7.5px auto 0;
}
</style>