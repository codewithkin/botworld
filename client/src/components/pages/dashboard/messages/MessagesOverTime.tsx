import { MessagesTable } from "./MessagesTable";

export function MessagesOverTime() {
  return (
    <article className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold">Recent Messages</h2>
      <MessagesTable />
    </article>
  );
}