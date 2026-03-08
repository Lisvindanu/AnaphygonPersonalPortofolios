import { SignJWT, jwtVerify } from 'jose'

export interface TokenPayload {
  userId: number
  username: string
}

const accessSecret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? 'anaphygon_access_secret_change_this_in_production_32chars',
)
const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? 'anaphygon_refresh_secret_change_this_in_production_32chars',
)

export async function generateTokens(payload: TokenPayload) {
  const accessToken = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .setIssuedAt()
    .sign(accessSecret)

  const refreshToken = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(refreshSecret)

  return { accessToken, refreshToken }
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}
