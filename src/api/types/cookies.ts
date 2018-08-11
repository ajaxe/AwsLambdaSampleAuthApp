import { CommonConfig } from "../common/config";

export type CookieHeader = { 'Set-Cookie': string };

export class Cookie {
    private secure: boolean = true;
    private httpOnly: boolean = true;

    private cookieName: string;
    private cookiValue: string;
    private expire: string;
    private domain: string;

    getHeader(): CookieHeader {
        let headerValueParts = [`${this.cookieName}=${this.cookiValue};`, 'Secure;'];
        if(this.httpOnly) {
            headerValueParts.push('HttpOnly;')
        }
        if (this.expire) {
            headerValueParts.push(`Expires=${this.expire};`);
        }
        if (this.domain) {
            headerValueParts.push(`Domain=${this.domain};`);
        }
        headerValueParts.push(`Path=${CommonConfig.cookiePath};`);
        return {
            'Set-Cookie': headerValueParts.join(' ')
        };
    }

    setCookie(ckName: string, ckValue: string, expireInDays: number, ckDomain: string, httpOnly?: boolean) {
        this.cookieName = ckName;
        this.cookiValue = ckValue;
        this.httpOnly = httpOnly;
        let dt = new Date();
        dt.setDate(dt.getDate() + expireInDays);
        this.expire = dt.toUTCString();
        this.domain = ckDomain;
    }
}