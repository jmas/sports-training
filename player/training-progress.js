customElements.define(
  "training-progress",
  class extends HTMLElement {
    constructor() {
      super();

      this._shadow = this.attachShadow({ mode: "open" });

      this._shadow.innerHTML = `
        <style>
        .progress {
          height: 20px;
          display: flex;
          align-items: stretch;
          user-select: none;
        }

        .progress > button {
          background-color: #fff;
          margin-right: 2px;
          border-radius: 2px;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .progress > button > * {
          pointer-events: none;
        }

        .progress > button:last-child {
          margin-right: 0;
        }

        .progress > button.passed {
          background-color: red;
        }

        .progress > button.active {
          animation: pulse 0.8s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          0% {
            background-color: #fff;
          }
          50% {
            background: red;
          }
          100% {
            background-color: #fff;
          }
        }
        </style>
        <div class="progress" id="progress"></div>
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
        const progress = this._shadow.getElementById("progress");
        const overallTime = this.items.reduce(
          (overall, time) => overall + time,
          0
        );

        progress.innerHTML = this.items
          .map(
            (time, index) => `
            <button style="width: ${
              Math.ceil(((100 * time) / overallTime) * 100) / 100
            }%;" class="${index < this.active ? "passed" : ""} ${
              index === this.active ? "active" : ""
            }" data-index="${index}"></button>
          `
          )
          .join("");
      } else if (name === "active") {
        const progress = this._shadow.getElementById("progress");

        Array.from(progress.children).forEach((child, index) => {
          child.classList.toggle("passed", index < this.active);
          child.classList.toggle("active", index === this.active);
        });
      }
    }

    connectedCallback() {
      const progress = this._shadow.getElementById("progress");
      progress.addEventListener("click", this._onItemClick, true);
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
      return Number(this.getAttribute("active")) || 0;
    }
  }
);
