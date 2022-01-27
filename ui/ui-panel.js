customElements.define(
  "ui-panel",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>
          .panel {
            display: none;
            position: relative;
            background-color: rgba(0, 0, 0, .015);
            padding: 2rem;
            border-radius: 0.5rem;
          }

          .panel.panel-open {
            display: block;
          }

          .panel.panel-closable::before {
            display: block;
            content: "";
            width: 3rem;
            height: 3rem;
            float: right;
          }

          .panel ::slotted(*:first-child) {
            margin-top: 0;
          }

          .panel ::slotted(*:last-child) {
            margin-bottom: 0;
          }

          .close {
            display: none;
          }

          .panel.panel-closable .close {
            display: block;
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 2rem;
            height: 2rem;
            border: none;
            border-radius: 100%;
            font-size: 140%;
            line-height: 2rem;
            text-align: center;
            padding: 0;
            background-color: rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
          }
        </style>
        <div id="panel" class="panel ${this.closable ? "panel-closable" : ""}">
          <slot></slot>
          <button class="close" id="close">&times;</button>
        </div>
      `;
    }

    get closable() {
      return this.getAttribute("closable") !== null;
    }

    get open() {
      return this.getAttribute("open") !== null;
    }

    get openByLocalStorage() {
      return this.getAttribute("open-by-local-storage") !== null;
    }

    set open(isOpen) {
      this.shadowRoot
        .getElementById("panel")
        .classList.toggle("panel-open", isOpen);
      if (isOpen) {
        this.setAttribute("open", "");
      } else {
        this.removeAttribute("open");
      }
    }

    connectedCallback() {
      this.shadowRoot
        .getElementById("close")
        .addEventListener("click", this._closeListener, true);
      if (this.openByLocalStorage) {
        this.open = !localStorage[`panel_${this.id}_close`];
      } else {
        this.open = this.open;
      }
    }

    disconnectedCallback() {
      this.shadowRoot
        .getElementById("close")
        .removeEventListener("click", this._closeListener);
    }

    _closeListener = () => {
      this.open = false;
      localStorage[`panel_${this.id}_close`] = "1";
    };
  }
);
