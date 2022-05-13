import Module from "./core/index.js";

const file_list = [];

function addFile(file) {
    return new Promise((resolve, reject) => {
        const file_name = file.name;
        const fr = new FileReader();
        fr.onload = function () {
            var data = new Uint8Array(fr.result);
            const file_path = `/${file_name}`;
            try { deleteFile(file_path); } catch (e) { }
            Module.FS_createDataFile("/", file_name, data, true, true, true);
            file_list.push(file_path);
            resolve(file_path);
        };
        fr.readAsArrayBuffer(file);
    });
}

async function addFileFromInput(fileInput) {
    if (fileInput.files.length == 0)
        throw new Error("No input file.");
    let file = fileInput.files[0];
    let result = await addFile(file);
    fileInput.value = "";
    return result;
}

function getFileList() {
    return file_list.slice();
}

function deleteFile(path) {
    Module.FS_unlink(path);
    file_list.splice(file_list.indexOf(path), 1);
}

export { addFile, addFileFromInput, getFileList, deleteFile };

document.fgo = Module;