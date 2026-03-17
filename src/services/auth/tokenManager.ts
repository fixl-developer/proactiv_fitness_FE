import { jwtDecode } from 'jwt-decode'

export interface DecodedToken {
    sub: string
    email: string
    role: string
    iat: number
    exp: number
}

class TokenManager {
    private readonly ACCESS_TOKEN_KEY = 'token'
    private readonly REFRESH_TOKEN_KEY = 'refreshToken'
    private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000 // 5 minutes

    setAccessToken(token: string): void {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token)
    }

    setRefreshToken(token: string): void {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY)
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    }

    clearTokens(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY)
        localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    }

    decodeToken(token: string): DecodedToken | null {
        try {
            return jwtDecode<DecodedToken>(token)
        } catch (error) {
            console.error('Error decoding token:', error)
            return null
        }
    }

    isTokenValid(token: string): boolean {
        try {
            const decoded = this.decodeToken(token)
            if (!decoded) return false

            const now = Date.now()
            const expiryTime = decoded.exp * 1000

            return expiryTime > now
        } catch (error) {
            return false
        }
    }

    isTokenExpiringSoon(token: string): boolean {
        try {
            const decoded = this.decodeToken(token)
            if (!decoded) return true

            const now = Date.now()
            const expiryTime = decoded.exp * 1000

            return expiryTime - now < this.TOKEN_EXPIRY_BUFFER
        } catch (error) {
            return true
        }
    }

    getTokenExpiryTime(token: string): number | null {
        try {
            const decoded = this.decodeToken(token)
            if (!decoded) return null

            return decoded.exp * 1000
        } catch (error) {
            return null
        }
    }

    getTimeUntilExpiry(token: string): number {
        const expiryTime = this.getTokenExpiryTime(token)
        if (!expiryTime) return 0

        const now = Date.now()
        return Math.max(0, expiryTime - now)
    }

    validateTokenStructure(token: string): boolean {
        // JWT format: header.payload.signature
        const parts = token.split('.')
        if (parts.length !== 3) return false

        try {
            // Try to decode each part
            for (const part of parts) {
                Buffer.from(part, 'base64').toString('utf-8')
            }
            return true
        } catch (error) {
            return false
        }
    }

    getTokenClaims(token: string): Record<string, any> | null {
        try {
            const decoded = this.decodeToken(token)
            return decoded ? { ...decoded } : null
        } catch (error) {
            return null
        }
    }

    hasTokenExpired(token: string): boolean {
        return !this.isTokenValid(token)
    }

    setTokens(accessToken: string, refreshToken: string): void {
        this.setAccessToken(accessToken)
        this.setRefreshToken(refreshToken)
    }

    getTokens(): { accessToken: string | null; refreshToken: string | null } {
        return {
            accessToken: this.getAccessToken(),
            refreshToken: this.getRefreshToken()
        }
    }

    isAuthenticated(): boolean {
        const token = this.getAccessToken()
        return token ? this.isTokenValid(token) : false
    }
}

export const tokenManager = new TokenManager()
export default TokenManager
