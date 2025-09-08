# Building a CLI Tool with Node.js: A Complete Guide

*Published: January 8, 2025 | 5 min read*

## Introduction

Command-line interfaces (CLIs) are powerful tools that developers use daily. Today, I'll walk through building a simple but useful CLI tool using Node.js.

## Why Build CLI Tools?

CLI tools can:
- Automate repetitive tasks
- Provide quick access to functionality
- Work seamlessly in development workflows
- Run without GUI overhead

## Getting Started

### Prerequisites
```bash
node --version  # v18.0.0 or higher
npm --version   # v8.0.0 or higher
```

### Project Setup

```bash
mkdir my-cli-tool
cd my-cli-tool
npm init -y
```

### Essential Dependencies

```bash
npm install commander chalk inquirer
npm install --save-dev nodemon
```

## Building the CLI

### 1. Create the Entry Point

```javascript
#!/usr/bin/env node
// index.js

const { program } = require('commander');
const chalk = require('chalk');

program
  .version('1.0.0')
  .description('My awesome CLI tool');

program
  .command('greet <name>')
  .description('Greet someone')
  .action((name) => {
    console.log(chalk.green(`Hello, ${name}!`));
  });

program.parse(process.argv);
```

### 2. Make it Executable

Add to `package.json`:
```json
"bin": {
  "mycli": "./index.js"
}
```

### 3. Test Locally

```bash
npm link
mycli greet World
# Output: Hello, World!
```

## Adding Interactive Features

```javascript
const inquirer = require('inquirer');

program
  .command('init')
  .description('Initialize a new project')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: ['JavaScript', 'TypeScript', 'React'],
      },
    ]);
    
    console.log(chalk.blue('Creating project...'));
    // Project creation logic here
  });
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Help Text**: Provide clear, helpful documentation
3. **Progress Indicators**: Show progress for long-running tasks
4. **Configuration**: Support config files for complex tools
5. **Testing**: Write tests for your commands

## Publishing to npm

```bash
npm login
npm publish
```

## Conclusion

Building CLI tools with Node.js is straightforward and rewarding. Start small, iterate often, and soon you'll have tools that make your development life easier.

## Resources

- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Chalk](https://github.com/chalk/chalk)
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

---

*Have questions or suggestions? Feel free to open an issue!*

**Tags:** #nodejs #cli #javascript #tutorial #development