import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/bootstrap/boundaries/auth/better-auth";

export const { POST, GET } = toNextJsHandler(auth);
