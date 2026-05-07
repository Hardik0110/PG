export interface Timestamps {
  created_at?: string;
  updated_at?: string;
}

export interface SoftDeletable {
  is_deleted?: boolean;
  is_active?: boolean;
}

export type UUID = string;
