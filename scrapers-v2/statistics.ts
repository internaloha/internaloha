import * as fs from 'fs';
import * as path from 'path';
import { Command, Option } from 'commander';

export enum DISCIPLINES {
  CompSci = 'compsci',
  CompEng = 'compeng'
}
export type DisciplinesType = keyof typeof DISCIPLINES;

// Process the command line arguments. A legal scraper name is required.
const program = new Command()
  .addOption(new Option('-l, --log-level <level>', 'Specify logging level')
    .default('warn')
    .choices(['trace', 'debug', 'info', 'warn', 'error']))
  .addOption(new Option('-d, --discipline <discipline>', 'Specify what types of internships to find')
    .default(DISCIPLINES.CompSci)
    .choices(Object.values(DISCIPLINES)))
  .option('-sd, --statistics-dir <statisticsdir>', 'Set the directory to hold statistics files.', './statistics')
  .parse(process.argv);
const options = program.opts();

// Uncomment the following line to verify the CLI option values.
// console.log('cli options:', options);

// const directory = `${options.statisticsDir}/${options.discipline}`;
const directory = path.join(options.statisticsDir, options.discipline);

const statisticsFiles = fs.readdirSync(directory).filter(file => path.extname(file) === '.json');

statisticsFiles.forEach(file => {
  const fileData = fs.readFileSync(path.join(directory, file));
  const json = JSON.parse(fileData.toString());
  console.log(json);
});

