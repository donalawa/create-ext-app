/**
* Description of the file. Add link pointers with {@link link
    name}
    * @author Donacien
    * @date 11/08/2023
    * Contributors : contributor name,
**/

const { execSync } = require("child_process");
const fs = require("fs-extra");
import chalk from "chalk";

function setAppName(path: string, projectName: string) {
    try {
      // Read current package.json file synchronously
      const packageJson = JSON.parse(
        fs.readFileSync(`${path}/package.json`, "utf8")
      );
  
      // Modify name field
      packageJson.name = projectName;
  
      // Save updated package.json back to the file synchronously
      fs.writeFileSync(
        `${path}/package.json`,
        JSON.stringify(packageJson, null, 2),
        "utf8"
      );
    } catch (err) {
      console.error("Error:", err);
      process.exit(1);
    }
  }

export function loadTypeScriptTemplate(
  repo: string,
  projectPath: string,
  modules: string[],
  projectName: string
) {
  try {
    execSync(`git clone --depth 1 --quiet ${repo} ${projectPath}`);

    process.chdir(projectPath);

    setAppName(projectPath, projectName);

    console.log(
      chalk.cyan(
        "\nInstalling dependencies. This might take a couple of minutes."
      )
    );
    execSync("npm install");

    modules.forEach((module: string) => {
      execSync(`npm install @extpkg/types-${module} --save-dev`);
    });

    execSync("npx rimraf ./.git");

    console.log(`\nSuccess! Created testing at ${projectPath}`);
    console.log(`\nInside that directory, you can run:`);
    console.log(`\n ${chalk.cyan("npm run build:")}`);
    console.log(`    To buldle the project into static files for production`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export function loadJavascriptTemplate(repo: string, projectPath: string) {
  try {
    execSync(`git clone --depth 1 --quiet ${repo} ${projectPath}`);

    process.chdir(projectPath);

    execSync("npx rimraf ./.git");

    console.log(`\nSuccess! Created testing at ${projectPath}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export function modifyManifest(
  path: string,
  modules: string[],
  projectName: string,
  templateName: string
) {
  const manifestFilePath =
    templateName == "javascript"
      ? `${path}/manifest.json`
      : `${path}/src/manifest.json`; // Path to manifest.json file

  try {
    // Read the current manifest.json file
    const manifestJson = JSON.parse(fs.readFileSync(manifestFilePath, "utf8"));

    // Check if "modules" property exists, and create it if it doesn't
    if (!manifestJson.modules) {
      manifestJson.modules = {};
    }

    // Loop through array of module names and add each module with an empty object inside "modules"
    modules.forEach((moduleName) => {
      manifestJson.modules[moduleName] = {};
    });

    //Modify  Name in Manifest
    manifestJson.name = projectName;
    manifestJson.short_name = projectName;

    // Save updated manifest.json file
    fs.writeFileSync(
      manifestFilePath,
      JSON.stringify(manifestJson, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

export function modifyTsConfig(path: string, modules: string[]) {
  try {
    // Read the current tsconfig.json file
    const tsconfigJson = JSON.parse(
      fs.readFileSync(`${path}/tsconfig.json`, "utf8")
    );

    // Check if the "compilerOptions" property exists, and create it if it doesn't
    if (!tsconfigJson.compilerOptions) {
      tsconfigJson.compilerOptions = {};
    }

    // Check if "types" property exists, and create it if it doesn't
    if (!tsconfigJson.compilerOptions.types) {
      tsconfigJson.compilerOptions.types = [];
    }

    // Push  new type entries into the existing types array
    let newTypes: string[] = [];

    modules.forEach((module: string) => {
      newTypes.push(`@extpkg/types-${module}`);
    });

    // Add new type entries to the existing types array
    tsconfigJson.compilerOptions.types = [
      ...new Set([...tsconfigJson.compilerOptions.types, ...newTypes]),
    ];

    // Save the updated tsconfig.json file back to disk
    fs.writeFileSync(
      `${path}/tsconfig.json`,
      JSON.stringify(tsconfigJson, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}