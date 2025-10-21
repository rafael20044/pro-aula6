export interface ITicket {
    id: number;
    user_id: number;
    question_id?: number;
    answers_id?: number;
    user_report_id?: number;
    body: string;
    created_at: string;
    status: string;
}

export interface ITicketCreate extends Pick<ITicket, 'answers_id' | 'body' | 'question_id' | 'user_id' | 'user_report_id'> {
}

export interface ITicketFind extends ITicketCreate, Pick<ITicket, 'status' | 'id' | 'created_at'> {
    name_user_id: string;
}