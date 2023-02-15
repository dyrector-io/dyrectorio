#!/usr/bin/env node

import * as ts from 'typescript'
import * as fs from 'fs'

// Define the command line interface of the tool using commander
import * as commander from 'commander'

commander
  .option('-i, --input <inputFile>', 'Input file containing interface declarations')
  .option('-o, --output <outputFile>', 'Output file to write generated classes to')
  .parse(process.argv)

// Load the input file and parse it with the TypeScript compiler API
const input = fs.readFileSync(commander.input, 'utf8')
const sourceFile = ts.createSourceFile(commander.input, input, ts.ScriptTarget.Latest, /* setParentNodes */ true)

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
  if (!node.type) {
    return 'any'
  }

  if (node.type.getText().includes('Empty') || node.type.getText().includes('Timestamp')) {
    return 'any'
  }

  switch (node.type.getText()) {
    case 'Empty':
    case 'Promise<Empty> | Observable<Empty> | Empty':
    case 'Timestamp':
      return 'any'
    default:
      return node.type.getText()
  }
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

// Write the generated classes to the output file
fs.writeFileSync(commander.output, '/* eslint-disable */\n', 'utf8')
fs.appendFile(commander.output, classes.join('\n'), 'utf8', err => {
  if (err) {
    console.error(err)
  }
})
