https://docs.google.com/spreadsheets/d/1PZ33mOE0Td0t88-8ak8OZ4-CxPDZbhTJfak3VbbvFG0/gviz/tq?tqx=out:json&sheet=exercises

// Get spreadsheet data
fetch("https://docs.google.com/spreadsheets/d/1PZ33mOE0Td0t88-8ak8OZ4-CxPDZbhTJfak3VbbvFG0/gviz/tq?tqx=out:json&sheet=exercises").then(response => response.text()).then(text => JSON.parse(String(text).match(/google\.visualization\.Query\.setResponse\((.+?)\);/m)[1]).table).then(console.log);

// Get video info (format can be "xml")
https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=SjJs4VhvMy0

// Get thumb of video, if thumb is not exists - we get smaller image
https://img.youtube.com/vi/SjJs4VhvMy0/0.jpg
