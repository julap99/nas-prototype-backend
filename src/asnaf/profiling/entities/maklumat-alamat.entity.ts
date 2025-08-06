export interface PostMaklumatAlamat {
  asnafUuid: string;
  alamat1: string;
  alamat2: string;
  status?: number;
  createdAt?: Date;
  updatedAt?: Date;
  documents?: Array<{
    id: number;
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    documentType: string;
  }>;
}

export interface GetMaklumatAlamat {
  asnafUuid: string;
  alamat1: string;
  alamat2: string;
  documents?: Array<{
    id: number;
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    documentType: string;
  }>;
}
