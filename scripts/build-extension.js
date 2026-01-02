import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distExtension = path.join(rootDir, 'dist-extension')
const extensionSrc = path.join(rootDir, 'extension')

async function buildExtension() {
  console.log('Assembling extension package...')

  // Copy manifest.json
  await fs.copy(
    path.join(extensionSrc, 'manifest.json'),
    path.join(distExtension, 'manifest.json')
  )
  console.log('✓ Copied manifest.json')

  // Copy icons
  if (await fs.pathExists(path.join(extensionSrc, 'icons'))) {
    await fs.copy(
      path.join(extensionSrc, 'icons'),
      path.join(distExtension, 'icons')
    )
    console.log('✓ Copied icons')
  }

  // Move newtab.html from extension/ subdirectory to root and fix paths
  const newtabSrc = path.join(distExtension, 'extension', 'newtab.html')
  const newtabDest = path.join(distExtension, 'newtab.html')
  if (await fs.pathExists(newtabSrc)) {
    // Read the HTML file
    let htmlContent = await fs.readFile(newtabSrc, 'utf-8')

    // Fix asset paths from ../assets/ to ./assets/
    htmlContent = htmlContent.replace(/\.\.\/assets\//g, './assets/')

    // Write the fixed HTML to the destination
    await fs.writeFile(newtabDest, htmlContent)
    console.log('✓ Moved newtab.html to root and fixed asset paths')

    // Remove empty extension directory
    await fs.remove(path.join(distExtension, 'extension'))
  }

  console.log('\n✓ Extension build complete!')
  console.log(`\nLoad unpacked extension from: ${distExtension}`)
  console.log('\nInstructions:')
  console.log('1. Open chrome://extensions/')
  console.log('2. Enable "Developer mode"')
  console.log('3. Click "Load unpacked"')
  console.log('4. Select the dist-extension/ directory')
  console.log('5. Open new tab to test\n')
}

buildExtension().catch(console.error)
