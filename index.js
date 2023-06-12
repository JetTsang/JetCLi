const program = require('commander')
const chalk = require('chalk')
const figlet = require('figlet')

const handleCreate = require('./lib/create')
// logo
console.log(
    chalk.greenBright.bold(
        figlet.textSync('Jet-cli',{
            font: "3D-ASCII",
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 80,
            whitespaceBreak: true,
        })
    )
)

// 创建命令
program
    .command("create <project-name>")
    .description("create a new project")
    .option("-f,--force","overwrite target directory if it exists")
    .action((projectName,cmd)=>{
        handleCreate(projectName,cmd)
    })

// 版本命令：jet-cli -V
program
  .name("Jet-cli")
  .usage(`<command> [option]`)
  .version(`Jet-cli ${require("./package.json").version}`);


program.parse(process.argv)