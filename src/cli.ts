/**
* Description of the file. Add link pointers with {@link link
    name}
    * @author Donacien
    * @date 10/08/2023
    * Contributors : contributor name,
**/

import { Command } from "commander";
import chalk from 'chalk';
const figlet = require("figlet");
import inquirer from 'inquirer';
const fs = require('fs-extra');
const path = require('path');
import { loadJavascriptTemplate, loadTypeScriptTemplate, modifyManifest, modifyTsConfig} from './utils';

/**
* Function description
* @param note - argv: Is the arguments passed from the command line
* @return The function bellow will take your command and check if it is a valid ext command then it will perform the tasks associated with that command
*/

export async function cli(argv: string[]) {
  const program = new Command();

  program
  .version("1.0.0")
  .arguments('[app-name]')
  .description('Create a new project')
  .option('-h, --help', 'Display help', () => {
    console.log(`Usage: create-ext-app ${chalk.green('<project-directory>')} [options]`);

    console.log('\nOptions:');
    console.log(` -V, --version                  output the version number`);
    console.log(` --template <typescript | javascript>                 Will create ext project with selected template`);
    console.log(` -h, --help                  output usage information`);
    process.exit(0);
  })
  .option('--template <template-name>', 'Specify the project template')
  .action(async (appName, options) => {
    if (!appName) {
      console.log('Please specify the project directory:');
      console.log(`  ${chalk.cyan('create-ext-app')} ${chalk.green('<project-directory>')}`);
      console.log('\nFor example:');
      console.log(`  ${chalk.cyan('create-ext-app')} ${chalk.green('my-ext-app')}`);
      console.log(`\nRun ${chalk.cyan('create-ext-app --help')} to see all options.`);
      process.exit(1); // Exit with an error code
    }

    // Access value of the --template option
    const templateName = options.template;

    // Prompt user to select modules

    const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'modules',
          message: 'Select ext modules to include:',
          choices: ['console', 'timers', 'websessions' ], // Add your module choices here
        },
      ]);

    // console.log(`Creating a new project: ${appName}`);
    let git_repo: string = "https://github.com/donalawa/ext-typescript-template.git";

    if (templateName) {
        if(templateName == 'javascript') {
            git_repo = "https://github.com/donalawa/ext-javascript-template.git"
        }
    }

    const currentPath = process.cwd();
    const projectPath = path.join(currentPath, appName);
    

      console.log(`✨ Crating ext project in ${chalk.green(`${projectPath}`)}`);

    try {
        fs.mkdirSync(projectPath);
        
        if(templateName && templateName == 'javascript') {
            loadJavascriptTemplate(git_repo, projectPath);
        }else {
            loadTypeScriptTemplate(git_repo, projectPath, answers.modules, appName);
            modifyTsConfig(projectPath, answers.modules,);
        }

        modifyManifest(projectPath, answers.modules, appName, templateName);

      } catch (err: any) {
        if (err.code === 'EEXIST') {
          console.log(`${chalk.red(`The file ${appName} already exist in the current directory, please give it another name.`)}`);
        } else {
          console.log(err);
        }
        process.exit(1);    
      }

      console.log(chalk.green('\nProject created successfully!'));
      console.log(chalk.cyan('Happy Porting!'));

  });

  program.parse(argv);
}
