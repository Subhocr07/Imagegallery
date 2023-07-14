import NextLink from "next/link";
import { Flex, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { pathname } = useRouter();
  const { data: session } = useSession();
const router=useRouter();
  const pagesWithoutNavbar = ["/auth"];
  const renderNavbar = !pagesWithoutNavbar.includes(pathname);

  const renderProfileButton = pathname !== "/profile";
  const renderAuthButton = !session && pathname !== "/auth";

  const handleProfileClick = () => {
    if (!session) {
      // Redirect to login page when not logged in
      router.push("/auth");
    }
  };

  return renderNavbar ? (
    <Flex justifyContent="space-around" p={20}>
      <Button>
        <NextLink href="/">Home</NextLink>
      </Button>
      {renderProfileButton && (
        <Button onClick={handleProfileClick}>
          <NextLink href="/profile">Image Gallery</NextLink>
        </Button>
      )}
      {renderAuthButton && (
        <Button>
          <NextLink href="/auth">Auth</NextLink>
        </Button>
      )}
    </Flex>
  ) : null;
};

export default Navbar;
