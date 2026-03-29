'use strict';

// Ensure markdown-authored absolute asset paths like /assets/foo.png
// are prefixed with the configured Hexo root (e.g. /blog/assets/foo.png)
// when the site is deployed as Project Pages.
hexo.extend.filter.register('after_render:html', function (html) {
  const root = this.config.root || '/';
  const normalizedRoot = root.endsWith('/') ? root.slice(0, -1) : root;

  if (!normalizedRoot) {
    return html;
  }

  return html
    .replace(/(src|href)=("|')\/assets\//g, `$1=$2${normalizedRoot}/assets/`)
    .replace(/content=("|')https:\/\/1241262510\.github\.io\/assets\//g, `content=$1https://1241262510.github.io${normalizedRoot}/assets/`);
});
