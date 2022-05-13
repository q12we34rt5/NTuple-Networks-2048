import * as Vue from "./lib/vue/vue.js";
import { loadModule } from "./lib/vue-loader/vue3-sfc-loader.esm.js";
import { addFile, addFileFromInput, getFileList, deleteFile } from "./engine/file-system.js";
import { readPatternInfo, Network } from "./engine/network.js";
import * as d3 from "https://cdn.skypack.dev/d3@7";

const options = {
    moduleCache: {
        vue: Vue
    },
    async getFile(url) {
        const res = await fetch(url);
        if (!res.ok)
            throw Object.assign(new Error(res.statusText + ' ' + url), { res });
        return {
            getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
        }
    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
    },
}

// game

class Game {

    static #hex = Array(16).fill("");
    static boardToBn(board) {
        Game.#hex = [];
        const len = board.length;
        board.forEach(function (v, i) {
            Game.#hex[len - i - 1] = v.toString(16);
        });
        return BigInt("0x" + Game.#hex.join(""));
    }

    jsboard = null;
    action_mapping = null;

    delay = 0;
    timer = null;
    autoreset = false;

    stopFunction = null;

    constructor({ jsboard }) {
        this.jsboard = jsboard;
        this.action_mapping = [jsboard.ACTIONS.UP, jsboard.ACTIONS.RIGHT, jsboard.ACTIONS.DOWN, jsboard.ACTIONS.LEFT];
    }

    playInJs(network) {
        if (this.timer != null)
            return;

        const learning = network.learning;
        const jsboard = this.jsboard;

        // fast reference
        const action_mapping = this.action_mapping;
        const data = jsboard.board.data;
        const boardToBn = Game.boardToBn;
        const jsboardmove = jsboard.move;

        const startGame = () => {
            const move = learning.select_best_move(boardToBn(data));
            jsboardmove(action_mapping[move]);

            // next step
            this.timer = setTimeout(startGame, this.delay);
        };

        // set game start/over callback
        jsboard.onStateChanged = () => {
            if (jsboard.state == 0) {
                if (this.autoreset)
                    jsboard.reset();
                else
                    clearTimeout(this.timer);
            } else if (jsboard.state == 1) {
                startGame();
            }
        };

        // remove onStateChanged callback
        this.stopFunction = () => {
            jsboard.onStateChanged = null;
        };

        startGame();
    }

    playInJsAndWasm(network) {
        const learning = network.learning;
    }

    playInWasm(network) {
        const learning = network.learning;
    }

    setDelay(delay) {
        this.delay = delay;
    }

    setAutoReset(value) {
        this.autoreset = value;
    }

    stop() {
        if (this.timer != null)
            clearTimeout(this.timer);
        this.timer = null;
        if (this.stopFunction)
            this.stopFunction();
        this.stopFunction = null;
    }

}

class NetworksManager {

    networks = [];

    lastCreate = null;

    currentUse = null;

    events = {
        createNetwork: function () { },
        deleteNetwork: function () { },
        useNetwork: function () { },
    };

    findNetwork(name) {
        for (let i = 0; i < this.networks.length; i++)
            if (this.networks[i].name == name)
                return i;
        return -1;
    }

    createNetwork(name, patterns) {
        if (name == "") { // check
            console.warn(`Network name can not be empty.`);
            return false;
        }
        if (this.findNetwork(name) != -1) { // check
            console.warn(`Network '${name}' is already exists.`);
            return false;
        }
        // remove empty patterns
        const filter_patterns = [];
        patterns.forEach(p => {
            if (p.pattern.length)
                filter_patterns.push(p)
        });
        if (filter_patterns.length == 0) { // check
            console.warn(`Patterns are empty.`);
            return false;
        }
        // create network without allocate memory
        const network = new Network(filter_patterns);
        this.lastCreate = {
            name: name,
            network: network
        };
        this.networks.push(this.lastCreate);
        // dispatch event
        this.events.createNetwork({
            type: "createNetwork",
            value: this.lastCreate
        });
        document.network = this.lastCreate;
        return true;
    }

    createNetworkFromFile(path) {
        const name = path.substring(1);
        if (name == "") { // check
            console.warn(`Network name can not be empty.`);
            return false;
        }
        if (this.findNetwork(name) != -1) { // check
            console.warn(`Network '${name}' is already exists.`);
            return false;
        }
        // create network and allocate memory
        const network = new Network();
        network.load(path);
        this.lastCreate = {
            name: name,
            network: network
        };
        this.networks.push(this.lastCreate);
        // dispatch event
        this.events.createNetwork({
            type: "createNetwork",
            value: this.lastCreate
        });
        return true;
    }

    deleteNetwork(name) {
        const index = this.findNetwork(name);
        if (index == -1) {
            return false;
        }
        const network = this.networks[index];
        if (!network.network.release())
            return false;
        if (this.currentUse == network) {
            this.currentUse = null;
            // dispatch event
            this.events.useNetwork({
                type: "useNetwork",
                value: this.currentUse
            });
        }
        if (this.lastCreate == network) {
            this.lastCreate = null;
        }
        this.networks.splice(index, 1);
        this.events.deleteNetwork({
            type: "deleteNetwork",
            value: name
        });
        return true;
    }

    useNetwork(name) {
        const index = this.findNetwork(name);
        if (index == -1) {
            return false;
        }
        this.currentUse = this.networks[index];
        // dispatch event
        this.events.useNetwork({
            type: "useNetwork",
            value: this.currentUse
        });
        return true;
    }

    allocateMemory(name) {
        const index = this.findNetwork(name);
        if (index == -1)
            return;
        this.networks[index].network.create();
    }

    releaseMemory(name) {
        const index = this.findNetwork(name);
        if (index == -1)
            return;
        this.networks[index].network.release();
    }

    getCurrentUse() {
        return this.currentUse;
    }

    getLastCreate() {
        return this.lastCreate;
    }

    getNetworks() {
        return this.networks;
    }

}

const App = await loadModule("./components/App.vue", options);
const app = Vue.createApp(App, {
    onFileUpload: onUploadFile,
    onUse: onUseFile,
    onDownload: onDownloadFile,
    onDelete: onDeleteFile,
    onCreateNetwork: onCreateNetwork,
    onUseNetwork: onUseNetwork,
    onSaveNetwork: onSaveNetwork,
    onDeleteNetwork: onDeleteNetwork,
    onRenameNetwork: onRenameNetwork,
    onAllocateMemory: onAllocateMemory,
    onReleaseMemory: onReleaseMemory,
    onPlayGame: onPlayGame,
    onStartTraining: onStartTraining,
    onStopTraining: onStopTraining,
    onWindowResize: onWindowResize,
    onReset: onReset,
}).mount('#app');

const game = new Game({ jsboard: app.board });
app.board.animation.enable = false;
game.setDelay(0);
game.setAutoReset(false);

const controller = new NetworksManager();
controller.events.createNetwork = function (event) {
    app.networks.addNetwork({
        name: event.value.name
    });
    controller.useNetwork(event.value.name);
}
controller.events.deleteNetwork = function (event) {
    app.networks.deleteNetwork(event.value);
}
controller.events.useNetwork = function (event) {
    let patterns = [], name = "", state = -1;
    if (event.value != null) {
        patterns = event.value.network.patterns;
        name = event.value.name;
        state = event.value.network.state;
    }
    app.patternsel.setPatterns(patterns);
    app.networks.setCurrentUse(name);
    switch (state) {
        case Network.AVAILABLE:
            app.networks.setState("available");
            break;
        case Network.UNAVAILABLE:
            app.networks.setState("unavailable");
            break;
        case Network.TRAINING:
            app.networks.setState("training");
            break;
        default:
            app.networks.setState("");
            return;
    }
    // remove callback
    controller.getNetworks().forEach(net => {
        net.network.events.onStatisticChanged = null;
    });
    const network = event.value.network;
    // set d3 callback
    network.events.onStatisticChanged = onStatisticChanged;
}

// File system events
async function onUploadFile(file) {
    let filepath = await addFile(file);
    app.filesys.addFile({
        path: filepath
    });
}
function onUseFile(path) {
    if (!controller.createNetworkFromFile(path)) {
        return;
    }
    const network = controller.getLastCreate();
    controller.useNetwork(network.name);
}
function onDownloadFile(path) {
    // console.log(path);

}
function onDeleteFile(path) {
    deleteFile(path);
    app.filesys.deleteFile(path);
}

// Networks events
function onCreateNetwork(name) {
    if (controller.createNetwork(name, app.patternsel.getPatterns())) {
        controller.allocateMemory(name);
    }
    controller.useNetwork(name);
}
function onUseNetwork(name) {
    controller.useNetwork(name);
}
function onSaveNetwork(name) {
    // console.log("onSaveNetwork");
}
function onDeleteNetwork(name) {
    // console.log("onDeleteNetwork");
    controller.deleteNetwork(name);
}
function onRenameNetwork() {

}
function onAllocateMemory() {

}
function onReleaseMemory() {

}
function onPlayGame() {
    const network = controller.getCurrentUse();
    if (network == null) {
        console.log(`No model on use.`);
        return;
    }
    if (network.network.state != Network.AVAILABLE) {
        console.log(`Failed to play game with model ${network.name}. (model state: ${network.network.state})`);
        return;
    }
    game.stop();
    game.playInJs(network.network);
}
function onStartTraining() {
    const network = controller.getCurrentUse();
    if (network == null)
        return;
    if (network.network.startTraining()) {
        console.log("Training start...");

        controller.useNetwork(network.name);

        network.network.events.onTrainStop = function () {
            controller.useNetwork(network.name);
        }
    }
}
function onStopTraining() {
    const network = controller.getCurrentUse();
    if (network == null)
        return;
    network.network.stopTraining();
    console.log("Training stoped.");
}

function onWindowResize() {

}

function onReset() {
    app.board.reset();
    game.stop();
}

const tstatistic = app.networks.tstatistic;

// set the dimensions and margins of the graph
let margin = { top: 40, right: 40, bottom: 40, left: 70 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select(tstatistic)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 600 400`)
    .style("width", "100%")
    .style("height", "100%")
    .style("background", "white")
    // translate this svg element to leave some margin.
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
drawAxis([0, 100], [0, 100]);

function drawAxis(xrange, yrange) {
    let x = d3.scaleLinear()
        .domain(xrange)
        .range([0, width]);
    svg
        .append('g')
        .attr("transform", "translate(0," + height + ")")
        .style("font-size", "20px")
        .call(d3.axisBottom(x));

    let y = d3.scaleLinear()
        .domain(yrange)
        .range([height, 0]);
    svg
        .append('g')
        .style("font-size", "20px")
        .call(d3.axisLeft(y));
    return [x, y];
}

function drawData(data, x, y) {
    svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.episode); })
            .y(function (d) { return y(d.mean); })
        );
}

function onStatisticChanged(e) {
    const data = e.value;
    const last_datum = data[data.length - 1];
    const xrange = [0, last_datum.episode];
    const yrange = [0, last_datum.max_avg_score];
    svg.selectAll("*").remove()
    const [x, y] = drawAxis(xrange, yrange);
    drawData(data, x, y);
}


window.addEventListener("keydown", app.board.keyEventCallback);
app.board.mapTile();
app.board.reset();

app.board.animation.enable = true;
app.board.enablehook = false;