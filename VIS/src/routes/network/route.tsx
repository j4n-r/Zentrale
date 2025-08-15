import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
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
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Home Network</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink></NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Tailscale</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/">Network</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/">Devices</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/">Settings</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Router</NavigationMenuTrigger>
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
