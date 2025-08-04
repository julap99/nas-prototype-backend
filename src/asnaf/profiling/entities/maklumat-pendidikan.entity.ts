export interface GetMaklumatPendidikan {
  asnafUuid: string;
  masihBersekolah: boolean;
  pendidikanTertinggi: string;
  lainLainPendidikanTertinggi: string;
  tahapPendidikanDicapai: string[];
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostMaklumatPendidikan {
  asnafUuid: string;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}
