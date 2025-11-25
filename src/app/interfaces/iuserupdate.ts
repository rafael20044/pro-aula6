import { IUser } from "./iuser";

export interface IUserUpdate extends Pick<IUser, 'name'|'name2'|'last_name'|'last_name2'|'path'|'photo'>{

}