export interface JwtPayload {
  username: string;
  role: string;
  iat?: Date;
}
