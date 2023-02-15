#!/usr/bin/env node

/**
 * Class generator for Swagger API annotations
 *
 * This script generates TypeScript classes from a TypeScript interface file. Currently, we are
 * using gRPC-generated request and response objects to interact with the HTTP API.
 * Unfortunately, Swagger API annotations only accepts classes, so we need to generate
 * classes from TypeScript interfaces created with ts-proto. To generate the DTOs,
 * use the following command in root folder: npm run build:dtos
 *
 * It's important to note that you will need to add missing imports manually.
 * TODO(@polaroi8d): Improve this script to automatically add imports.
 */

import * as ts from 'typescript'
import * as fs from 'fs'
import * as commander from 'commander'

commander
  .option('-i, --input <inputFile>', 'Input file containing interface declarations')
  .option('-o, --output <outputFile>', 'Output file to write generated classes to')
  .parse(process.argv)

// Load the input file and parse it with the TypeScript compiler API
const input = fs.readFileSync(commander.input, 'utf8')
const sourceFile = ts.createSourceFile(commander.input, input, ts.ScriptTarget.Latest, true)

// Find all interface declarations in the source file
const interfaces: ts.InterfaceDeclaration[] = []
function findInterfaces(node: ts.Node) {
  if (ts.isInterfaceDeclaration(node)) {
    interfaces.push(node)
  }
  ts.forEachChild(node, findInterfaces)
}
findInterfaces(sourceFile)

function getPropertyType(node: ts.PropertySignature): string {
  if (!node) {
    return 'any'
  }

  if (node.type.getText().includes('Empty') || node.type.getText().includes('Timestamp')) {
    return 'any'
  }

  return node.type.getText()
}

// Generate class declarations for each interface
const classes = interfaces.map(interfaceNode => {
  const className = interfaceNode.name.text
  const classMembers = interfaceNode.members.map(memberNode => {
    const memberName = memberNode.name.getText()
    const memberType = getPropertyType(memberNode as ts.PropertySignature)
    return `${memberName}: ${memberType};`
  })
  return `export class ${className}Dto { ${classMembers.join(' ')} }`
})

// Write the generated classes to the output file with eslint disabled
fs.writeFileSync(commander.output, '/* eslint-disable */\n\n', 'utf8')
fs.appendFile(commander.output, classes.join('\n'), 'utf8', err => {
  if (err) {
    console.error(err)
  }
})
