import { Card, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex h-full flex-col gap-0 overflow-hidden rounded-lg p-0 shadow-sm">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-sm" />
              <Skeleton className="size-6 rounded-full" />
            </div>
            <Skeleton className="mt-1 h-5 w-full max-w-[90%] rounded-sm" />
            <Skeleton className="h-4 w-3/4 rounded-sm" />
            <Skeleton className="h-4 w-2/3 rounded-sm" />
            <Skeleton className="mt-auto h-5 w-24 rounded-sm" />
            <div className="mt-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Skeleton className="h-11 w-full rounded-sm" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32 rounded-sm" />
        <Skeleton className="h-10 w-full max-w-[90%] rounded-sm" />
        <Skeleton className="h-8 w-40 rounded-sm" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-2/3 rounded-sm" />
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <Skeleton className="h-12 w-45 max-w-full rounded-sm" />
          <Skeleton className="h-12 w-45 max-w-full rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-lg p-4">
          <div className="flex gap-5">
            <Skeleton className="size-30 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 pr-10">
              <div className="min-w-0">
                <Skeleton className="h-6 w-3/4 rounded-sm" />
                <Skeleton className="mt-3 h-4 w-full max-w-[70%] rounded-sm" />
                <Skeleton className="mt-3 h-5 w-28 rounded-sm" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-sm" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-24 rounded-sm" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48 rounded-sm" />
          <Skeleton className="mt-3 h-4 w-40 rounded-sm" />
        </div>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}
      </div>
      <Skeleton className="mt-8 h-11 w-40 rounded-sm" />
    </Card>
  );
}

// Mirrors the DashboardPageHeader (PageHeader inside a gradient panel).
function HeaderPanelSkeleton({ titleWidth = "w-80", descWidth = "w-[28rem]", withAction = false }) {
  return (
    <div className="panel-gradient rounded-lg border border-slate-200/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-slate-800/80">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="w-full max-w-2xl">
          <Skeleton className="h-4 w-28 rounded-sm" />
          <Skeleton className={cn("mt-3 h-9 max-w-full rounded-sm", titleWidth)} />
          <Skeleton className={cn("mt-4 h-5 max-w-md rounded-sm", descWidth)} />
        </div>
        {withAction ? (
          <div className="shrink-0">
            <Skeleton className="h-11 w-36 rounded-sm" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Mirrors the AdminStatCard used on both admin and customer dashboards.
function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full">
          <Skeleton className="h-3.5 w-24 rounded-sm" />
          <Skeleton className="mt-3 h-9 w-28 rounded-sm" />
        </div>
        <Skeleton className="size-12 shrink-0 rounded-sm" />
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Skeleton className="h-3.5 w-32 rounded-sm" />
      </div>
    </Card>
  );
}

// Mirrors a table row's cell: last column is the actions icon, others are content.
const TABLE_BODY_PATTERN = ["h-4 w-24 rounded-sm", "h-4 w-28 rounded-sm", "size-6 rounded-full", "h-4 w-20 rounded-sm", "h-4 w-32 rounded-sm", "h-5 w-16 rounded-sm"];

function renderToolbarSkeleton(variant) {
  const search = <Skeleton className="h-10 min-w-[16rem] flex-1 rounded-sm sm:max-w-md lg:max-w-xl" />;
  const button = <Skeleton className="h-10 w-32 shrink-0 rounded-md" />;
  const select = <Skeleton className="h-10 w-48 shrink-0 rounded-md" />;

  switch (variant) {
    case "search-action":
      return <><div className="flex min-w-0 flex-1 flex-nowrap items-center gap-3 overflow-x-auto">{search}</div>{button}</>;
    case "search-double-action":
      return <><div className="flex min-w-0 flex-1 flex-nowrap items-center gap-3 overflow-x-auto">{search}</div><div className="flex items-center gap-3">{button}{button}</div></>;
    case "search-select":
      return <><div className="flex min-w-0 flex-1 flex-nowrap items-center gap-3 overflow-x-auto">{search}</div>{select}</>;
    case "search-only":
    default:
      return <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-3 overflow-x-auto">{search}</div>;
  }
}

function PaginationSkeleton() {
  return (
    <div className="mt-6 flex justify-center">
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

function TableFrameSkeleton({ rows = 5, columns = 6, titleWidth, descWidth, toolbarVariant = "search-only", hasActions = true, bodyPattern = TABLE_BODY_PATTERN, className, showFooter = true }) {
  return (
    <Card className={cn("overflow-hidden p-0 shadow-sm", className)}>
      {titleWidth || descWidth ? (
        <div className="mb-4 px-5 pt-5">
          {titleWidth ? <Skeleton className={cn("h-7 max-w-full rounded-sm", titleWidth)} /> : null}
          {descWidth ? <Skeleton className={cn("mt-2 h-4 max-w-full rounded-sm", descWidth)} /> : null}
        </div>
      ) : null}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-body">
          <thead className="border-b border-slate-200/80 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-900/95">
            <tr>
              <th colSpan={columns} className="border-b border-slate-200/80 p-4 dark:border-slate-800">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  {renderToolbarSkeleton(toolbarVariant)}
                </div>
              </th>
            </tr>
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="whitespace-nowrap px-6 py-4">
                  <Skeleton className="h-3 w-24 rounded-sm" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="bg-slate-50/40 dark:bg-slate-950/25">
                {Array.from({ length: columns }).map((_, columnIndex) => {
                  const isAction = hasActions && columnIndex === columns - 1;
                  const cellClass = isAction ? "size-9 rounded-md" : bodyPattern[columnIndex % bodyPattern.length];
                  return (
                    <td key={columnIndex} className={cn("whitespace-nowrap px-6 py-4 align-middle", isAction && "text-center")}>
                      <Skeleton className={cn("inline-block", cellClass)} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {showFooter ? (
            <tfoot>
              <tr>
                <th colSpan={columns} className="border-t border-slate-200/80 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Skeleton className="h-4 w-40 rounded-sm" />
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-9 w-28 rounded-md" />
                      <Skeleton className="size-9 rounded-md" />
                      <Skeleton className="size-9 rounded-md" />
                      <Skeleton className="size-9 rounded-md" />
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                  </div>
                </th>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </Card>
  );
}

export function AdminProductsSkeleton() {
  return (
    <div>
      <TableFrameSkeleton rows={5} columns={6} hasActions titleWidth="w-40" descWidth="w-[32rem]" toolbarVariant="search-double-action" bodyPattern={["h-12 w-full max-w-64 rounded-md", "h-4 w-24 rounded-sm", "h-4 w-20 rounded-sm", "h-4 w-16 rounded-sm", "h-5 w-16 rounded-sm", "size-9 rounded-md"]} showFooter={false} />
      <PaginationSkeleton />
    </div>
  );
}

export function AdminCategoriesSkeleton() {
  return (
    <div>
      <TableFrameSkeleton rows={5} columns={2} hasActions={false} titleWidth="w-44" descWidth="w-[30rem]" toolbarVariant="search-action" bodyPattern={["h-5 w-44 rounded-sm", "h-4 w-20 rounded-sm"]} showFooter={false} />
      <PaginationSkeleton />
    </div>
  );
}

export function AdminCustomersSkeleton() {
  return (
    <div>
      <TableFrameSkeleton rows={5} columns={6} hasActions={false} titleWidth="w-44" descWidth="w-[30rem]" toolbarVariant="search-action" bodyPattern={["h-5 w-48 rounded-sm", "h-4 w-24 rounded-sm", "h-4 w-16 rounded-sm", "h-5 w-20 rounded-sm", "h-6 w-20 rounded-full", "h-4 w-20 rounded-sm"]} showFooter={false} />
      <PaginationSkeleton />
    </div>
  );
}

export function AdminOrdersSkeleton() {
  return (
    <div>
      <TableFrameSkeleton rows={6} columns={9} hasActions titleWidth="w-40" descWidth="w-[28rem]" toolbarVariant="search-select" bodyPattern={["h-4 w-24 rounded-sm", "h-4 w-28 rounded-sm", "h-4 w-20 rounded-sm", "h-5 w-20 rounded-full", "h-5 w-20 rounded-full", "h-4 w-32 rounded-sm", "h-4 w-24 rounded-sm", "h-5 w-16 rounded-sm", "size-9 rounded-md"]} showFooter={false} />
      <PaginationSkeleton />
    </div>
  );
}

export function AdminProductEditSkeleton() {
  return (
    <div>
      <HeaderPanelSkeleton titleWidth="w-72" descWidth="w-[34rem]" withAction />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-5">
            <Skeleton className="h-6 w-44 rounded-sm" />
            <Skeleton className="mt-1 h-4 w-72 rounded-sm" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}
            </div>
            <Skeleton className="mt-4 h-24 w-full rounded-sm" />
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-44 rounded-sm" />
            <Skeleton className="mt-1 h-4 w-80 rounded-sm" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Skeleton className="h-11 w-full rounded-sm" />
              <Skeleton className="h-11 w-full rounded-sm" />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <Skeleton className="h-6 w-40 rounded-sm" />
            <Skeleton className="mt-1 h-4 w-72 rounded-sm" />
            <Skeleton className="mt-5 aspect-square w-full rounded-lg" />
            <Skeleton className="mt-4 h-11 w-full rounded-sm" />
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-32 rounded-sm" />
            <Skeleton className="mt-2 h-4 w-72 rounded-sm" />
            <Skeleton className="mt-5 h-11 w-full rounded-sm" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export function WishlistSkeleton() {
  return (
    <div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden rounded-lg p-0 shadow-sm">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-3/4 rounded-sm" />
              <Skeleton className="h-4 w-1/2 rounded-sm" />
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="mt-2 h-11 w-full rounded-sm" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminOrderDetailSkeleton() {
  return (
    <div>
      <HeaderPanelSkeleton titleWidth="w-64" descWidth="w-[32rem]" withAction />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Skeleton className="h-6 w-40 rounded-sm" />
                <Skeleton className="mt-2 h-4 w-64 rounded-sm" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-6 space-y-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-md border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <Skeleton className="size-24 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-56 rounded-sm" />
                    <Skeleton className="h-4 w-24 rounded-sm" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-sm" />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-slate-200 pt-5 dark:border-slate-800">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full max-w-md rounded-sm" />)}
            </div>
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-52 rounded-sm" />
            <Skeleton className="mt-1 h-4 w-80 rounded-sm" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}
            </div>
            <Skeleton className="mt-5 h-4 w-40 rounded-sm" />
            <Skeleton className="mt-2 h-6 w-28 rounded-full" />
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-40 rounded-sm" />
            <Skeleton className="mt-3 h-24 w-full rounded-sm" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <Skeleton className="h-6 w-44 rounded-sm" />
            <Skeleton className="mt-2 h-4 w-60 rounded-sm" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}
            </div>
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-36 rounded-sm" />
            <Skeleton className="mt-2 h-4 w-72 rounded-sm" />
            <Skeleton className="mt-5 h-11 w-full rounded-sm" />
            <Skeleton className="mt-3 h-11 w-full rounded-sm" />
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-32 rounded-sm" />
            <Skeleton className="mt-2 h-4 w-72 rounded-sm" />
            <Skeleton className="mt-5 h-11 w-full rounded-sm" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AdminCustomerDetailSkeleton() {
  return (
    <div>
      <HeaderPanelSkeleton titleWidth="w-60" descWidth="w-[34rem]" withAction />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-5 h-6 w-32 rounded-sm" />
            <Skeleton className="mt-4 h-4 w-full rounded-sm" />
            <Skeleton className="mt-3 h-4 w-4/5 rounded-sm" />
            <Skeleton className="mt-4 h-4 w-32 rounded-sm" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <Skeleton className="h-6 w-36 rounded-sm" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-md" />)}
            </div>
          </Card>
          <TableFrameSkeleton rows={4} columns={7} hasActions titleWidth="w-40" descWidth="w-72" toolbarVariant="search-only" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      <Card className="mt-6 overflow-hidden rounded-lg p-6 shadow-sm">
        <Skeleton className="h-7 w-56 rounded-sm" />
        <Skeleton className="mt-2 h-4 w-72 rounded-sm" />
        <div className="mt-6 h-64 rounded-lg bg-gradient-to-b from-blue-50 to-slate-50 p-3 ring-1 ring-slate-200 dark:from-blue-500/10 dark:to-slate-950 dark:ring-slate-800">
          <div className="flex h-full items-end gap-3">
            {["45%", "60%", "38%", "72%", "52%", "82%"].map((height, index) => (
              <Skeleton key={index} className="w-full flex-1 rounded-t-lg" style={{ height }} />
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <TableFrameSkeleton rows={5} columns={5} titleWidth="w-40" descWidth="w-72" />
        <div className="mt-4 flex justify-end">
          <Skeleton className="size-9 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div>
      <div className="pt-4 lg:pt-6">
        <TableFrameSkeleton rows={4} columns={7} />
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div>
      <HeaderPanelSkeleton titleWidth="w-64" descWidth="w-[28rem]" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-56">
              <Skeleton className="h-6 w-32 rounded-sm" />
              <Skeleton className="mt-2 h-4 w-40 rounded-sm" />
            </div>
            <Skeleton className="size-6 rounded-full" />
          </div>

          <div className="mt-6 space-y-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="size-24 shrink-0 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-56 max-w-full rounded-sm" />
                  <Skeleton className="mt-2 h-4 w-24 rounded-sm" />
                </div>
                <Skeleton className="h-5 w-20 rounded-sm" />
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-16 rounded-sm" />
              <Skeleton className="h-6 w-28 rounded-sm" />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <Skeleton className="h-5 w-40 rounded-sm" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-36 rounded-sm" />
              <Skeleton className="h-4 w-48 rounded-sm" />
              <Skeleton className="h-4 w-44 rounded-sm" />
            </div>
          </Card>
          <Card>
            <Skeleton className="h-5 w-28 rounded-sm" />
            <div className="mt-4 flex items-center gap-3">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="h-4 w-32 rounded-sm" />
            </div>
          </Card>
          <Card>
            <Skeleton className="h-5 w-32 rounded-sm" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-24 rounded-sm" />
                  <Skeleton className="h-4 w-32 rounded-sm" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <Skeleton className="h-6 w-44 rounded-sm" />
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-sm" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function AuthGateSkeleton({ title = "Loading access...", description = "Checking your session and redirecting if needed." }) {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-4 dark:bg-slate-950">
      <Card className="w-full max-w-md p-6 shadow-sm">
        <Skeleton className="mx-auto h-10 w-10 rounded-full" />
        <Skeleton className="mx-auto mt-5 h-7 w-48 rounded-sm" />
        <Skeleton className="mx-auto mt-3 h-4 w-72 max-w-full rounded-sm" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-11 w-full rounded-sm" />
          <Skeleton className="h-11 w-full rounded-sm" />
          <Skeleton className="h-11 w-2/3 rounded-sm" />
        </div>
        <p className="mt-5 text-center text-body font-regular text-slate-500 dark:text-slate-400">{title}<br />{description}</p>
      </Card>
    </div>
  );
}

export function AddressSkeleton() {
  return (
    <div>
      <Card className="mt-4 overflow-hidden p-0 shadow-sm">
          <div className="border-b border-slate-200/80 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Skeleton className="h-6 w-44 rounded-sm" />
                <Skeleton className="mt-2 h-4 w-[28rem] max-w-full rounded-sm" />
              </div>
              <Skeleton className="h-11 w-36 rounded-sm" />
            </div>
          </div>
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left text-body">
              <thead className="border-b border-slate-200/80 bg-slate-50/95 text-body font-semibold uppercase tracking-[0.16em] text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-400">
                <tr>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className="whitespace-nowrap px-6 py-4 font-semibold">
                      <Skeleton className="h-3 w-20 rounded-sm" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="bg-slate-50/40 dark:bg-slate-950/25">
                    <td className="whitespace-nowrap px-6 py-4 align-middle"><Skeleton className="h-11 w-full max-w-72 rounded-sm" /></td>
                    <td className="whitespace-nowrap px-6 py-4 align-middle"><Skeleton className="h-4 w-40 rounded-sm" /><Skeleton className="mt-2 h-3 w-24 rounded-sm" /></td>
                    <td className="whitespace-nowrap px-6 py-4 align-middle"><Skeleton className="h-4 w-full max-w-56 rounded-sm" /><Skeleton className="mt-2 h-3 w-36 rounded-sm" /></td>
                    <td className="whitespace-nowrap px-6 py-4 align-middle"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="whitespace-nowrap px-6 py-4 align-middle text-center"><Skeleton className="mx-auto h-9 w-9 rounded-md" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
}

export function AdminPageSkeleton({ variant = "table" }) {
  if (variant === "dashboard") {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="w-full max-w-2xl">
          <Skeleton className="h-4 w-28 rounded-sm" />
          <Skeleton className="mt-3 h-10 w-64 max-w-full rounded-sm" />
          <Skeleton className="mt-4 h-4 w-full max-w-lg rounded-sm" />
        </div>
        <Skeleton className="h-11 w-36 rounded-sm" />
      </div>
      <div className="mt-8">
        {variant === "form" ? <AdminFormSkeleton /> : <AdminTableSkeleton />}
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div>
      <AdminStatsSkeleton count={4} />

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
        <Card className="h-full overflow-hidden p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-44 rounded-sm" />
              <Skeleton className="mt-1 h-4 w-60 rounded-sm" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <div className="mt-6 h-60 rounded-md bg-gradient-to-b from-blue-50 to-slate-50 p-3 ring-1 ring-slate-200 dark:from-blue-500/10 dark:to-slate-950 dark:ring-slate-800">
            <div className="flex h-full items-end gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="w-full flex-1 rounded-t-lg" style={{ height: `${42 + index * 7}%` }} />
              ))}
            </div>
          </div>
        </Card>

        <Card className="h-full p-5 shadow-sm">
          <Skeleton className="h-6 w-40 rounded-sm" />
          <Skeleton className="mt-1 h-4 w-56 rounded-sm" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3 rounded-md border border-amber-200/70 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-md" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-36 rounded-sm" />
                    <Skeleton className="h-3 w-24 rounded-sm" />
                  </div>
                </div>
                <Skeleton className="h-6 w-14 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-36 rounded-sm" />
            <Skeleton className="mt-1 h-4 w-64 rounded-sm" />
          </div>
          <Skeleton className="size-9 shrink-0 rounded-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <Skeleton className="size-14 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-32 rounded-sm" />
                <Skeleton className="h-4 w-24 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6">
        <TableFrameSkeleton rows={5} columns={7} titleWidth="w-40" descWidth="w-80" />
      </div>
    </div>
  );
}

export function AdminStatsSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 6, className }) {
  return <TableFrameSkeleton rows={rows} className={className} />;
}

export function AdminFormSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-6 w-44 rounded-sm" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Skeleton className="h-11 w-full rounded-sm" />
              <Skeleton className="h-11 w-full rounded-sm" />
              <Skeleton className="h-11 w-full rounded-sm" />
              <Skeleton className="h-11 w-full rounded-sm" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <Skeleton className="h-6 w-36 rounded-sm" />
        <Skeleton className="mt-6 aspect-square w-full rounded-lg" />
        <Skeleton className="mt-5 h-11 w-full rounded-sm" />
      </Card>
    </div>
  );
}
