export const CommonConfig = {
    /**
     * application domain.
     */
    domain: 'apps.apogee-dev.com',
    appUrl: 'https://apps.apogee-dev.com/auth-app-lambda/',

    cookiePath: '/auth-app-lambda',
    /**
     * Lifetime of the token.
     */
    tokenExpireDays: 10,
    /**
     * cookine name that contains the authorization token.
     */
    authCookieName: "auth_token",
    /**
     * Number of byte for the csrf token.
     */
    csrfTokenLength: 32
}