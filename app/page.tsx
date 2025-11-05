import { getUser } from "@/domains/users/repositories/user.repository";

const Page = async () => {
  
  const user = await getUser();

  return <>
  <h1>Welcome to Price App {user?.name}</h1>
  <a href="/sign-in">Login</a>
  <a href="/sign-up">Signup</a>
  <a href="/dashboard">Go to Dashboard</a>
  </>;
}

export default Page;