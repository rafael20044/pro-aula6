export interface IUser {
    id: string;
    uid: string;
    photo: string;
    name: string;
    name2?: string;
    last_name: string;
    last_name2?: string;
    email: string;
    password: string;
    rol: string;
    status: string;
    updated_at: string;
    created_at: string;
    path: string;
}

export interface IUserCreate extends Pick<
    IUser,
    'name' |
    'name2' |
    'last_name' |
    'last_name2' |
    'email' |
    'password'
> {
    uid?: string;
    path?: string;
    photo?: string;
}
export interface IUserWithQuestions {
    user_id: number;
    full_name: string;
    email: string;
    photo: string | null;
    rol: string;
    status: string;
    created_at: string;

    question_id: number | null;
    title: string | null;
    body: string | null;
    question_status: string | null;
    question_created_at: string | null;

    like_count: number;
    dislike_count: number;
    comment_count: number;
}
