import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useSidebar } from "@/components/ui/sidebar";

export const Route = createFileRoute("/network")({
  component: RouteComponent,
});

function RouteComponent() {
  const { setOpen } = useSidebar();
  setOpen(false);
  return (
    <>
      <div className="w-full flex justify-center pt-4">
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="gap-4">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-md px-6 py-4">
                Home Network
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink></NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-md px-6 py-4">
                Tailscale
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[100px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/">Network</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/network/devices">Devices</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/network/settings">Settings</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-md px-6 py-4">
                Router
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Outlet />
    </>
  );
}
