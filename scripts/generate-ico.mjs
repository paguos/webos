#!/usr/bin/env node
import pngToIco from 'png-to-ico'
import { writeFileSync } from 'fs'

console.log('Generating Windows ICO file...')

const ico = await pngToIco('build/icon-256.png')
writeFileSync('build/icon.ico', ico)

console.log('✓ Created build/icon.ico')
