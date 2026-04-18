export function buildPreviewHtml(code: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, sans-serif; }
    #error { color: red; padding: 16px; white-space: pre-wrap; font-size: 13px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error"></div>
  <script type="text/babel">
    try {
      ${code}
      ReactDOM.render(<App />, document.getElementById('root'));
    } catch (e) {
      document.getElementById('error').textContent = e.message;
    }
  </script>
</body>
</html>`;
}
