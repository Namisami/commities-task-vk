import { UserI } from "./User";

export interface GroupI {
  "id": number,
  "name": string,
  "closed": boolean,
  "avatar_color"?: string,
  "members_count": number,
  "friends"?: UserI[]
}
