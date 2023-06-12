const { execSync } = require("child_process");
function pushTag(targetVersion) {
  // 上传代码到仓库

  //   `git push -u origin`
  execSync(`git push -u origin`, { stdio: "inherit" });

  if (targetVersion) {
    // 只传递当前版本标签
    // `git push origin v${targetVersion}`
    execSync(`git push origin v${targetVersion}`, { stdio: "inherit" });
  } else {
    // 将所有标签传到仓库
    // `git push origin -u --tags`
    execSync(`git push -u origin --tags`, { stdio: "inherit" });
  }

  // 只传递当前版本标签
  // `git push origin v${targetVersion}`
  // execSync(`git push origin v${targetVersion}`, { stdio: "inherit" });
}

exports.pushTag = pushTag;
