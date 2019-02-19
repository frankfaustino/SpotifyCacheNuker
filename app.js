const fs = require('fs')
const { join } = require('path')
const { homedir } = require('os')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)
const lstat = promisify(fs.lstat)
const path = join(homedir(), '/Library/Caches/com.spotify.client/Data')

const main = async () => {
  let total = 0
  const stack = [path]

  while (stack.length) {
    const current = stack.pop()

    const stats = await lstat(current)

    if (stats.isFile()) total += stats.size

    if (stats.isDirectory()) {
      const dir = await readdir(current)

      dir.forEach(dirItem => stack.push(join(current, dirItem)))
    }
  }
  return total
}

main().then(total => console.log(total))
