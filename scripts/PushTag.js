
const { readJSONSync } = require("fs-extra");
const { resolve } = require("path");
// 捕获命令工具
const commander = require("commander");
// 命令行选择工具
const inquirer = require("inquirer");

const { pushTag }  = require('./utils.js')

// 发布版本到远程仓库
commander
  .option("-P")
  .option("--package")
  .action(async (_, option) => {
    // 确认发布版本?(确保已经打上本地版本)

    let projPath;
    if (option) {
      // 找到对应的package的版本，并且发布版本到仓库
      projPath = resolve(
        __dirname,
        "../",
        "./packages",
        option[0],
        "./package.json"
      );
    } else {
      // 直接发布 主包版本
      projPath = resolve(__dirname, "../package.json");
    }
    let { version } = readJSONSync(projPath);
    const { confirmRelease } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmRelease",
        default: false,
        message: `确认发布版本 v${version}?`,
      },
    ]);
    if (confirmRelease) {
      pushTag(version);
    } else {
      console.log("取消发布版本");
    }
  });
commander.parse(process.argv);


