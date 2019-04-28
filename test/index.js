const co = require('co');
const xtpl = require('xtpl');
const fs = require('fs-extra');
const thunkify = require('thunkify');
const path = require('path');
const prettier = require('prettier');
const {NodeVM} = require('vm2');
const _ = require('lodash');
const dslHelper = require('@imgcook/dsl-helper');
const data = require('./data.json');
const vm = new NodeVM({
  console: 'inherit',
  sandbox: {}
});
co(function*() {
  const xtplRender = thunkify(xtpl.render);
  const code = fs.readFileSync(path.resolve(__dirname, '../src/index.js'), 'utf8');
  const renderInfo = vm.run(code)(data, {
    prettier: prettier,
    _: _,
    helper: dslHelper,
  });
  // Parse the code using an interface similar to require("esprima").parse.
  const wxml = yield xtplRender(path.resolve(__dirname, '../src/templates/wxml.xtpl'), renderInfo , {});
  const wxss = yield xtplRender(path.resolve(__dirname, '../src/templates/wxss.xtpl'), renderInfo, {});
  const js = yield xtplRender(path.resolve(__dirname, '../src/templates/js.xtpl'), renderInfo, {});
  const json = yield xtplRender(path.resolve(__dirname, '../src/templates/json.xtpl'), {}, {});
  fs.ensureDirSync(path.resolve(__dirname, './component'));
  fs.writeFileSync(path.join(__dirname, './component/component.wxml'), wxml);
  fs.writeFileSync(path.join(__dirname, './component/component.wxss'), wxss);
  fs.writeFileSync(path.join(__dirname, './component/component.js'), js);
  fs.writeFileSync(path.join(__dirname, './component/component.json'), json);
});