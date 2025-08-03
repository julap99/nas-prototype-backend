export interface Component {
  id: number;
  namaPendaftaran: string;
  description?: string;
  kodProses: any[]; // JSON array of processes
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
} 