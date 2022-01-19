customElements.define(
  "gsh-list",
  class extends HTMLElement {
    constructor() {
      super();
    }

    static get observedAttributes() {
      return ["document-id", "sheet", "item-template"];
    }

    connectedCallback() {
      this._fetchAndRender(
        this.getAttribute("document-id"),
        this.getAttribute("sheet"),
        this.getAttribute("item-template"),
        this.getAttribute("render-into")
      );
    }

    _fetchAndRender = (documentId, sheet, itemTemplate, renderInto) => {
      this._queryOrGetFromCache(
        `gsh_list_${documentId}_${sheet}_cache`,
        () => this._fetchSheetItemsValues(documentId, sheet),
        12 * 3600 // 12 hours
      ).then((itemsValues) => {
        this._render(
          renderInto ? document.querySelector(renderInto) : this,
          itemTemplate,
          itemsValues
        );
      });
    };

    _fetchSheetItemsValues = (documentId, sheet) => {
      return fetch(
        `https://docs.google.com/spreadsheets/d/${documentId}/gviz/tq?tqx=out:json&sheet=${sheet}`
      )
        .then((response) => response.text())
        .then(
          (text) =>
            JSON.parse(
              String(text).match(
                /google\.visualization\.Query\.setResponse\((.+?)\);/m
              )[1]
            ).table
        )
        .then(this._formatSheetData);
    };

    _formatSheetData = ({ cols, rows }) => {
      const header = [];
      let firstRowIsHeader = false;
      for (let i = 0; i < cols.length; i++) {
        if (cols[i].label) {
          header.push(cols[i].label);
        } else {
          break;
        }
      }
      if (header.length === 0 && rows[0] && rows[0].c) {
        firstRowIsHeader = true;
        for (let i = 0; i < rows[0].c.length; i++) {
          if (rows[0].c[i] && rows[0].c[i].v) {
            header.push(rows[0].c[i].v);
          }
        }
      }
      const items = [];
      for (let i = 0; i < rows.length; i++) {
        if (firstRowIsHeader && i === 0) {
          continue;
        }
        const item = {};
        for (let j = 0; j < header.length; j++) {
          item[header[j]] = rows[i].c && rows[i].c[j] ? rows[i].c[j].v : "";
        }
        items.push(item);
      }
      return items;
    };

    _render = (element, itemTemplate, itemsValues) => {
      for (let i = 0; i < element.children.length; i++) {
        element.removeChild(element.children[i]);
      }
      for (let i = 0; i < itemsValues.length; i++) {
        const itemElement = this._createItemElement(itemTemplate);
        element.appendChild(itemElement);
        this._renderElementValues(element.lastElementChild, itemsValues[i]);
      }
    };

    _createItemElement = (templateSelector) => {
      const template = document.querySelector(templateSelector);
      return document.importNode(template.content, true);
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

    _readFromCache = (key) => {
      const { value, expire } = JSON.parse(
        localStorage[key] || '{ "value": null, "expire": null }'
      );
      if (!expire) {
        return null;
      }
      if (new Date().getTime() < expire) {
        return value;
      } else {
        localStorage.removeItem(key);
      }
      return null;
    };

    _writeToCache = (key, value, ttl = 3600) => {
      localStorage[key] = JSON.stringify({
        value,
        expire: new Date().getTime() + ttl * 1000,
      });
      return value;
    };

    _queryOrGetFromCache = (key, queryFn, ttl = 3600) => {
      return new Promise((resolve) => {
        const cached = this._readFromCache(key);
        if (cached) {
          resolve(cached);
        } else {
          Promise.resolve(queryFn())
            .then((value) => {
              this._writeToCache(key, value, ttl);
              return value;
            })
            .then(resolve);
        }
      });
    };
  }
);
