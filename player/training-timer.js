customElements.define(
  "training-timer",
  class extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });

      const size = 120;
      const strokeWidth = 20;

      this._shadow.innerHTML = `
        <style>
        .timer {
          position: relative;
          --bg: #373737;
          --size: ${size}px;
          --r: ${Math.ceil(2 * Math.PI * (size / 2 - strokeWidth))};
          --color: #fff;
          width: var(--size);
          height: var(--size);
          color: var(--color);
          user-select: none;
        }

        .passed {
          position: absolute;
          left: 0;
          right: 0;
          margin-inline: auto;
          top: calc(50% - 15px);
          line-height: 30px;
          text-align: center;
          font-weight: bold;
          font-size: 180%;
          color: red;
        }

        svg {
          transform: rotate(-90deg);
          stroke-dasharray: var(--r);
          stroke-dashoffset: calc((var(--r) / 100) * (100 - var(--completed, 0)));
          transition: .3s;
          transition-property: stroke-dashoffset;
        }

        svg circle {
          stroke: var(--color);
        }
        </style>
        <div class="timer" id="timer">
          <svg height="${size}" width="${size}">
            <circle class="circle" cx="${size / 2}" cy="${size / 2}" r="${
        size / 2 - strokeWidth
      }" stroke="#fff" stroke-width="${strokeWidth}" fill="transparent" />
          </svg> 
          <div class="passed" id="passed"></div>
        </div>
      `;
    }

    static get observedAttributes() {
      return ["max", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      if (name === "max" || name === "value") {
        this._shadow
          .getElementById("timer")
          .style.setProperty("--completed", (100 * this.value) / this.max);
        this._shadow.getElementById("passed").textContent = this.value;
      }
    }

    connectedCallback() {}

    get max() {
      return Number(this.getAttribute("max") || 100);
    }

    get value() {
      return Number(this.getAttribute("value") || 0);
    }
  }
);
