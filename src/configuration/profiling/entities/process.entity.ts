export interface Process {
  id: number;
  kodProses: string;
  namaProses: string;
  idPage: string;
  description?: string;
  kodKategori?: string;
  namaKategori?: string;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
} 