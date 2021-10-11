/** Specify the disciplines that can be scraped. */

export enum DISCIPLINES {
  CompSci = 'compsci',
  CompEng = 'compeng'
}

export type DisciplinesType = keyof typeof DISCIPLINES;