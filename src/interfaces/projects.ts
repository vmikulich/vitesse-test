import { ICase } from './case'

export interface IProject {
  caseGroups: Array<ICase>
  casesTotal: number
  description: string
  id: number
  name: string
  status: number
}

export interface ICreateProject {
  name: string
  description: string
  organizationId: number
}

export interface IChangeStatus {
  id: number
  params: {
    isProjectClosed: boolean
  }
}
