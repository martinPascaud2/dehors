import { LoginForm } from "./LoginForm";
import GuestLink from "./GuestLink";
import PwaDownloader from "./PwaDownloader";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-20">
      <LoginForm />
      {/* <GuestLink /> */}
      <PwaDownloader />
    </main>
  );
}
