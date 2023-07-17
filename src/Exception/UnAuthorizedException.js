import { BaseHTTPException } from "./BaseHTTPException.js";

export class UnAuthorizedException extends BaseHTTPException {
    constructor(message) {
        super(message || "UnAuthorized", 401);
    }
}
