import getUser from "@/utils/getUser";

import Tools from "./Tools";

export default async function ToolsPage() {
  const user = await getUser();

  return (
    <div className="absolute h-full w-full z-0">
      <Tools user={user} />
    </div>
  );
}
