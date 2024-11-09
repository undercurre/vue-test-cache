import { resolve } from 'path'
import fs from 'fs-extra'
import { execSync } from 'child_process'
import chalk from 'chalk'
import packageJSON from '../package.json' assert { type: 'json' }
import versionJSON from '../public/version.json' assert { type: 'json' }
import path from 'path'

const { writeFileSync, copyFileSync } = fs
const rootPath = resolve(process.cwd())
const buildPath = resolve(process.cwd(), 'build')
const publicPath = path.resolve(process.cwd(), 'public')
const versionPath = path.resolve(publicPath, 'version.json')

/**
 * upgradeVersion 升级版本号
 * @param String oldVersion 当前版本号，如：1.0.12
 * @return String newVersion 升级后的版本号，如：1.0.13
 */
const upgradeVersion = (oldVersion) => {
  const maxRange = 99 // 版本号的每一节最大范围
  const increase = 1 // 每次升级增加的版本号

  // 拿到版本号的每一节数字
  const list = oldVersion.split('.').map((x) => Number(x))
  for (let i = list.length - 1; i >= 0; i--) {
    // 1）当每一节版本号升级后大于最大范围，并且不是第一节，重置该节为 0，并前进一节
    if (list[i] + increase > maxRange && i > 0) {
      list[i] = 0
    } else {
      // 2）版本号升级，结束循环
      list[i] += increase
      break
    }
  }

  return list.join('.')
}

const execSyncCommand = (command, options) => {
  options = Object.assign({ stdio: 'ignore' }, options)
  execSync(command, options)
}

/**
 * 升级版本号操作，根据场景来决定发布行为。
 * 1. 随程序构建发布版本，若程序构建次数不可控，用户将会多次收到更新
 * 2. 手动构建发布版本，当需要去提醒用户更新时，手动进行构建（推荐）
 */

// 1. 读取当前版本号
const version = versionJSON.version

// 2. 升级版本号
const newVersion = upgradeVersion(version)

// 3. 更新版本到文件中，并拷贝到 build 目录下
const newVersionJSON = {
  version: newVersion,
}
writeFileSync(versionPath, JSON.stringify(newVersionJSON, null, 2))
copyFileSync(versionPath, resolve(buildPath, 'version.json')) // 可以选择是否同步最新版本号到 build 目录下

// 4. 提交 version.json 版本记录（git）
const commandOptions = { cwd: rootPath }
execSyncCommand(`git restore --staged .`, commandOptions) // 撤销暂存区的文件
execSyncCommand(`git add .`, commandOptions) // 添加 version.json 到暂存区
execSyncCommand(
  `git commit -m "${`chore: publish version ${newVersion} by ${packageJSON.name}`}"`,
  commandOptions,
) // 提交 commit
execSyncCommand(`git pull origin`, commandOptions) // 拉取远端代码
execSyncCommand(`git push origin`, commandOptions) // 推送

console.log(chalk.green(`publish successfully（${packageJSON.name} ${newVersion}）.\n`))
