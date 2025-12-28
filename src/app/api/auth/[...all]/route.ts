import { auth } from "@/bootstrap/boundaries/auth/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
