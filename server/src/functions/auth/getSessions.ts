import {fromNodeHeaders} from "better-auth/node";
import {auth} from "../../lib/auth";

import {Request} from "express";

export default async function getSession(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
}
