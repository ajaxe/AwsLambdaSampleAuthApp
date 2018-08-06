
export class CsrfTokenPair {
    cookieToken: string;
    formToken: string;

    static readonly CsrfTokenCookieName: string = 'CRFS-TOKEN';
    static readonly CsrfTokenHeader: string = 'x-csrf-token';
}