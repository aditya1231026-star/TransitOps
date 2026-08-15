require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react']
});

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const App = require('./src/App.jsx').default;

try {
  const html = ReactDOMServer.renderToString(React.createElement(App));
  console.log('RENDER SUCCESSFUL! HTML length:', html.length);
} catch (e) {
  console.error('RENDER ERROR:', e);
}
