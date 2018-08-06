export type ValidationError = { property: string, message: string };

export class ValidationResult {
    errors: ValidationError[] = [];
    isValid(): boolean {
        return this.errors.length === 0;
    }
}