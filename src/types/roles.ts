export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  USER = 'ROLE_USER',
}

export type Role = keyof typeof UserRole; 