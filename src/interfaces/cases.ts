export interface IShortCase {
  caseStatus: number
  caseCount: number
}

export interface ICase {
  created: string
  createdBy: string
  id: number
  name: string
  projectId: number
  status: number
  type: number
  validationStatus: number
  validations: object[]
}

export interface ICaseSetup {
  casetype: string
  id: number
  interfaces: object[]
  name: string
  regions?: object[]
  step: string
  settings?: object
}

export interface ICaseFile {
  caseComponentId: number
  fileName: string
  id: number
  link: string
}
