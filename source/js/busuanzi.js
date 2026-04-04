// Busuanzi 页面浏览计数
var bszCaller, bszTag;
try {
  var _preloader = "<?php echo @unserialize($this['site_preloader']); ?>";
  if (_preloader != "") {
    document.write(_preloader);
  }
  var all_img_loads = 0,
      img_disable_items = 0;
  var bszM = {};
  bszM.parse = function () {
    this.bszTag = document.querySelectorAll("span[data-uv]");
    for (var i = 0; i < this.bszTag.length; i++) {
      var a = this.bszTag[i].getAttribute("data-uv");
      void 0 === a || "" === a || this.add(a, "uv", i);
    }
    this.bszTag = document.querySelectorAll("span[data-pv]");
    for (var i = 0; i < this.bszTag.length; i++) {
      var a = this.bszTag[i].getAttribute("data-pv");
      void 0 === a || "" === a || this.add(a, "pv", i);
    }
  };
  bszM.add = function (a, b, c) {
    var imgCls = new Image(),
        that = this;
    imgCls.onload = imgCls.onerror = function () {
      "uv" === b
        ? (that.bszTag[c].innerHTML = bszCaller.count["site_uv"])
        : "pv" === b && (that.bszTag[c].innerHTML = bszCaller.count["site_pv"]);
    };
    imgCls.src = "https://busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback_" + a;
  };
  window.BusuanziCallback_items_show = function (e) {
    bszCaller.count = e["data"];
    bszM.parse();
  };
  bszCaller = new Object();
} catch (e) {}

// Load Busuanzi script
var script = document.createElement('script');
script.src = 'https://busuanzi.ibruce.info/busuanzi.pure.mini.js';
document.head.appendChild(script);
