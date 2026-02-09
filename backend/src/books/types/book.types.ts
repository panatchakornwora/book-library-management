export type BookEntity = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publicationYear: number | null;
  coverUrl: string | null;
  totalQty: number;
  availableQty: number;
  createdAt: Date;
};

export type BookCreateData = {
  title: string;
  author: string;
  isbn: string;
  publicationYear?: number;
  coverUrl?: string;
  totalQty: number;
  availableQty: number;
};

export type BookUpdateData = Partial<Omit<BookCreateData, 'availableQty'>> & {
  availableQty?: number;
  totalQty?: number;
};
