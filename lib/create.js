const path = require("path");
const fse = require("fs-extra");
const Inquirer = require("inquirer");
const Creator = require('./Creater')
const { loading }  = require('./util')
console.log(loading)
module.exports  = async function create (projectName, options) {
    // 获取当前工作目录
    const cwd = process.cwd();
    console.log(cwd)
    const targetDirectory = path.join(cwd, projectName);

    // 如果存在，则做拦截
    if (fse.existsSync(targetDirectory)) {
      //  有force ，则删除
      if (options.force) {
        // 删除重名目录
        await fse.remove(targetDirectory);
      } else {
        let { isOverwrite } = await new Inquirer.prompt([
          // 返回值为promise
          {
            name: "isOverwrite", // 与返回值对应
            type: "list", // list 类型
            message: "Target directory exists, Please choose an action",
            choices: [
              { name: "Overwrite", value: true },
              { name: "Cancel", value: false },
            ],
          },
        ]);
        if (!isOverwrite) {
          console.log("Cancel");
          return;
        } else {
          await loading(
            `Removing ${projectName}, please wait a minute`,
            fse.remove,
            targetDirectory
          );
        }
      }
    }
  
    // 创建项目
    const creator = new Creator(projectName, targetDirectory);
  
    creator.create();
  };