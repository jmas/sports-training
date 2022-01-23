customElements.define(
  "yt-video",
  class extends HTMLElement {
    constructor() {
      super();
    }

    static get observedAttributes() {
      return ["video-id"];
    }

    get videoId() {
      return this.getAttribute("video-id");
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      if (name === "video-id") {
        this._fetchAndRender(this.videoId);
      }
    }

    _fetchAndRender = (videoId) => {
      this._fetch(videoId).then((data) => this._render(videoId, data));
    };

    _fetch = (videoId) => {
      return fetch(
        `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${videoId}`
      ).then((response) => response.json());
    };

    _render = (videoId, { title, thumbnail_url }) => {
      this.innerHTML = `
        <a
          href="https://www.youtube.com/watch?v=${videoId}"
          target="_blank"
        >
          <img
            src="${thumbnail_url}"
            alt="${title}"
          />
          <span>${title}</span>
        </a>
      `;
    };
  }
);
