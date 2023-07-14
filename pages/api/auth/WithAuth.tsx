import { useRouter } from "next/router";
import { useSession, SessionProvider } from "next-auth/react";

interface WithAuthProps {
  session: any;
  status: string;
}

const withAuth = <T extends WithAuthProps>(WrappedComponent: React.ComponentType<T>) => {
  return (props: T) => {
    const router = useRouter();
    const { data: session, status } = useSession();

    if (status === "loading") {
      return <div>Loading...</div>;
    }

    if (!session && router.pathname !== "/login" && router.pathname !== "/signup") {
      // Redirect to login page if user is not authenticated
      router.push("/auth");
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
