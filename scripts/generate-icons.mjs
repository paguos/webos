#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'

// Read the SVG file
const svg = readFileSync('public/default-icon.svg', 'utf-8')

// Ensure build directory exists
mkdirSync('build', { recursive: true })

// Generate 1024x1024 PNG as base
console.log('Generating base 1024x1024 PNG...')
const resvg = new Resvg(svg, {
  fitTo: {
    mode: 'width',
    value: 1024,
  },
})
const pngData = resvg.render()
const pngBuffer = pngData.asPng()

writeFileSync('build/icon-1024.png', pngBuffer)
console.log('✓ Created build/icon-1024.png')

// Generate 512x512 PNG for Linux
console.log('Generating 512x512 PNG for Linux...')
await sharp(pngBuffer)
  .resize(512, 512)
  .png()
  .toFile('build/icon.png')
console.log('✓ Created build/icon.png (512x512)')

// Generate ICO for Windows (256x256)
console.log('Generating 256x256 PNG for Windows ICO...')
await sharp(pngBuffer)
  .resize(256, 256)
  .png()
  .toFile('build/icon-256.png')
console.log('✓ Created build/icon-256.png')

// Note: ICNS and ICO generation will be handled by electron-builder
console.log('\n✓ Icon generation complete!')
console.log('Note: electron-builder will automatically generate .icns and .ico from these PNGs')
