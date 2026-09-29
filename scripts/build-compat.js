const fs = require('fs');
const babel = require('@babel/core');
const presetEnv = require('@babel/preset-env');

const file = 'app/src/main/assets/index.html';
let html = fs.readFileSync(file, 'utf8');

const polyfills = `
<script id="android-compat-polyfills">
(function(){
  if (!Object.entries) {
    Object.entries = function(obj) {
      var ownProps = Object.keys(obj), i = ownProps.length, resArray = new Array(i);
      while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];
      return resArray;
    };
  }
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(search, fromIndex) {
      if (this == null) throw new TypeError();
      var o = Object(this), len = o.length >>> 0;
      if (len === 0) return false;
      var n = fromIndex | 0, k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      while (k < len) {
        if (o[k] === search || (o[k] !== o[k] && search !== search)) return true;
        k++;
      }
      return false;
    };
  }
  if (!String.prototype.padStart) {
    String.prototype.padStart = function(targetLength, padString) {
      targetLength = targetLength >> 0;
      padString = String(padString !== undefined ? padString : ' ');
      var value = String(this);
      if (value.length >= targetLength) return value;
      targetLength = targetLength - value.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(Math.ceil(targetLength / padString.length));
      }
      return padString.slice(0, targetLength) + value;
    };
  }
  if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
      count = Math.floor(count);
      if (count < 0) throw new RangeError();
      var result = '', pattern = String(this);
      while (count) {
        if (count & 1) result += pattern;
        count >>= 1;
        if (count) pattern += pattern;
      }
      return result;
    };
  }
})();
</script>
<script id="android-error-guard">
(function(){
  window.addEventListener('error', function(ev) {
    try {
      var old = document.getElementById('android-runtime-error');
      if (old) return;
      var box = document.createElement('div');
      box.id = 'android-runtime-error';
      box.style.cssText = 'position:fixed;z-index:2147483647;left:12px;right:12px;bottom:12px;background:#450a0a;color:#fff;border:2px solid #ef4444;border-radius:12px;padding:12px;font:14px sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.5)';
      box.innerHTML = '<b>Erro de compatibilidade do jogo</b><br>' + String(ev.message || 'Erro desconhecido');
      document.body.appendChild(box);
    } catch(e) {}
  });
})();
</script>
`;

html = html.replace('</head>', polyfills + '\n</head>');

let scriptIndex = 0;
html = html.replace(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi, function(full, attrs, code) {
  if (attrs && /id=["']android-(compat-polyfills|error-guard)["']/.test(attrs)) return full;
  scriptIndex++;
  try {
    const result = babel.transformSync(code, {
      presets: [[presetEnv, {
        targets: { chrome: '40' },
        modules: false,
        bugfixes: true,
        useBuiltIns: false
      }]],
      sourceType: 'script',
      comments: true,
      compact: false,
      babelrc: false,
      configFile: false
    });
    return '<script' + attrs + '>' + (result.code || code) + '</script>';
  } catch (e) {
    console.error('Falha ao transpilar script #' + scriptIndex, e);
    process.exit(1);
  }
});

fs.writeFileSync(file, html, 'utf8');
console.log('HTML convertido para WebView legado. Scripts processados:', scriptIndex);
