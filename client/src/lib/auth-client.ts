import {magicLinkClient} from "better-auth/client/plugins";
import {createAuthClient} from "better-auth/react";
export const authClient = createAuthClient({
  baseURL:
    import.meta.env.MODE === "production"
      ? "https://api.botworld.pro"
      : "http://localhost:8080",
  plugins: [magicLinkClient()],
});
