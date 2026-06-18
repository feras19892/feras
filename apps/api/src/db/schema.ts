export interface UserTable {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface OrderTable {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'completed';
}
