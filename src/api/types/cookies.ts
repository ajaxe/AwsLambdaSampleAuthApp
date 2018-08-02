
export type CookieHeader = { 'Set-Cookie': string };

export class Cookie {
    readonly secure: boolean = true;
    readonly httpOnly: boolean = true;

    private cookieName: string;
    private cookiValue: string;
    private expire: string;
    private domain: string;

    getHeader(): CookieHeader {
        let headerValueParts = [`${this.cookieName}=${this.cookiValue};`, 'Secure;', 'HttpOnly;'];
        if (this.expire) {
            headerValueParts.push(`Expires=${this.expire};`);
        }
        if (this.domain) {
            headerValueParts.push(`Domain=${this.domain};`);
        }
        return {
            'Set-Cookie': headerValueParts.join(' ')
        };
    }

    setCookie(ckName: string, ckValue: string, expireInDays: number, ckDomain: string) {
        this.cookieName = ckName;
        this.cookiValue = ckValue;
        let dt = new Date();
        dt.setDate(dt.getDate() + expireInDays);
        this.expire = dt.toUTCString();
        this.domain = ckDomain;
    }
}