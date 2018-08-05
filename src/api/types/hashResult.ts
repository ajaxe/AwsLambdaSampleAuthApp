export class HashResult {
    private static delim: string = ';;';
    hashedValue: string;
    salt: string;

    getForStore(): string {
        return `${this.hashedValue}${HashResult.delim}${this.salt}`;
    }

    static parse(storeValue: string): HashResult {
        let result = new HashResult();
        let parts = storeValue.split(HashResult.delim);
        result.salt = parts.pop();
        result.hashedValue = parts.pop();
        return result;
    }
}