import { Review } from "../models";

export interface ReviewAttributes {
    id: number;
    title: string;
    bookTitle: string;
    publisher: string;
    bookAuthor: string;
    content: string;
    userId: number;
    username: string;
    views: number;
  }
  
  export interface ReviewInstance extends Review {
    dataValues: ReviewAttributes;
  }