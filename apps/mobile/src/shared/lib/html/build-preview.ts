export function buildPreviewHtml(code: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js"></script>
  <script>
    // Lucide icons accessible as Icons.Home, Icons.Search, etc.
    window.Icons = window.lucideReact || window.LucideReact || {};
  </script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, sans-serif;
    }
    body {
      height: 100%;
      overflow: hidden;
      position: fixed;
      width: 100%;
    }
    #root {
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
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
