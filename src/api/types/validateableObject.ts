import { ValidationResult } from "./validationResult";

export interface ValidatableObject {
    validate(): ValidationResult;
}