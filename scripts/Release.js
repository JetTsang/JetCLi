/**
 * @description 设置版本并且发布版本到git
 */

// 捕获命令工具
const commander = require("commander");

// 命令行选择工具
const inquirer = require("inquirer");

// 语义版本生成器： 检验版本是否合格
const semver = require("semver");

// 命令行润色
const chalk = require("chalk");
// 有效性验证
// semver.valid()
// 大小比较
// semver.gt()

const { execSync, exec } = require("child_process");
const { resolve } = require("path");
const { readJSONSync, writeJSONSync } = require("fs-extra");

const { pushTag }  = require('./utils.js')

const pkgPath = resolve(__dirname, "../package.json"); // 项目根目录的package.json路径

// 注册一条命令来获取模式
// console.log(commander)
commander.command("release").option("--path").action((_, options) => {
  // if (options) {
  //   // 获取子项目路径 ： packages/
  //   const projPath = resolve(__dirname, "../", options[0]);
  //   const packageJsonPath = resolve(projPath, "./package.json");
  //   handleSetVersion(packageJsonPath);
  // } else {
    handleSetVersion();
  // }
});
commander.parse(process.argv);

// TODO:注册一个命令 ： 设置主包的发版
// commander.option("-m").action((_, options) => {
//   handleSetVersion();
// });

// 更新版本号
// 1. 通过标准化选择
// 2. 通过手动输入
async function handleSetVersion(packageJsonPath = pkgPath) {
  const pkg = readJSONSync(packageJsonPath);
  let version;
  //  选择 手动输入还是标准化
  // 1. 获取版本号，通过选择（然后自增）或者手动输入
  // TODO:增加等待特效
  const { isInput } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isInput",
      default: false,
      message: `手动输入版本号还是自增版本?（默认自增）`,
    },
  ]);
  //  手动输入
  const handler = isInput ? inputVersion : selectReleaseVersion;

  version = await handler(pkg.version);

  // 2. 确认，是否写入当前版本，并写入版本
  const { confirmRelease } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmRelease",
      default: false,
      message: `确认写入版本 v${version}?`,
    },
  ]);

  if (confirmRelease) {
    // 3. 更新版本号
    console.log(chalk.blue("更新版本号"));

    writeJSONSync(packageJsonPath, { ...pkg, version }, { spaces: 2 });

    // 4. 提交package.json，设置tag操作 执行命令，
    // `git add ${packageJsonPath}`
    execSync(`git add ${packageJsonPath}`, { stdio: "inherit" });
    // `git commit -m 'chore(release): v${version}'`
    execSync(`git commit -m 'chore(release): v${version}'`, {
      stdio: "inherit",
    });
    // 给本地打标签
    // `git tag -a v${version} -m "Release Version v${version} by Publish.js"`
    execSync(
      `git tag -a v${version} -m "Release Version v${version} by Publish.js"`,
      { stdio: "inherit" }
    );
    const { confirmPush } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmPush",
        default: false,
        message: `是否将此版本 v${version} 发布到远程仓库?`,
      },
    ]);
    if(confirmPush){
      pushTag(version)
    }
    
    // TODO: 生成changeLog
  } else {
    console.log(chalk.blue("取消写入版本！！！"));
  }
}

function inputVersion(currentVersion) {
  return new Promise(async (resolve, reject) => {
    try {
      const { version } = await inquirer.prompt([
        {
          type: "input",
          name: "version",
          message: "请输入你的将要发布的版本号：",
          validate(userInput) {
            // 有效性和大小比较

            // 拿到标准化后的版本
            const validVersion = semver.valid(userInput);
            // 3.3.0-beta.4 之类的
            // 3.3.0之类的
            if (validVersion === null) {
              return "请输入符合规范的版本！！！";
            }

            // 输入的版本小于当前版本，则不通过
            if (!semver.gt(validVersion, currentVersion)) {
              return "输入的版本号要大于当前版本号！！！";
            }

            return true;
          },
        },
      ]);
      resolve(version);
    } catch (error) {
      reject(error);
    }
  });
}

function selectReleaseVersion(currentVersion) {
  return new Promise(async (resolve, reject) => {
    try {
      // 获取当前是不是预发布版本
      const preId =
        semver.prerelease(currentVersion) &&
        semver.prerelease(currentVersion)[0];

      const versionChoices = [
        "patch", // (主版本号)
        "minor", // (次版本号)
        "major", // (修订号)
        ...(preId ? ["prepatch", "preminor", "premajor", "prerelease"] : []),
      ];
      console.log(currentVersion);
      // 是否是预发布
      console.log(preId);

      // 基于当前版本号 和 发布版本号类型 生成 新的版本号
      const inc = (i) => semver.inc(currentVersion, i, preId);

      const { release } = await inquirer.prompt([
        {
          type: "list",
          name: "release",
          message: "选择发布版本号类型",
          choices: versionChoices.map((i) => `${i} (${inc(i)})`),
        },
      ]);

      const targetVersion = release.match(/\((.*)\)/)[1]; // 1.0.0

      resolve(targetVersion);
    } catch (error) {
      reject(error);
    }
  });
}

// //   5. 上传到仓库 (最好还是分开，或者利用--mode update)
// function publish(targetVersion) {
//   // 1.上传代码到仓库

//   //   `git push -u origin`
//   execSync(`git push -u origin`, { stdio: "inherit" });
//   // 将所有标签传到仓库
//   // `git push origin -u --tags`
//   // execSync(`git push -u origin`, { stdio: 'inherit' });
//   // 2.只传递当前版本标签
//   // `git push origin v${targetVersion}`
//   execSync(`git push origin v${targetVersion}`, { stdio: "inherit" });
// }
