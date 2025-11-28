export interface ITicket {
    id: number;
    user_id: number;
    question_id?: number;
    answers_id?: number;
    user_report_id?: number;
    title: string;
    body?: string;
    created_at: string;
    status: string;
}

export interface ITicketCreate extends Pick<ITicket, 'answers_id' | 'body' | 'question_id' | 'user_id' | 'user_report_id' | 'title'> {
}

export interface ITicketFind extends ITicketCreate, Pick<ITicket, 'status' | 'id' | 'created_at'> {
    name_user_id: string;
    questions?: { title: string; body: string };
    answers?: { body: string };
    reported_user?: { name: string; last_name: string; email: string };
    users?: { name: string; last_name: string };
}