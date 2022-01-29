customElements.define(
  "yt-video",
  class extends HTMLElement {
    constructor() {
      super();
      this._fetching = false;
    }

    static get observedAttributes() {
      return ["video-id"];
    }

    get videoId() {
      return this.getAttribute("video-id");
    }

    get title() {
      return this.getAttribute("title");
    }

    get channelPicture() {
      return this.getAttribute("channel-picture");
    }

    connectedCallback() {
      this._renderPlaceholder();
      this._addIntersectionObserver();
    }

    _addIntersectionObserver = () => {
      this._intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if (this.videoId && !this._fetching) {
              this._fetchAndRender(this.videoId);
            }
          }
        },
        {
          threshold: [0],
        }
      );
      this._intersectionObserver.observe(this);
    };

    _removeIntersectionObserver = () => {
      this._intersectionObserver.unobserve(this);
      this._intersectionObserver = undefined;
    };

    _fetchAndRender = (videoId) => {
      this._fetching = true;
      const override = (() => {
        const override = {};
        if (this.title) {
          override.title = this.title;
        }
        return override;
      })();
      this._fetchOrGetFromCache(videoId).then((data) => {
        this._render(videoId, {
          ...data,
          ...override,
        });
        this._fetching = false;
      });
    };

    _fetch = (videoId) => {
      return fetch(
        `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${videoId}`
      ).then((response) => response.json());
    };

    _fetchOrGetFromCache = (videoId) => {
      const fromCache = localStorage[`yt_video_${videoId}_cache`];
      if (fromCache) {
        return Promise.resolve(JSON.parse(fromCache));
      } else {
        return this._fetch(videoId).then((data) => {
          localStorage[`yt_video_${videoId}_cache`] = JSON.stringify(data);
          return data;
        });
      }
    };

    _renderPlaceholder = () => {
      this.innerHTML = `<span class="placeholder"></span>`;
    };

    _render = (videoId, { title, thumbnail_url }) => {
      this.innerHTML = `
        <a
          href="https://www.youtube.com/watch?v=${videoId}"
          target="_blank"
        >
          <span style="background-image: url(${thumbnail_url});">
            <img
              src="${thumbnail_url}"
              loading="lazy"
              alt="${title}"
            />
          </span>
          <span>
            ${
              this.channelPicture
                ? `<span style="background-image: url(${this.channelPicture});"></span>`
                : `<span style="display: none;"></span>`
            }
            <span>${title}</span>
          </span>
        </a>
      `;
    };
  }
);
