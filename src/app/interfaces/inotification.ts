export interface INotificarion{
    id?:number,
    user_id:number,
    question_id:number,
    title:string,
    body:string
    is_read?:boolean,
    created_at?:string,
}