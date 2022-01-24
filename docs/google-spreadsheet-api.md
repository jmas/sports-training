## Get spreadsheet data in JSON

https://docs.google.com/spreadsheets/d/1PZ33mOE0Td0t88-8ak8OZ4-CxPDZbhTJfak3VbbvFG0/gviz/tq?tqx=out:json&sheet=exercises

## Get spreadsheet data JS

```js
fetch(
  "https://docs.google.com/spreadsheets/d/1PZ33mOE0Td0t88-8ak8OZ4-CxPDZbhTJfak3VbbvFG0/gviz/tq?tqx=out:json&sheet=exercises"
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
  .then(console.log);
```
