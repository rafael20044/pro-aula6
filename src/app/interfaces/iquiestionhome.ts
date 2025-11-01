export interface IQuestionHome {
    question_id: number;
    user_id: number;
    full_name: string;
    photo: string | null;
    title: string;
    body: string;
    images: { image_url: string, path:string }[];
    tags: string[];
    comment_count: number;
    status: string;
    like_count: number;
    dislike_count: number;
}
