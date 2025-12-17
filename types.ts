export enum UploadStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum ServiceType {
  ABYSS = 'abyss.to',
  FILEMOON = 'filemoon.sx'
}

export interface UploadItem {
  id: string;
  url: string;
  service: ServiceType;
  status: UploadStatus;
  resultId?: string; // The file code returned by the service
  error?: string;
  addedAt: number;
}

export interface ServiceKeys {
  abyss: string;
  filemoon: string;
}

export interface ApiResponse {
  status: number;
  msg: string;
  result?: {
    filecode?: string;
    url?: string;
  };
}