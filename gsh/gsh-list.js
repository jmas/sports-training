customElements.define(
  "gsh-list",
  class extends HTMLElement {
    constructor() {
      super();
    }

    static get observedAttributes() {
      return ["item-template"];
    }

    get renderInto() {
      return this.getAttribute("render-into");
    }

    get itemTemplate() {
      return this.getAttribute("item-template");
    }

    get fromDataElement() {
      return document.querySelector(this.getAttribute("from-data"));
    }

    get renderIntoElement() {
      return this.renderInto ? document.querySelector(this.renderInto) : this;
    }

    get newItemTemplateElement() {
      const template = document.querySelector(this.itemTemplate);
      return document.importNode(template.content, true);
    }

    get fromDataValues() {
      return JSON.parse(this.fromDataElement.textContent.trim());
    }

    connectedCallback() {
      this._render(this.renderIntoElement, this.fromDataValues);
      this._attachFromDataListener();
    }

    disconnectedCallback() {
      this._detachFromDataListener();
    }

    _attachFromDataListener = () => {
      this.fromDataElement.addEventListener(
        "load",
        this._fromDataLoadListener,
        true
      );
      this.fromDataElement.addEventListener(
        "error",
        this._fromDataErrorListener,
        true
      );
    };

    _detachFromDataListener() {
      this.fromDataElement.removeEventListener(
        "load",
        this._fromDataLoadListener
      );
      this.fromDataElement.removeEventListener(
        "error",
        this._fromDataErrorListener
      );
    }

    _fromDataLoadListener = (event) => {
      this._render(this.renderIntoElement, event.detail.values);
    };

    _fromDataErrorListener = (event) => {
      console.error(event.detail.error);
    };

    _render = (element, values) => {
      for (let i = 0; i < element.children.length; i++) {
        element.removeChild(element.children[i]);
      }
      for (let i = 0; i < values.length; i++) {
        element.appendChild(this.newItemTemplateElement);
        this._renderElementValues(element.lastElementChild, values[i]);
      }
    };

    _renderElementValues(element, values) {
      this._findAllDataInsertNodes(element).forEach((currentNode) => {
        const attributes = Array.from(currentNode.attributes);
        for (let i = 0; i < attributes.length; i++) {
          const attribute = attributes[i].name;
          if (attribute.startsWith("data-insert")) {
            const insertIntoAttr = attribute.substring(12);
            if (insertIntoAttr === "") {
              currentNode.textContent = this._interpolateString(
                currentNode.getAttribute(attribute),
                values
              );
            } else {
              currentNode.setAttribute(
                insertIntoAttr,
                this._interpolateString(
                  currentNode.getAttribute(attribute),
                  values
                )
              );
            }
            currentNode.removeAttribute(attribute);
          }
        }
      });
    }

    _findAllDataInsertNodes = (element) => {
      const evaluator = new XPathEvaluator();
      const iterator = evaluator.evaluate(
        '(self::node()|*)[@*[starts-with(name(), "data-insert")]]',
        element,
        null,
        XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
        null
      );
      const foundNodes = [];
      try {
        let currentNode = iterator.iterateNext();
        while (currentNode) {
          foundNodes.push(currentNode);
          currentNode = iterator.iterateNext();
        }
      } catch (error) {
        console.error(
          "Error: Document tree modified during iteration " + error
        );
      }
      return foundNodes;
    };

    _interpolateString = (str, values) => {
      const _names = Object.keys(values);
      const _values = Object.values(values);
      return new Function(..._names, `return \`${str}\`;`)(..._values);
    };
  }
);
