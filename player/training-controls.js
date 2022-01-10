customElements.define(
  "training-controls",
  class extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._shadow.innerHTML = `
        <style>
        .controls {
          padding: 15px 20px;
          line-height: 30px;
          display: flex;
          align-items: stretch;
          color: #fff;
          text-decoration: none;
          white-space: nowrap;
          background-clip: padding-box;
          background-color: rgba(0, 0, 0, 0.5);
          font-weight: bold;
        }

        .controls > div {
          margin-right: 20px;
        }

        .controls > div:nth-child(1) > button {
          width: 30px;
          height: 30px;
          display: block;
          padding: 0;
          border: none;
          background: transparent;
        }

        .controls > div:nth-child(2) {
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .controls > div:last-child {
          margin-right: 0;
          text-align: right;
        }
        </style>
        <div class="controls">
          <div>
            <button id="start">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.41405 27.3045C4.81639 27.1463 4.45311 26.9471 3.99022 26.5135C3.49803 26.0447 3.16405 25.5467 2.9121 24.8963L2.7246 24.4041L2.70702 15.2459C2.68944 5.00373 2.66014 5.73615 3.11718 4.80451C3.31053 4.41193 3.46874 4.20099 3.86718 3.80255C4.16014 3.49787 4.48827 3.2342 4.66991 3.14045C5.49608 2.73029 6.62694 2.61896 7.5117 2.8592C7.84569 2.95295 10.166 4.10138 16.4765 7.3006C21.1582 9.67365 25.1836 11.7479 25.4179 11.9119C27.6094 13.4236 27.9316 15.8611 26.1621 17.6014C25.6465 18.1111 25.0898 18.4744 23.8594 19.0955C23.291 19.3826 19.5293 21.2811 15.498 23.3201C11.4726 25.3533 7.99217 27.0818 7.76366 27.158C6.93163 27.4393 6.11717 27.492 5.41405 27.3045ZM8.2617 24.2049C16.7871 19.9041 23.6601 16.4002 23.9765 16.1893C24.4453 15.8787 24.7617 15.5272 24.8496 15.2225C24.9609 14.8065 24.6094 14.2908 23.9355 13.8572C23.7773 13.7576 21.9844 12.8318 19.9512 11.8065C17.9238 10.7811 14.2148 8.90607 11.7129 7.64044C9.21092 6.37482 7.02538 5.29669 6.8496 5.24982C6.46288 5.13263 6.02342 5.13263 5.80077 5.24396C5.57225 5.36115 5.30272 5.76544 5.19139 6.15802C5.1035 6.45099 5.09764 7.35333 5.10936 15.1815L5.12694 23.8768L5.28514 24.199C5.49608 24.6268 5.71874 24.8318 6.041 24.8963C6.58592 25.0076 6.79686 24.9432 8.2617 24.2049Z" fill="white"/>
              </svg>
            </button>
            <button id="pause">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.1738 29.9354C12.1641 29.8358 10.2715 29.3378 8.40822 28.4178C5.37892 26.9237 3.07619 24.621 1.58205 21.5917C0.656264 19.7225 0.164076 17.8299 0.0703263 15.8143C-0.05858 13.119 0.421889 10.7518 1.58205 8.40807C3.07619 5.37877 5.37892 3.07603 8.40822 1.58189C10.2774 0.656111 12.1699 0.163924 14.1856 0.0701737C16.8809 -0.0587326 19.2481 0.421736 21.5918 1.58189C24.6211 3.07603 26.9238 5.37877 28.418 8.40807C29.5781 10.7518 30.0586 13.119 29.9297 15.8143C29.836 17.8299 29.3438 19.7225 28.418 21.5917C27.4278 23.6014 26.0625 25.3124 24.3633 26.6659C21.961 28.5878 18.8555 29.7948 16.002 29.9178C15.627 29.9354 15.2461 29.953 15.1465 29.9589C15.0528 29.9706 14.6133 29.9589 14.1738 29.9354ZM16.6699 27.5096C19.4942 27.1112 21.9141 25.9042 23.9121 23.912C25.9043 21.9139 27.1113 19.494 27.5098 16.6698C27.6211 15.9081 27.6211 14.0917 27.5098 13.3299C27.1113 10.5057 25.9043 8.0858 23.9121 6.08775C21.9141 4.09557 19.4942 2.88853 16.6699 2.4901C15.9082 2.37877 14.0918 2.37877 13.3301 2.4901C10.5059 2.88853 8.08595 4.09557 6.08791 6.08775C4.09572 8.0858 2.88869 10.5057 2.49025 13.3299C2.37892 14.0917 2.37892 15.9081 2.49025 16.6698C2.88869 19.494 4.09572 21.9139 6.08791 23.912C8.06838 25.8866 10.4824 27.0936 13.2715 27.5096C13.9922 27.6151 15.9375 27.6151 16.6699 27.5096Z" fill="white"/>
                <path d="M11.7129 21.9493C11.2559 21.7852 10.8926 21.3575 10.7871 20.8536C10.7168 20.5313 10.6934 9.49225 10.7578 9.00006C10.9219 7.82818 12.375 7.31256 13.2129 8.12701C13.336 8.2442 13.4883 8.461 13.5586 8.60748C13.6817 8.87701 13.6817 8.89459 13.6817 14.8536C13.6817 21.6563 13.7168 21.1583 13.1836 21.6387C12.7676 22.0137 12.2168 22.1309 11.7129 21.9493Z" fill="white"/>
                <path d="M17.6075 21.8903C17.2559 21.7263 17.0391 21.5036 16.8809 21.152C16.7637 20.8942 16.7578 20.8005 16.7578 14.9177C16.7578 10.4704 16.7754 8.88836 16.8282 8.71844C16.9219 8.39031 17.3438 7.93914 17.666 7.81609C18 7.69305 18.6446 7.7282 18.9024 7.88055C19.2305 8.08562 19.4532 8.34344 19.5703 8.65398C19.6875 8.95867 19.6875 9.11688 19.6875 14.8766C19.6875 19.9567 19.6758 20.8181 19.5996 21.0349C19.3067 21.861 18.3867 22.2595 17.6075 21.8903Z" fill="white"/>
              </svg>
            </button>
          </div>
          <div id="title"></div>
          <div id="completion"></div>
        </div>
      `;
    }

    static get observedAttributes() {
      return ["title", "completion", "playing"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      if (name === "title") {
        this._shadow.getElementById("title").textContent = this.title;
      } else if (name === "completion") {
        const completion = this._shadow.getElementById("completion");
        completion.textContent = `${this.completion}%`;
        completion.style.display = this.completion === 0 ? "none" : "";
      } else if (name === "playing") {
        this._resetPlayingControls();
      }
    }

    connectedCallback() {
      this._shadow
        .getElementById("start")
        .addEventListener("click", this._onStartClick, true);
      this._shadow
        .getElementById("pause")
        .addEventListener("click", this._onPauseClick, true);
      this._resetPlayingControls();
    }

    disconnectedCallback() {
      this._shadow
        .getElementById("start")
        .removeEventListener("click", this._onStartClick);
      this._shadow
        .getElementById("pause")
        .removeEventListener("click", this._onPauseClick);
    }

    _resetPlayingControls = () => {
      this._shadow.getElementById("start").style.display = this.playing
        ? "none"
        : "";
      this._shadow.getElementById("pause").style.display = this.playing
        ? ""
        : "none";
    };

    _onStartClick = () => {
      this.dispatchEvent(new CustomEvent("start"));
    };

    _onPauseClick = () => {
      this.dispatchEvent(new CustomEvent("pause"));
    };

    get completion() {
      return Number(this.getAttribute("completion")) || 0;
    }

    get title() {
      return this.getAttribute("title") || "";
    }

    get playing() {
      return this.getAttribute("playing") !== null;
    }
  }
);
