import Review from "../models/Review";

export interface ReviewAttributes {
    id: number;
    title: string;
    bookTitle: string;
    publisher?: string;
    bookAuthor?: string;
    content: string;
    username: string;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}
  
export interface ReviewInstance extends Review {
    dataValues: ReviewAttributes;
}