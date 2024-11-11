export interface IComment {
    id: number;
    content: string;
    username: string;
    createdAt: string;
    userId: number;
    parentId: number | null;
  }