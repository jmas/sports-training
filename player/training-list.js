customElements.define(
  "training-list",
  class extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._shadow.innerHTML = `
        <style>
        .list > button {
          padding: 15px 20px;
          line-height: 30px;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          width: 100%;
          align-items: stretch;
          color: #fff;
          text-decoration: none;
          background-clip: padding-box;
          background-color: transparent;
          font-family: inherit;
          font-size: inherit;
          text-align: left;
          cursor: pointer;
          margin: 0;
        }

        .list > button > * {
          pointer-events: none;
        }

        .list > button.active {
          background-color: rgba(0, 0, 0, 0.25);
        }

        .list > button:first-child {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .list > button > span {
          margin-right: 20px;
        }

        .list > button > span:nth-child(1) {
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          flex-shrink: 0;
        }

        .list > button > span:nth-child(2) {
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .list > button > span:last-child {
          margin-right: 0;
          text-align: right;
          white-space: nowrap;
        }
        </style>
        <div class="list" id="list"></div>
      `;
    }

    static get observedAttributes() {
      return ["items", "active"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      if (name === "items") {
        this._shadow.getElementById("list").innerHTML = this.items
          .map(
            ({ name, sets, time }, index) => `
          <button class="${
            this.active === index ? "active" : ""
          }" data-index="${index}">
            <span>${index + 1}</span>
            <span>${name}</span>
            <span>${
              sets > 1 ? `${sets} подхода &times; ${time} с` : `${time} с`
            }</span>
          </button>
        `
          )
          .join("");
      } else if (name === "active") {
        Array.from(this._shadow.getElementById("list").children).forEach(
          (child, index) => {
            child.classList.toggle("active", this.active === index);
          }
        );
      }
    }

    connectedCallback() {
      const list = this._shadow.getElementById("list");
      list.addEventListener("click", this._onItemClick, true);
    }

    _onItemClick = (event) => {
      if (event.target.tagName.toUpperCase() === "BUTTON") {
        this.dispatchEvent(
          new CustomEvent("select", {
            detail: {
              index: Number(event.target.dataset.index),
            },
          })
        );
      }
    };

    get items() {
      return JSON.parse(this.getAttribute("items") || "[]");
    }

    get active() {
      return this.getAttribute("active") !== null
        ? Number(this.getAttribute("active"))
        : null;
    }
  }
);
