#!/usr/bin/env node

/**
 * Patch script for openkounter.js
 * Adds 24-hour PV limit per page (same as UV)
 * Run this after npm install
 */

const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../node_modules/hexo-theme-fluid/source/js/openkounter.js');

const validPagePVFunction = `  // 校验是否为有效的页面访问（24小时内只计一次）
  function validPagePV(path) {
    const key = \`OpenKounter_PV_Flag_\${path}\`;
    const now = Date.now();

    try {
      const flag = localStorage.getItem(key);
      if (flag) {
        const lastVisit = parseInt(flag, 10);
        // 距离上次访问小于 24 小时则不计为新 PV
        if (now - lastVisit <= 86400000) {
          return false;
        }
      }
      localStorage.setItem(key, now.toString());
    } catch (e) {
      // localStorage 不可用时默认计为 PV
      console.warn('OpenKounter: localStorage is not available');
    }
    return true;
  }`;

try {
  let content = fs.readFileSync(targetFile, 'utf8');

  // Check if already patched
  if (content.includes('validPagePV')) {
    console.log('✓ openkounter.js already patched');
    process.exit(0);
  }

  // Add validPagePV function after validUV
  content = content.replace(
    /(\n  }\n\n  function addCount\(\))/,
    `\n  }\n\n${validPagePVFunction}\n\n  function addCount()`
  );

  // Update page PV increment logic
  content = content.replace(
    /const viewGetter = getRecord\(target\)\.then\(\(record\) => \{\s+if \(enableIncr\) \{/,
    `const viewGetter = getRecord(target).then((record) => {
        const incrPV = validPagePV(target) && enableIncr;
        if (incrPV) {`
  );

  // Update display logic for page views
  content = content.replace(
    /ele\.innerText = \(record\.time \|\| 0\) \+ \(enableIncr \? 1 : 0\);/g,
    (match, offset) => {
      if (content.slice(offset - 200, offset).includes('openkounter-page-views')) {
        return `ele.innerText = (record.time || 0) + (incrPV ? 1 : 0);`;
      }
      return match;
    }
  );

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('✓ openkounter.js patched successfully');
} catch (error) {
  console.error('✗ Error patching openkounter.js:', error.message);
  process.exit(1);
}
