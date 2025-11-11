export interface IReply {
    reply_id: number;
    body: string;
    user_id: number;
    user_name: string;
    photo: string | null;
    created_at: string;
    like_count: number;
    dislike_count: number;
}

export interface IAnswer {
    answer_id: number;
    body: string;
    user_id: number;
    user_name: string;
    photo: string | null;
    created_at: string;
    like_count: number;
    dislike_count: number;
    replies: IReply[];
}

export interface IQuestionImage {
    id: number;
    url: string;
    path: string;
}

export interface IQuestionDetails {
    question_id: number;
    user_id: number;
    full_name: string;
    photo: string | null;
    title: string;
    body: string;
    images: IQuestionImage[];
    tags: string[];
    answer_count: number;
    status: string;
    like_count: number;
    dislike_count: number;
    answers: IAnswer[];
}
