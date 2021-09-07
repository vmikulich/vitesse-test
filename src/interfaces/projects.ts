import { ICase } from './case'

export interface IProjects {
  caseGroups: Array<ICase>
  casesTotal: number
  description: string
  id: number
  name: string
}
