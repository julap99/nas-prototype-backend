export interface Component {
  id: number;
  namaPendaftaran: string;
  description?: string;
  kodProses: any[]; // JSON array of processes
  kodKomponen: string; // Unique component code
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
} 