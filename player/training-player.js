customElements.define(
  "training-player",
  class extends HTMLElement {
    constructor() {
      super();

      this._shadow = this.attachShadow({ mode: "open" });

      this._shadow.innerHTML = `
        <style>
        * {
          box-sizing: border-box;
        }

        .container {
          display: grid;
        }

        .player {
          position: relative;
        }

        .player.hide {
          display: none;
        }

        .timer {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #444444;
          padding: 0;
          border-radius: 60px;
        }

        .progress {
          position: absolute;
          bottom: 10px;
          left: 10px;
          width: calc(100% - 20px);
          padding: 10px;
          background-color: #444444;
          border-radius: 10px;
        }

        .title {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: #444444;
          border-radius: 10px;
          font-size: 130%;
          font-weight: bold;
          padding: 10px;
        }

        .title:empty {
          display: none;
        }

        .break {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(68, 68, 68, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 200%;
          font-weight: bold;
          transition: 1s;
          opacity: 1;
          transition-property: opacity;
          white-space: pre-line;
          text-align: center;
          color: #444;
          padding: 10px;
        }

        .break > * {
          background-color: #fff;
          display: block;
          padding: 10px;
          border-radius: 10px;
          animation: pulse-color 1s ease-in-out infinite alternate;
        }

        .break.hide {
          opacity: 0;
        }

        @keyframes pulse-color {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            opacity: 1;
          }
        }
        </style>
        <div class="container">
          <div id="player" class="player hide">
            <training-video id="video"></training-video>

            <div id="title" class="title"></div>

            <div id="break" class="break hide"><span></span></div>

            <training-timer
              id="timer"
              class="timer"
              max="0"
              value="0"
            ></training-timer>

            <training-progress
              id="progress"
              items="[]"
              active="0"
              class="progress"
            ></training-progress>
          </div>

          <training-controls
            id="controls"
            title=""
            completion="0"
          ></training-controls>

          <training-list id="list" items="[]"></training-list>
        </div>
      `;

      this._tick = new Audio("tick.mp3");
      this._bell = new Audio("boxing-bell.mp3");
      this._timer = null;
      this._time = 0;
      this._playing = false;
      this._current = 0;
      this._exercises = this.exercises;
      this._exerciseBreak = this.exerciseBreak;
      this._setBreak = this.setBreak;
      this._training = this._getTraining(
        this._exercises,
        this._exerciseBreak,
        this._setBreak
      );
      this._soundsInit = false;
    }

    static get observedAttributes() {
      return ["items"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      if (name === "items") {
      }
    }

    connectedCallback() {
      const controls = this._shadow.getElementById("controls");
      const progress = this._shadow.getElementById("progress");
      const list = this._shadow.getElementById("list");

      this._setList(this._exercises);

      controls.addEventListener(
        "start",
        () => {
          this._start(this._current, this._time);
        },
        true
      );

      controls.addEventListener(
        "pause",
        () => {
          this._pause();
        },
        true
      );

      controls.addEventListener(
        "fullscreen",
        () => {
          this._toggleFullScreen();
        },
        true
      );

      progress.addEventListener(
        "select",
        (event) => {
          this._start(event.detail.index);
        },
        true
      );

      list.addEventListener(
        "select",
        (event) => {
          this._start(
            this._training.findIndex(
              ({ exercise }) => exercise === event.detail.index
            )
          );
        },
        true
      );

      document.addEventListener("keypress", this._onKeyPress, false);

      this._addEventListenerForLoadSound();
    }

    disconnectedCallback() {
      document.removeEventListener("keypress", this._onKeyPress);
    }

    _getTraining = (exercises, exerciseBreak, setBreak) => {
      const training = [];

      training.push({
        type: "break",
        exercise: 0,
        time: setBreak,
      });

      for (let i = 0; i < exercises.length; i++) {
        for (let j = 0; j < exercises[i].sets; j++) {
          training.push({
            type: "set",
            exercise: i,
            set: j,
            sets: exercises[i].sets,
            name: exercises[i].name,
            time: exercises[i].time,
            videoId: exercises[i].videoId,
            start: exercises[i].start,
            end: exercises[i].end,
            bells: exercises[i].bells,
          });
          if (j + 1 < exercises[i].sets) {
            training.push({
              type: "break",
              exercise: i,
              time: setBreak,
            });
          }
        }
        if (i + 1 < exercises.length) {
          training.push({
            type: "break",
            exercise: i + 1,
            time: exerciseBreak,
          });
        }
      }

      return training;
    };

    _trainingTick = (index = 0) => {
      const training = this._training;
      let nextTraining = index + 1;
      let trainingStart = training[index].time;

      while (training[nextTraining] && trainingStart < this._time) {
        trainingStart += training[nextTraining].time + 1;
        nextTraining++;
      }

      const activeTraining = nextTraining - 1;

      this._setProgress(
        training.map(({ time }) => time),
        activeTraining
      );

      const timeOfTraining = training[activeTraining].time;
      const timeLeft = trainingStart - this._time;
      const timeFromStart = timeOfTraining - timeLeft;

      this._setTimer(training[activeTraining].time, timeLeft);
      this._setListActive(training[activeTraining].exercise);
      this._setControls(
        training[nextTraining]
          ? `Далее: ${
              training[nextTraining].type === "set"
                ? `«${training[nextTraining].name}» ${
                    training[nextTraining].set + 1
                  } из ${training[nextTraining].sets}`
                : `Перерыв ${training[nextTraining].time} с`
            }`
          : ""
      );

      if (training[activeTraining].type === "set") {
        if (timeLeft === training[activeTraining].time) {
          this._resetVideo();
        }

        if (
          training[activeTraining].bells.length > 0 &&
          training[activeTraining].bells.some((bell) => bell === timeFromStart)
        ) {
          this._playBell();
        }

        this._toggleBreak(false);

        this._setVideo(
          training[activeTraining].videoId,
          training[activeTraining].start,
          training[activeTraining].end
        );

        this._setTitle(
          `«${training[activeTraining].name}» ${
            training[activeTraining].set + 1
          } из ${training[activeTraining].sets}`
        );
      } else {
        this._toggleBreak(
          true,
          `Готовимся\n«${training[nextTraining].name}» ${
            training[nextTraining].set + 1
          } из ${training[nextTraining].sets}`
        );

        this._setVideo(
          training[nextTraining].videoId,
          training[nextTraining].start,
          training[nextTraining].end
        );

        this._setTitle("");
      }

      if (timeLeft === 5) {
        this._playTick();
      } else if (timeLeft === 0) {
        this._stopTick();
        this._playBell();
      }

      if (!training[nextTraining] && timeLeft === 0) {
        this._finish();
        return;
      }

      this._setPlayingControls(this._playing);

      if (this._playing) {
        this._time++;
      } else {
        this._toggleBreak(true, "Пауза");
      }
    };

    _start = (_index = 0, _time = 0) => {
      this._stopSounds();
      this._time = _time;
      this._current = _index;
      this._togglePlayer(true);
      clearInterval(this._timer);
      this._timer = setInterval(() => this._trainingTick(_index), 1000);
      this._playing = true;
    };

    _finish = () => {
      clearInterval(this._timer);
      this._togglePlayer(false);
      this._playing = false;
      this._setPlayingControls(false);
      this._time = 0;
      this._current = 0;
      this._setListActive(-1);
    };

    _pause = () => {
      this._stopSounds();
      this._playing = false;
    };

    _setTitle = (title = "") => {
      const titleElement = this._shadow.getElementById("title");
      titleElement.textContent = title;
    };

    _setProgress = (items, active = 0) => {
      const progress = this._shadow.getElementById("progress");
      progress.setAttribute("items", JSON.stringify(items));
      progress.setAttribute("active", active);
    };

    _setTimer = (max = 100, value = 0) => {
      const timer = this._shadow.getElementById("timer");
      timer.setAttribute("max", max);
      timer.setAttribute("value", value);
    };

    _setList = (items) => {
      const list = this._shadow.getElementById("list");
      list.setAttribute("items", JSON.stringify(items));
    };

    _setListActive = (active = 0) => {
      const list = this._shadow.getElementById("list");
      list.setAttribute("active", active);
    };

    _setControls = (title, completion = 0) => {
      const controls = this._shadow.getElementById("controls");
      controls.setAttribute("title", title);
      controls.setAttribute("completion", completion);
    };

    _setVideo = (videoId, start, end) => {
      const video = this._shadow.getElementById("video");
      video.setAttribute("start", start);
      video.setAttribute("end", end);
      video.setAttribute("video-id", videoId);
    };

    _resetVideo = () => {
      const video = this._shadow.getElementById("video");
      video.dispatchEvent(new CustomEvent("reset"));
    };

    _togglePlayer = (display = false) => {
      const player = this._shadow.getElementById("player");
      player.classList.toggle("hide", !display);
    };

    _toggleBreak = (display = false, title = "") => {
      const breakElement = this._shadow.getElementById("break");
      breakElement.classList.toggle("hide", !display);
      breakElement.children[0].textContent = title;
    };

    _playTick = () => {
      this._tick.currentTime = 0;
      this._tick.autoplay = true;
      this._tick.play();
    };

    _stopTick = () => {
      this._tick.pause();
    };

    _playBell = () => {
      this._bell.currentTime = 0;
      this._bell.autoplay = true;
      this._bell.play();
    };

    _stopSounds = () => {
      this._tick.pause();
      this._bell.pause();
    };

    _setPlayingControls = (playing = false) => {
      const controls = this._shadow.getElementById("controls");
      if (playing) {
        controls.setAttribute("playing", "");
      } else {
        controls.removeAttribute("playing");
      }
    };

    _toggleFullScreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };

    _onKeyPress = (event) => {
      if (event.keyCode === 13) {
        this._toggleFullScreen();
      }
    };

    _addEventListenerForLoadSound() {
      document.body.addEventListener("touchstart", () => {
        if (!this._soundsInit) {
          this._tick.load();
          this._tick.play();
          this._tick.pause();

          this._bell.load();
          this._bell.play();
          this._bell.pause();
          this._soundsInit = true;
        }
      });
    }

    get exercises() {
      return JSON.parse(this.getAttribute("exercises") || "") || [];
    }

    get exerciseBreak() {
      return Number(this.getAttribute("exercise-break")) || 20;
    }

    get setBreak() {
      return Number(this.getAttribute("set-break")) || 10;
    }
  }
);
