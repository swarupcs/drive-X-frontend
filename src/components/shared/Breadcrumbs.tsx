import { useState } from "react";
import { Link } from "wouter";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HardDrive, MoreHorizontal } from "lucide-react";

interface BreadcrumbItemData {
  id: string | null;
  name: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemData[];
}

// Maximum crumbs to show without collapsing
const MAX_VISIBLE = 3;

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);

  // For short paths render everything as-is
  if (items.length <= MAX_VISIBLE + 1 || expanded) {
    return <BreadcrumbFull items={items} />;
  }

  // Collapsed: show first + "..." + last two
  const first = items[0];
  const hidden = items.slice(1, items.length - 2);
  const tail = items.slice(items.length - 2);

  return (
    <Breadcrumb data-testid="breadcrumb-nav">
      <BreadcrumbList>
        {/* Root */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={first.id ? `/drive/folder/${first.id}` : "/drive"} data-testid={`breadcrumb-link-${first.id ?? "root"}`}>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <HardDrive className="h-3.5 w-3.5" />
                {first.name}
              </span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* Collapsed middle items */}
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-6 items-center gap-1 rounded px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={`${hidden.length} hidden folders`}
                data-testid="breadcrumb-collapse"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {hidden.map((item) => (
                <DropdownMenuItem key={item.id ?? "root"} asChild>
                  <Link href={item.id ? `/drive/folder/${item.id}` : "/drive"}>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => setExpanded(true)} className="text-xs text-muted-foreground">
                Show all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>

        {/* Tail items */}
        {tail.map((item, i) => {
          const isLast = i === tail.length - 1;
          return (
            <span key={item.id ?? "root"} className="flex items-center gap-1.5">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-sm font-medium" data-testid={`breadcrumb-current-${item.id ?? "root"}`}>
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.id ? `/drive/folder/${item.id}` : "/drive"} data-testid={`breadcrumb-link-${item.id ?? "root"}`}>
                      <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        {item.name}
                      </span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function BreadcrumbFull({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb data-testid="breadcrumb-nav">
      <BreadcrumbList>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={item.id ?? "root"} className="flex items-center gap-1.5">
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5 text-sm font-medium" data-testid={`breadcrumb-current-${item.id ?? "root"}`}>
                    {i === 0 && <HardDrive className="h-3.5 w-3.5" />}
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.id ? `/drive/folder/${item.id}` : "/drive"} data-testid={`breadcrumb-link-${item.id ?? "root"}`}>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        {i === 0 && <HardDrive className="h-3.5 w-3.5" />}
                        {item.name}
                      </span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
