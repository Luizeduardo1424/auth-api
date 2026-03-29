export interface UserPublic {
  id: string;
  email: string;
  username: string;
  is_activate: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<UserPublic | null>;
  updateById(
    id: string,
    data: Partial<Pick<UserPublic, 'email' | 'username'>>,
  ): Promise<UserPublic>;
  deleteById(id: string): Promise<void>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  findPasswordById(id: string): Promise<string | null>;
}
