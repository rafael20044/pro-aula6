export interface IUser{
    id:string;
    uid:string;
    photo:string;
    name:string;
    name2?:string;
    last_name:string;
    last_name2?:string;
    email:string;
    password:string;
    rol:string;
    status:string;
    updated_at:string;
    created_at:string;
    path:string;
}

export interface IUserCreate extends Pick<
    IUser, 
    'name' | 
    'name2' | 
    'last_name' | 
    'last_name2' | 
    'email' | 
    'password'
    >{
        uid?:string;
        path?:string;
        photo?:string;
}