export interface Process {
  id: number;
  kodProses: string;
  namaProses: string;
  idPage: string;
  description?: string;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
} 