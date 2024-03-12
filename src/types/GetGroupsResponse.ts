import { GroupI } from "./Group"

export interface GetGroupsResponseI {
  result: 1 | 0,
  data?: GroupI[]
}
