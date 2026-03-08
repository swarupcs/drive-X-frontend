import { Link } from "wouter";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HardDrive } from "lucide-react";

interface BreadcrumbItemData {
  id: string | null;
  name: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemData[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
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
