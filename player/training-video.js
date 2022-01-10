const onYouTubeIframeReadyHandlers = (window.__onYouTubeIframeReadyHandlers = [
  () => {
    window.__youTubeIframeReady = true;
  },
]);

window.onYouTubeIframeAPIReady = () => {
  onYouTubeIframeReadyHandlers.forEach((handler) => handler());
};

customElements.define(
  "training-video",
  class extends HTMLElement {
    constructor() {
      super();
      this._player = null;

      this._shadow = this.attachShadow({ mode: "open" });

      this._shadow.innerHTML = `
      <style>
      .training-player {
        height: 0;
        padding-bottom: 56.25%;
        position: relative;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.25);
        user-select: none;
      }

      .training-player iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      </style>
      <div class="training-player"><div id="player"></div></div>
      `;
    }

    static get observedAttributes() {
      return ["video-id"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      if (name === "video-id") {
        if (!this._player) {
          this._initPlayer();
        } else {
          this._player.loadVideoById({
            videoId: this.videoId,
            startSeconds: this.start,
            endSeconds: this.end,
            suggestedQuality: "large",
          });
        }
      }
    }

    connectedCallback() {
      this.addEventListener("reset", this._reset, true);
    }

    disconnectedCallback() {
      this.removeEventListener("reset", this._reset);
    }

    _initPlayer() {
      const onPlayerReady = (event) => {
        this._player.seekTo(this.start);
        this._player.playVideo();
      };

      const onPlayerStateChange = (event) => {
        if (event.data == YT.PlayerState.PLAYING) {
          const duration = this.end - this.start;
          clearTimeout(this._restartTimer);
          this._restartTimer = setTimeout(
            this._restartVideoSection,
            duration * 1000
          );
        } else if (event.data == YT.PlayerState.PAUSED) {
          clearTimeout(this._restartTimer);
        }
      };

      const onYouTubeIframeReadyHandler = () => {
        this._player = new YT.Player(this._shadow.getElementById("player"), {
          width: "100%",
          height: "100%",
          videoId: this.videoId,
          startSeconds: this.start,
          endSeconds: this.end,
          suggestedQuality: "large",
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            fs: 0,
            showinfo: 0,
            mute: 1,
            autohide: 1,
          },
        });
      };

      if (!window.__youTubeIframeReady) {
        onYouTubeIframeReadyHandlers.push(onYouTubeIframeReadyHandler);
      } else {
        onYouTubeIframeReadyHandler();
      }
    }

    _restartVideoSection = () => {
      this._player.seekTo(this.start);
    };

    _reset = () => {
      this._player.seekTo(this.start);
      const duration = this.end - this.start;
      clearTimeout(this._restartTimer);
      this._restartTimer = setTimeout(
        this._restartVideoSection,
        duration * 1000
      );
    };

    get start() {
      return Number(this.getAttribute("start")) || 0;
    }

    get end() {
      return Number(this.getAttribute("end")) || 0;
    }

    get videoId() {
      return this.getAttribute("video-id") || "";
    }
  }
);
