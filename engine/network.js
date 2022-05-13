import Module from "./core/index.js";
import * as FileSystem from "./file-system.js"

const reader = new Module.PatternInfoReader();

function readPatternInfo(path) {
    reader.read(path);
    return reader.infos();
}

// const WORKER_PATH = "./engine/worker.js";

class Network {

    static UNAVAILABLE = 0;
    static AVAILABLE = 1;
    static TRAINING = 2;

    state = Network.UNAVAILABLE;

    patterns = null;
    learning = null;

    alpha = 0.1;
    episode = 0;

    max_avg_score = 0;

    // worker = new Worker(WORKER_PATH, { type: "module" });

    maximum_statistic = 100000;
    statistic_length = 100;

    statistic = Array(0);

    events = {
        onTrainStop: null,
        onStatisticChanged: null
    };

    /**
     * @param {pattern[]} patterns 
     */
    constructor(patterns = null) {
        this.patterns = patterns;
    }

    create() {
        if (this.state !== Network.UNAVAILABLE)
            return false;

        this.learning = new Module.learning();

        for (let info of this.patterns) {
            let pattern = new Module.intArray();
            info.pattern.forEach(v => pattern.push_back(v));
            this.learning.add_pattern(pattern, info.isomorphic);
        }

        this.state = Network.AVAILABLE;

        return true;
    }

    release() {
        if (this.state !== Network.AVAILABLE)
            return false;

        this.state = Network.UNAVAILABLE;
        Module.delete_learning(this.learning);
        this.learning = null;

        return true;
    }

    load(path) {
        if (this.state !== Network.UNAVAILABLE)
            return false;

        this.patterns = readPatternInfo(path);
        this.create();
        this.learning.load(path);

        this.state = Network.AVAILABLE;

        return true;
    }

    setAlpha(alpha) {
        this.alpha = alpha;
    }

    startTraining() {
        if (this.state !== Network.AVAILABLE)
            return false;

        this.state = Network.TRAINING;
        this.training_stop_signal = false;
        this.#startTraining();

        return true;
    }

    stopTraining() {
        this.training_stop_signal = true;
    }

    #startTraining() {

        const training = () => {

            const statistic = this.learning.training(this.statistic_length, this.alpha);
            this.episode += this.statistic_length;
            this.#makeStatistic(statistic);

            if (this.training_stop_signal) {
                this.state = Network.AVAILABLE;
                if (this.events.onTrainStop) {
                    // dispatch event
                    this.events.onTrainStop({
                        type: "onTrainStop",
                        value: null
                    });
                }
            } else {
                setTimeout(training, 0);
            }
        }

        setTimeout(training, 0);
    }

    #__startTraining() {

        this.worker.onmessage = (e) => {
            const statistic = e.data;
            this.#makeStatistic(statistic);
            if (this.training_stop_signal) {
                this.state === Network.AVAILABLE;
                if (this.events.onTrainStop) {
                    // dispatch event
                    this.events.onTrainStop({
                        type: "onTrainStop",
                        value: null
                    });
                }
            } else {
                this.worker.postMessage([
                    this.learning.training,
                    this.statistic_length,
                    this.alpha
                ]);
            }
        }

        this.worker.postMessage([
            this.learning.training,
            this.statistic_length,
            this.alpha
        ]);

    }

    #makeStatistic(statistic) {
        if (this.statistic.length >= this.maximum_statistic)
            this.statistic.shift();
        statistic.alpha = this.alpha;
        statistic.episode = this.episode;
        if (statistic.mean > this.max_avg_score)
            this.max_avg_score = statistic.mean;
        statistic.max_avg_score = this.max_avg_score;
        this.statistic.push(statistic);
        if (this.events.onStatisticChanged) {
            // dispatch event
            this.events.onStatisticChanged({
                type: "onStatisticChanged",
                value: this.statistic
            });
        }
    }

}

export { readPatternInfo, Network };