const glob = require("glob");
const Generators = require("yeoman-generator");
const promt = require('./promt');

module.exports = class extends Generators {
  constructor(args, options) {
    super(args, options);
    this.helpMethod = () => {
      console.log('wont not be called automatically');
    }
    this.root = process.cwd();
    this.config.save();
  }

  prompting() {
    return this.prompt(promt)
      .then((answer) => {
        this.data = Object.assign({}, answer)
      })
  }

  writing() {
    const files = glob.sync(`**`, {
      cwd: `${__dirname}/templates`,
      dot: true,
      nodir: true,
    })

    console.log('glob files', files)
    const tplList = {
      'serverApp/app.js': 'serverApp/app.js',
    }


    for (let file of files) {
      if (!tplList[file]) {
        this.fs.copy(
          this.templatePath(file.src || file),
          this.destinationPath(file.dest || file.src || file),
          // { globOptions: { ignore: ignorePaths } }
        )
      } else {
        //  ejs模版渲染
        console.log('this.data', this.data, 'file', file);
        this.fs.copyTpl(
          this.templatePath(file.src || file),
          this.destinationPath(tplList[file] || file),
          this.data,
          {}, // templateOptions    // not here
          // { globOptions: { ignore: ignorePaths } } // < but here
        )
      }
    }
  }

  //  default阶段执行
  managePackagejson() {
    const filename = `${this.root}/package.json`;
    this.appPackage = this._readJSON(filename);
    this.appPackage.scripts.deploy = "npm run build";
    this.appPackage.scripts.serverApp = "node ./serverApp/app.js";
    const defaultConfig = this._readJSON(this.templatePath('./.deployrc'));
    const deploy = this.appPackage.deploy || defaultConfig;
    this.data = Object.assign({}, this.data, {
      static: deploy.static,
      proxy: JSON.stringify(deploy.proxy)
    });
    // console.log(this.data);
    this._writeJSON(`${this.root}/package.json`, this.appPackage);
  }

  _readJSON(filename) {
    return this.fs.readJSON(filename)
  }

  _writeJSON(filename, content) {
    this.fs.writeJSON(filename, content);
  }
}

