<template>
  <div class="board">
    <div class="card-container">
      <div class="card" v-for="info in files" :key="info">
        <FileInfo
          :file="info"
          :onUse="onUse"
          :onDownload="onDownload"
          :onDelete="onDelete"
        />
      </div>
      <div class="input-container">
        <label for="file-upload" class="file-upload">
          <div>Upload file</div>
        </label>
        <input ref="file-upload" id="file-upload" type="file" />
      </div>
    </div>
  </div>
</template>

<script>
import fileinfo from "./file-info.vue";
export default {
  props: {
    onFileUpload: {
      type: [Function],
      default: function () {},
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
  data() {
    return {
      files: [],
    };
  },
  methods: {
    find(path) {
      for (let i = 0; i < this.files.length; i++)
        if (this.files[i].path == path) return i;
      return -1;
    },
    addFile(info) {
      this.deleteFile(info.path);
      this.files.push(info);
    },
    deleteFile(path) {
      const index = this.find(path);
      if (index != -1) this.files.splice(index, 1);
    },
  },
  mounted() {
    let fileInput = this.$refs["file-upload"];
    let eventCallback = this.onFileUpload;
    fileInput.addEventListener("change", (e) => {
      if (fileInput.files.length == 0) return;
      let file = fileInput.files[0];
      eventCallback(file);
      fileInput.value = "";
    });
  },
  components: {
    FileInfo: fileinfo,
  },
};
</script>

<style scoped>
.board {
  width: 100%;
  height: 100%;
  /* box-shadow: inset 0 0 0 10px rgb(5, 139, 0), inset 0 0 0 16px #afffad; */
  box-shadow: inset 0 0 0 10px rgb(5, 139, 0), inset 2px 2px 3px 10px black;
  background: rgb(91, 182, 88);
}
.card-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.card {
  width: 96%;
  margin: 2% auto 0 auto;
}
.input-container {
  margin: 2% auto auto auto;
  margin-top: 2%;
  position: relative;
}
input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  border: 0;
}
.file-upload {
  margin: auto;
  display: inline-block;
  cursor: pointer;
  box-shadow: 2px 2px 3px 0px black;
  background: rgb(5, 139, 0);
}
.file-upload:hover {
  background: rgb(6, 187, 0);
}
.file-upload > div {
  width: auto;
  background: rgb(0, 0, 0);
  color: transparent;
  font: bold 20px arial, sans-serif;
  text-shadow: 2px 2px 4px rgb(73, 150, 70);
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
}
</style>