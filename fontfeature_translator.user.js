// ==UserScript==
// @name FontFeatureSettingsTranslator
// @version 0.1
// @description translate font-feature-settings properties from -moz to -webkit.
// @match http://*/*
// @match https://*/*
// @run-at document-end
// ==/UserScript==

(function() {

var InjectCssStyle = function(css) {
  var s = document.createElement('style');
  s.innerHTML = css;
  document.body.appendChild(s);
};

var ExtractRules = function(text) {
  text = text.replace(/\n/g, '');
  var rules = [];
  while (text.length > 0) {
    if (!text.match(/\s*([^{]+)\s*\{\s*([^}]+)\s*\}/m))
      break;
    var selector = RegExp.$1;
    var styles = RegExp.$2;
    text = RegExp.rightContext;
    if (!styles.match(/-moz-font-feature-settings:\s*"?([^"]+)"?;/))
      continue;
    var settings = RegExp.$1.replace(/=/g, ' ');
    rules.push({'selector': selector, 'settings': settings});
  }
  return rules;
};

var HandleCssFromUrl = function(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      HandleCssFromText(xhr.responseText);
    }
  };
  xhr.send();
};

var HandleCssFromText = function(text) {
  var rules = ExtractRules(text);
  if (rules.length == 0)
    return;
  var css = "";
  for (var i = 0; i < rules.length; ++i) (function(rule) {
    css += rule['selector'] + '{ -webkit-font-feature-settings: ' +
      rule['settings'] + '; }\n';
  })(rules[i]);
  InjectCssStyle(css);
};

var CheckFontFeatureSettings = function() {
  for (var i = 0; i < document.styleSheets.length; ++i) (function(sheet) {
    if (sheet.href)
      HandleCssFromUrl(sheet.href);
  })(document.styleSheets[i]);

  var styleTags = document.getElementsByTagName('style');
  for (var i = 0; i < styleTags.length; ++i) (function(tag) {
    HandleCssFromText(tag.innerText);
  })(styleTags[i]);
};

CheckFontFeatureSettings();

})();
