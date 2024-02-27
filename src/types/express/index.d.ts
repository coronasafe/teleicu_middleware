import { User } from "@/types/user";

export {};

/**
 * Extends the Express namespace with a custom Request interface.
 */
declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
