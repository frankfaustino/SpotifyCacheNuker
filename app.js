const fs = require('fs')
const { homedir } = require('os')
const { join } = require('path')
const readline = require('readline')
const { promisify } = require('util')

const lstat = promisify(fs.lstat)
const readdir = promisify(fs.readdir)
const path = join(homedir(), '/Library/Caches/com.spotify.client/Data')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const main = async () => {
  const output = {
    files: [],
    total: 0
  }
  const stack = [path]

  while (stack.length) {
    const current = stack.pop()
    const stats = await lstat(current)

    if (stats.isFile()) {
      output.files.push(current)
      output.total += stats.size
    }

    if (stats.isDirectory()) {
      const dir = await readdir(current)

      dir.forEach(dirItem => stack.push(join(current, dirItem)))
    }
  }

  return output
}

const nukeCache = files => {
  files.forEach(async file => {
    console.log(`💥 ${file}`)
    await fs.unlinkSync(file)
  })

  console.log('ALL DONE. KTHXBYE 👋')
  rl.close()
}

main()
  .then(({ files, total }) => {
    if (files.length < 1) {
      console.log('Spotify cache is empty. Nothing to nuke. 🎉')
      rl.close()
    } else {
      console.log(`Spotify cache has ${files.length} files and is ${(total / 1e9).toFixed(2)} GB 😱`)

      rl.question('Would you like to nuke it? y / n:  ', answer => {
        if (answer === 'y') {
          console.log('\nOK. NUKING...')
          nukeCache(files)
        }
      })
    }
  })
  .catch(err => console.error(err))
