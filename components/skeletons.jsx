import { Card, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { SecureAccessLoader } from "@/components/auth-loading";

export function ProductGridSkeleton({ count = 8, columns = "product-grid" }) {
  return (
    <div className={cn("grid", columns)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="zl-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[14px] border-[rgba(0,0,0,0.06)] p-0 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.06)]">
          <div className="zl-card-img relative h-[180px] shrink-0 overflow-hidden rounded-t-xl border-b-2 border-[rgba(0,0,0,0.08)] bg-transparent p-4 min-[768px]:h-[180px]">
            <Skeleton className="size-full rounded-[10px] min-[768px]:rounded-none" />
            <Skeleton className="absolute left-3 top-3 z-10 h-5 w-20 rounded-md" />
          </div>
          <div className="zl-card-body flex min-w-0 flex-1 flex-col p-4 pt-4">
            <div className="min-w-0 min-h-10">
              <Skeleton className="h-5 w-full max-w-[13rem] rounded-md" />
              <Skeleton className="mt-1 h-5 w-4/5 rounded-md" />
            </div>
            <Skeleton className="mt-2 h-3.5 w-28 rounded-md" />
            <div className="mt-3 grid min-h-5 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="skeleton block h-5 w-16 shrink-0 rounded-md" />
              <div className="flex shrink-0 items-center justify-self-end gap-1.5">
                <div className="skeleton block size-2 rounded-full" />
                <div className="skeleton block h-3.5 w-24 rounded-md" />
              </div>
            </div>
            <div className="zl-card-actions mt-auto pt-5">
              <Skeleton className="h-[30px] w-20 rounded-[7px] min-[768px]:h-10 min-[768px]:w-full min-[768px]:rounded-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
      <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-wrap items-center gap-2"><Skeleton className="h-4 w-12 rounded-sm" /><Skeleton className="h-4 w-2 rounded-sm" /><Skeleton className="h-4 w-20 rounded-sm" /><Skeleton className="h-4 w-2 rounded-sm" /><Skeleton className="h-4 w-full max-w-[22rem] rounded-sm" /></div>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] lg:gap-14">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap gap-2"><Skeleton className="h-7 w-32 rounded-full" /><Skeleton className="h-5 w-16 rounded-md" /><Skeleton className="h-5 w-24 rounded-md" /></div>
          <div className="space-y-2"><Skeleton className="h-7 w-full max-w-2xl rounded-md" /><Skeleton className="h-7 w-4/5 max-w-xl rounded-md" /></div>
          <div className="flex items-end gap-4"><Skeleton className="h-10 w-32 rounded-md" /><Skeleton className="h-4 w-48 max-w-full rounded-md" /></div>
          <div className="space-y-2 pt-2"><Skeleton className="h-4 w-full max-w-xl rounded-md" /><Skeleton className="h-4 w-11/12 max-w-xl rounded-md" /><Skeleton className="h-4 w-2/3 max-w-xl rounded-md" /></div>
          <div className="grid gap-2 sm:grid-cols-2"><Skeleton className="h-5 w-full rounded-md" /><Skeleton className="h-5 w-full rounded-md" /><Skeleton className="h-5 w-full rounded-md" /><Skeleton className="h-5 w-full rounded-md" /></div>
          <Card className="mt-4 space-y-4 p-5 sm:p-6"><div className="flex items-center justify-between"><Skeleton className="h-8 w-32 rounded-md" /><Skeleton className="h-5 w-24 rounded-md" /></div><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><div className="space-y-3 border-t border-outline-variant pt-4"><Skeleton className="h-4 w-3/4 rounded-md" /><Skeleton className="h-4 w-2/3 rounded-md" /><Skeleton className="h-4 w-3/4 rounded-md" /></div></Card>
        </div>
      </div>
      <Card className="overflow-hidden p-0"><div className="flex border-b border-outline-variant"><Skeleton className="h-12 flex-1" /><Skeleton className="h-12 flex-1" /></div><div className="space-y-3 p-5 sm:p-6"><Skeleton className="h-4 w-32 rounded-md" /><Skeleton className="h-4 w-full rounded-md" /><Skeleton className="h-4 w-4/5 rounded-md" /><Skeleton className="h-4 w-3/5 rounded-md" /></div></Card>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden rounded-lg bg-surface-container-low p-4 shadow-primary-elevated">
          <div className="flex gap-5">
            <Skeleton className="size-20 shrink-0 rounded-lg sm:size-30" />
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
              <div className="min-w-0 pr-10">
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
    <div className="space-y-6">
      <HeaderPanelSkeleton titleWidth="w-56" descWidth="w-80" />
      <div className="grid items-start gap-5 sm:gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="p-2.5 sm:p-3"><div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-lg" />)}</div></Card>
        <Card className="p-4 sm:p-7 lg:p-9"><Skeleton className="h-6 w-36 max-w-full rounded-sm" /><Skeleton className="mt-3 h-4 w-64 max-w-full rounded-sm" /><div className="mt-7 grid gap-4 sm:gap-5 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}</div><Skeleton className="mt-6 h-10 w-full max-w-32 rounded-sm sm:mt-7" /></Card>
      </div>
    </div>
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
          <Skeleton className={cn("mt-4 h-5 rounded-sm", descWidth, "max-w-full")} />
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
  const fixedSearch = <Skeleton className="h-10 w-full max-w-md min-w-0 flex-1 rounded-sm" />;
  const productSearch = <Skeleton className="h-10 w-96 min-w-0 max-w-full rounded-sm" />;
  const button = <Skeleton className="h-10 w-44 shrink-0 rounded-md" />;
  const productButton = <Skeleton className="h-10 min-w-0 flex-1 rounded-md" />;
  const productWideButton = <Skeleton className="h-10 min-w-0 flex-1 rounded-md" />;
  const wideButton = <Skeleton className="h-10 w-52 shrink-0 rounded-md" />;
  const select = <Skeleton className="h-10 w-48 shrink-0 rounded-md" />;

  switch (variant) {
    case "search-action":
      return <><div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{search}</div><div className="max-w-full shrink-0">{button}</div></>;
    case "search-double-action":
      return <><div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{search}</div><div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-3">{button}{button}</div></>;
    case "search-triple-action":
      return <><div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{search}</div><div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-3">{button}{button}{wideButton}</div></>;
    case "filter-search-double-action":
      return <><div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 lg:flex-nowrap"><Skeleton className="h-10 w-64 shrink-0 rounded-md" />{fixedSearch}</div><div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-3">{button}{wideButton}</div></>;
    case "filter-search-triple-action":
      return <><div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 lg:flex-nowrap"><Skeleton className="h-10 w-64 shrink-0 rounded-md" />{productSearch}</div><div className="mr-4 flex w-full max-w-[36rem] min-w-0 shrink items-center gap-3">{productButton}{productButton}{productWideButton}</div></>;
    case "search-select":
      return <><div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{search}</div>{select}</>;
    case "search-select-reset":
      return <><div className="flex min-w-0 w-full flex-1 basis-full flex-wrap items-center gap-3 md:w-auto md:basis-0">{search}</div><div className="flex w-full min-w-0 items-center gap-2 sm:w-auto"><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-40 sm:flex-none" /><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-24 sm:flex-none" /></div></>;
    case "search-only":
    default:
      return <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{search}</div>;
  }
}

function TableFrameSkeleton({ rows = 5, columns = 6, titleWidth, descWidth, toolbarVariant = "search-only", hasActions = true, bodyPattern = TABLE_BODY_PATTERN, className, showFooter = true, toolbarInHeader = false }) {
  return (
    <Card className={cn("overflow-hidden p-0 shadow-sm", className)}>
      {toolbarInHeader ? (
        <div className="border-b border-slate-200/80 px-4 py-4 sm:px-5 lg:px-6 dark:border-slate-800">
           <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              {titleWidth ? <Skeleton className={cn("h-6 max-w-full rounded-sm", titleWidth)} /> : null}
              {descWidth ? <Skeleton className={cn("mt-2 h-4 max-w-full rounded-sm", descWidth)} /> : null}
            </div>
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">{renderToolbarSkeleton(toolbarVariant)}</div>
          </div>
        </div>
      ) : (
        <>
          {titleWidth || descWidth ? (
            <div className="mb-4 px-5 pt-5">
              {titleWidth ? <Skeleton className={cn("h-7 max-w-full rounded-sm", titleWidth)} /> : null}
              {descWidth ? <Skeleton className={cn("mt-2 h-4 max-w-full rounded-sm", descWidth)} /> : null}
            </div>
          ) : null}
          <div className="border-b border-slate-200/80 p-4 dark:border-slate-800">
             <div className={cn("flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between", toolbarVariant === "search-select-reset" && "md:flex-row md:items-center md:justify-between")}>
              {renderToolbarSkeleton(toolbarVariant)}
            </div>
          </div>
        </>
      )}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-[960px] text-left text-body">
          <thead className="border-b border-slate-200/80 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-900/95">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="whitespace-nowrap px-6 py-4">
                   <Skeleton className="h-3 w-24 max-w-full rounded-sm" />
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
                       <Skeleton className={cn("inline-block max-w-full", cellClass)} />
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

function AdminListFooterSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center gap-3 border-t border-outline-variant/70 bg-surface/60 px-3 py-3 text-center text-xs sm:flex-row sm:justify-between sm:px-4 sm:text-sm sm:text-left">
        <Skeleton className="h-4 w-44 max-w-full rounded-sm" />
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:justify-end">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
      <p className="px-3 py-2 text-xs text-on-surface-variant sm:px-4 md:hidden">Swipe to see more columns</p>
    </>
  );
}

export function AdminProductsSkeleton() {
  const headers = ["w-8", "w-40", "w-20", "w-24", "w-16", "w-16", "w-20", "size-9"];
  const cells = ["w-8", "w-40", "w-20", "w-24", "w-16", "w-16", "w-20", "size-9"];

  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="border-b border-outline-variant/70 px-4 py-4 sm:px-5 lg:px-6">
         <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1"><Skeleton className="h-6 w-28 rounded-sm" /><Skeleton className="mt-2 h-4 w-full max-w-[42rem] rounded-sm" /></div>
          <div className="w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-10 w-full min-w-0 flex-1 rounded-md sm:max-w-md lg:max-w-sm" />
              <div className="grid w-full grid-cols-3 gap-2 md:contents">
                <Skeleton className="h-10 w-full rounded-md sm:w-32" />
                <Skeleton className="h-10 w-full rounded-md sm:w-36" />
                <Skeleton className="h-10 w-full rounded-md sm:w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-start border-b border-outline-variant/70 px-4 py-3"><div className="flex w-full gap-1 sm:w-auto"><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-16 sm:flex-none" /><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-20 sm:flex-none" /><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-20 sm:flex-none" /></div></div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-body">
          <thead className="border-b border-outline-variant/70 bg-surface-container-low/60">
            <tr>{headers.map((width, index) => <th key={index} className="whitespace-nowrap px-3 py-3 sm:px-4"><Skeleton className={`h-3 ${width} max-w-full rounded-sm`} /></th>)}</tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 ? "bg-surface-container-low/40" : ""}>
                {cells.map((width, columnIndex) => (
                  <td key={columnIndex} className="whitespace-nowrap px-3 py-3.5 sm:px-4">
                    {columnIndex === 1 ? <div className="flex items-center gap-3"><Skeleton className="size-10 shrink-0 rounded-xl" /><div><Skeleton className="h-4 w-40 max-w-full rounded-sm" /><Skeleton className="mt-2 h-3 w-24 rounded-sm" /></div></div> : <Skeleton className={`${width === "size-9" ? "size-9 rounded-md" : `h-4 ${width}`} inline-block max-w-full rounded-sm`} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <AdminListFooterSkeleton />
      </div>
    </Card>
  );
}

export function AdminCaptureSkeleton() {
  const headers = ["w-8", "w-32", "w-48", "w-20", "w-24", "w-20", "w-20", "size-9"];
  const cells = ["w-8", "w-32", "w-48", "w-20", "w-24", "w-20", "w-20", "size-9"];

  return (
    <div className="space-y-6">
      <AdminStatsSkeleton count={4} />
      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="border-b border-outline-variant/70 px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Skeleton className="h-7 w-44 max-w-full rounded-sm" />
              <Skeleton className="mt-2 h-4 w-[27rem] max-w-full rounded-sm" />
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <Skeleton className="h-10 w-full min-w-0 flex-1 rounded-md sm:max-w-md lg:w-80" />
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-44" />
                <Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-body">
            <thead className="border-b border-outline-variant/70 bg-surface-container-low/60">
              <tr>{headers.map((width, index) => <th key={index} className="whitespace-nowrap px-3 py-3 sm:px-4"><Skeleton className={`h-3 ${width} max-w-full rounded-sm`} /></th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 ? "bg-surface-container-low/40" : ""}>
                  {cells.map((width, cellIndex) => (
                    <td key={cellIndex} className="whitespace-nowrap px-3 py-3.5 sm:px-4">
                      <Skeleton className={`${width === "size-9" ? "size-9 rounded-md" : `h-4 ${width}`} inline-block max-w-full rounded-sm`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <AdminListFooterSkeleton />
        </div>
      </Card>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <section className="container-page py-8 sm:py-12">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between"><div className="min-w-0"><Skeleton className="h-4 w-32 rounded-sm" /><Skeleton className="mt-2 h-7 w-52 max-w-full rounded-sm sm:h-8" /><Skeleton className="mt-3 h-5 w-full max-w-xl rounded-sm" /></div><Skeleton className="h-10 w-full rounded-md sm:w-40" /></div>
      <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_390px]"><div className="space-y-4"><CartSkeleton /></div><Card className="h-fit overflow-hidden rounded-xl p-0"><div className="p-4 sm:p-6"><Skeleton className="h-8 w-44 max-w-full rounded-md" /><Skeleton className="mt-3 h-5 w-full max-w-xs rounded-md" /></div><div className="space-y-5 p-4 sm:p-6"><div className="space-y-3"><Skeleton className="h-5 w-full rounded-md" /><Skeleton className="h-5 w-full rounded-md" /><Skeleton className="mt-4 h-7 w-full rounded-md" /></div><Skeleton className="h-12 w-full rounded-md" /><Skeleton className="mx-auto h-4 w-48 max-w-full rounded-md" /></div></Card></div>
    </section>
  );
}

export function AdminCaptureDetailSkeleton() {
  return (
    <Card className="space-y-6 p-6">
      <div className="w-full max-w-2xl">
        <Skeleton className="h-4 w-28 rounded-sm" />
        <Skeleton className="mt-3 h-9 w-64 max-w-full rounded-sm" />
        <Skeleton className="mt-4 h-5 w-full max-w-lg rounded-sm" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-5">
            <Skeleton className="h-6 w-40 rounded-sm" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}
            </div>
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-44 rounded-sm" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-48 rounded-sm" />
                  <Skeleton className="h-4 w-20 rounded-sm" />
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-outline-variant pt-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-full max-w-md rounded-sm" />)}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <Skeleton className="h-6 w-32 rounded-sm" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="mt-1.5 size-2 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 rounded-sm" />
                    <Skeleton className="h-3 w-24 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 border-t border-outline-variant pt-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-sm" />)}
            </div>
          </Card>
          <Card>
            <Skeleton className="h-6 w-36 rounded-sm" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}

export function AdminCategoriesSkeleton({ variant = "list" }) {
  if (variant === "products") {
    return (
      <Card className="overflow-hidden p-0 shadow-sm">
         <div className="border-b border-outline-variant/70 px-4 py-4 sm:px-5 lg:px-6">
           <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
             <div className="min-w-0"><Skeleton className="h-6 w-32 max-w-full rounded-sm" /><Skeleton className="mt-2 h-4 w-full max-w-[28rem] rounded-sm" /></div>
             <Skeleton className="h-10 w-full shrink-0 sm:w-44" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-body">
            <thead className="border-b border-outline-variant/70 bg-surface-container-low/60"><tr>{["w-8", "w-40", "w-24", "w-20", "w-24", "w-20", "w-20"].map((width, index) => <th key={index} className="px-3 py-3 sm:px-4"><Skeleton className={`h-3 ${width} rounded-sm`} /></th>)}</tr></thead>
            <tbody className="divide-y divide-outline-variant/40">{Array.from({ length: 6 }).map((_, rowIndex) => <tr key={rowIndex}>{["w-8", "w-44", "w-24", "w-20", "w-24", "w-20", "size-9"].map((width, index) => <td key={index} className="px-3 py-3.5 sm:px-4"><Skeleton className={`${width === "size-9" ? "size-9 rounded-md" : `inline-block h-4 ${width} rounded-sm`}`} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      </Card>
    );
  }

  const headers = ["w-8", "w-40", "w-20", "w-20", "w-24", "w-20", "size-9"];
  const cells = ["w-8", "w-40", "w-20", "w-12", "w-24", "w-20", "size-9"];

  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="border-b border-outline-variant/70 px-4 py-4 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1"><Skeleton className="h-6 w-32 rounded-sm" /><Skeleton className="mt-2 h-4 w-full max-w-[38rem] rounded-sm" /></div>
          <div className="grid w-full grid-cols-2 items-center gap-2 md:flex md:w-auto md:justify-end md:gap-3">
            <Skeleton className="col-span-2 h-10 w-full min-w-0 rounded-md md:col-auto md:w-72 lg:w-80" />
            <Skeleton className="h-10 w-full min-w-0 rounded-md md:w-36" />
            <Skeleton className="h-10 w-full min-w-0 rounded-md md:w-44" />
          </div>
        </div>
      </div>
      <div className="flex justify-start border-b border-outline-variant/70 px-4 py-3"><div className="flex w-full gap-1 sm:w-auto"><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-16 sm:flex-none" /><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-20 sm:flex-none" /><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-20 sm:flex-none" /></div></div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-body">
          <thead className="border-b border-outline-variant/70 bg-surface-container-low/60">
            <tr>{headers.map((width, index) => <th key={index} className="whitespace-nowrap px-3 py-3 sm:px-4"><Skeleton className={`h-3 ${width} max-w-full rounded-sm`} /></th>)}</tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 ? "bg-surface-container-low/40" : ""}>
                {cells.map((width, columnIndex) => (
                  <td key={columnIndex} className="whitespace-nowrap px-3 py-3.5 sm:px-4">
                    {columnIndex === 1 ? <div className="min-w-0"><Skeleton className="h-5 w-44 max-w-full rounded-sm" /><Skeleton className="mt-2 h-3 w-32 max-w-full rounded-sm" /></div> : <Skeleton className={`${width === "size-9" ? "size-9 rounded-md" : `h-4 ${width}`} inline-block max-w-full rounded-sm`} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <AdminListFooterSkeleton />
      </div>
    </Card>
  );
}

export function AdminCustomersSkeleton() {
  const headers = ["w-8", "w-28", "w-48", "w-24", "w-16", "w-20", "w-20", "size-9"];
  const cells = ["w-8", "w-36", "w-48", "w-24", "w-12", "w-20", "w-20"];

  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="border-b border-outline-variant/70 px-4 py-4 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><Skeleton className="h-6 w-32 rounded-sm" /><Skeleton className="mt-2 h-4 w-full max-w-[34rem] rounded-sm" /></div>
          <div className="flex w-full items-center gap-2 lg:w-auto"><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:max-w-md lg:w-72" /><Skeleton className="h-10 w-36 shrink-0 rounded-md" /></div>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-body">
          <thead className="border-b border-outline-variant/70 bg-surface-container-low/60">
            <tr>{headers.map((width, index) => <th key={index} className="whitespace-nowrap px-3 py-3 sm:px-4"><Skeleton className={`h-3 ${width} max-w-full rounded-sm`} /></th>)}</tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 ? "bg-surface-container-low/40" : ""}>
                {cells.map((width, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap px-3 py-3.5 sm:px-4">
                    <Skeleton className={`${width === "size-9" ? "size-9 rounded-md" : `h-4 ${width}`} inline-block max-w-full rounded-sm`} />
                  </td>
                ))}
                <td className="px-3 py-3.5 sm:px-4"><Skeleton className="mx-auto size-9 rounded-md" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminListFooterSkeleton />
      </div>
    </Card>
  );
}

export function AdminOrdersSkeleton() {
  const headers = ["w-8", "w-24", "w-28", "w-20", "w-16", "w-24", "w-20", "w-20", "size-9"];
  const cells = ["w-8", "w-24", "w-28", "w-16", "w-20", "w-20", "w-24", "w-24", "size-9"];

  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="border-b border-outline-variant/70 px-4 py-4 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><Skeleton className="h-6 w-32 rounded-sm" /><Skeleton className="mt-2 h-4 w-full max-w-[34rem] rounded-sm" /></div>
          <div className="flex w-full items-center gap-2 lg:w-auto"><Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:max-w-md lg:w-80" /><Skeleton className="h-10 w-36 shrink-0 rounded-md sm:w-56" /></div>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-body">
          <thead className="border-b border-outline-variant/70 bg-surface-container-low/60">
            <tr>{headers.map((width, index) => <th key={index} className="whitespace-nowrap px-3 py-3 sm:px-4"><Skeleton className={`h-3 ${width} max-w-full rounded-sm`} /></th>)}</tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 ? "bg-surface-container-low/40" : ""}>
                {cells.map((width, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap px-3 py-3.5 sm:px-4">
                    <Skeleton className={`${width === "size-9" ? "size-9 rounded-md" : `h-4 ${width}`} inline-block max-w-full rounded-sm`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <AdminListFooterSkeleton />
      </div>
    </Card>
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
    <div className="space-y-6">
      <HeaderPanelSkeleton titleWidth="w-44" descWidth="w-72" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
    <Card className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <Skeleton className="h-8 w-64 max-w-full rounded-sm" />
          <Skeleton className="mt-2 h-4 w-full max-w-[32rem] rounded-sm" />
        </div>
        <Skeleton className="h-10 w-full sm:w-36" />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Skeleton className="h-6 w-40 rounded-sm" />
                <Skeleton className="mt-2 h-4 w-full max-w-64 rounded-sm" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-6 space-y-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex flex-wrap gap-4 rounded-md border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <Skeleton className="size-24 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-6 w-56 rounded-sm" />
                    <Skeleton className="h-4 w-24 rounded-sm" />
                  </div>
                  <div className="w-full space-y-2 text-right sm:w-auto sm:min-w-44">
                    <Skeleton className="ml-auto h-5 w-20 rounded-sm" />
                    <Skeleton className="ml-auto h-3 w-28 rounded-sm" />
                    <Skeleton className="ml-auto h-3 w-36 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-slate-200 pt-5 dark:border-slate-800">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full max-w-md rounded-sm" />)}
            </div>
          </Card>
          <Card className="p-4 sm:p-5">
            <Skeleton className="h-6 w-52 rounded-sm" />
            <Skeleton className="mt-1 h-4 w-80 rounded-sm" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}
            </div>
            <Skeleton className="mt-5 h-4 w-40 rounded-sm" />
            <Skeleton className="mt-2 h-6 w-28 rounded-full" />
          </Card>
          <Card className="p-4 sm:p-5">
            <Skeleton className="h-6 w-40 rounded-sm" />
            <Skeleton className="mt-3 h-24 w-full rounded-sm" />
          </Card>
        </div>
        <div className="min-w-0 space-y-6">
          <Card className="p-4 sm:p-5">
            <Skeleton className="h-6 w-44 rounded-sm" />
            <Skeleton className="mt-2 h-4 w-full max-w-80 rounded-sm" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-sm" />)}
              <div className="grid grid-cols-2 gap-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            </div>
          </Card>
          <Card className="p-4 sm:p-5">
            <Skeleton className="h-6 w-36 rounded-sm" />
            <Skeleton className="mt-4 h-5 w-40 rounded-sm" />
            <Skeleton className="mt-2 h-4 w-full max-w-72 rounded-sm" />
            <Skeleton className="mt-3 h-4 w-20 rounded-sm" />
          </Card>
          <Card className="p-4 sm:p-5">
            <Skeleton className="h-6 w-32 rounded-sm" />
            <Skeleton className="mt-4 h-24 w-full rounded-sm" />
          </Card>
        </div>
      </div>
      <Card className="p-4 sm:p-5">
        <Skeleton className="h-6 w-32 rounded-sm" />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
      </Card>
    </Card>
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
      <div className="mb-8">
        <Skeleton className="h-9 w-64 max-w-[85%] rounded-sm" />
        <Skeleton className="mt-3 h-4 w-72 max-w-[90%] rounded-sm" />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="min-w-0 border-outline-variant/70 p-3 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start sm:mb-5">
              <Skeleton className="size-9 rounded-xl sm:size-10" />
            </div>
            <Skeleton className="h-7 w-20 max-w-full rounded-sm sm:h-8 sm:w-24" />
            <Skeleton className="mt-2 h-4 w-24 max-w-full rounded-sm" />
            <Skeleton className="mt-2 h-3 w-32 max-w-full rounded-sm" />
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-5 shadow-sm sm:p-6">
        <Skeleton className="h-6 w-56 rounded-sm" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full rounded-sm" />
        <div className="mt-6 h-64 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-200 dark:bg-slate-900/50 dark:ring-slate-800">
          <div className="flex h-full items-end gap-3">
            {["45%", "60%", "38%", "72%", "52%", "82%"].map((height, index) => (
              <Skeleton key={index} className="w-full flex-1 rounded-t-lg" style={{ height }} />
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-end py-7">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant/70 px-5 py-5 sm:px-6">
          <div>
            <Skeleton className="h-6 w-40 rounded-sm" />
            <Skeleton className="mt-2 h-4 w-64 max-w-full rounded-sm" />
          </div>
          <Skeleton className="h-4 w-16 rounded-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                {Array.from({ length: 8 }).map((_, index) => (
                  <th key={index} className="px-5 py-3"><Skeleton className="h-3 w-16 rounded-sm" /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-t border-outline-variant/60">
                  {Array.from({ length: 8 }).map((_, columnIndex) => (
                    <td key={columnIndex} className="px-5 py-4"><Skeleton className={columnIndex === 5 ? "h-6 w-20 rounded-full" : "h-4 w-24 rounded-sm"} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function AdminCategoryFormSkeleton() {
  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="p-5"><Skeleton className="h-6 w-44 rounded-sm" /><Skeleton className="mt-2 h-4 w-full max-w-[34rem] rounded-sm" /><div className="mt-5 grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-11 w-full rounded-sm" />)}</div><Skeleton className="mt-4 h-24 w-full rounded-sm" /></Card>
        <Card className="p-5"><Skeleton className="h-6 w-40 rounded-sm" /><Skeleton className="mt-2 h-4 w-full max-w-[34rem] rounded-sm" /><div className="mt-5 grid gap-4 md:grid-cols-2"><Skeleton className="h-11 w-full rounded-sm" /><Skeleton className="h-11 w-full rounded-sm" /></div><Skeleton className="mt-4 h-28 w-full rounded-sm" /></Card>
      </div>
      <Card className="h-fit p-5"><Skeleton className="h-6 w-28 rounded-sm" /><Skeleton className="mt-2 h-4 w-full rounded-sm" /><Skeleton className="mt-5 h-11 w-full rounded-sm" /><Skeleton className="mt-3 h-11 w-full rounded-sm" /></Card>
    </div>
  );
}

export function AdminProfileSkeleton() {
  return (
    <div className="min-w-0">
      <HeaderPanelSkeleton titleWidth="w-48" descWidth="w-full max-w-[34rem]" />
      <div className="mt-6 grid min-w-0 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-4 sm:p-5"><div className="flex items-center gap-4"><Skeleton className="size-20 shrink-0 rounded-full" /><div className="min-w-0 flex-1"><Skeleton className="h-6 w-40 max-w-full rounded-sm" /><Skeleton className="mt-2 h-4 w-48 max-w-full rounded-sm" /><Skeleton className="mt-3 h-6 w-20 rounded-full" /></div></div><Skeleton className="mt-6 h-28 w-full rounded-xl" /><Skeleton className="mt-4 h-32 w-full rounded-xl" /></Card>
        <div className="min-w-0 space-y-6"><Card className="p-4 sm:p-5"><Skeleton className="h-6 w-40 rounded-sm" /><div className="mt-5 grid gap-4 md:grid-cols-2">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-11 w-full rounded-sm" />)}</div><Skeleton className="mt-5 h-11 w-full rounded-md sm:w-32" /></Card><Card className="p-4 sm:p-5"><Skeleton className="h-6 w-32 rounded-sm" /><Skeleton className="mt-2 h-4 w-full max-w-[28rem] rounded-sm" /><div className="mt-5 grid gap-4 md:grid-cols-2"><Skeleton className="h-11 w-full rounded-sm" /><Skeleton className="h-11 w-full rounded-sm" /></div><Skeleton className="mt-5 h-11 w-full rounded-md sm:w-36" /></Card></div>
      </div>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderPanelSkeleton titleWidth="w-44" descWidth="w-80" />
      <TableFrameSkeleton rows={4} columns={7} toolbarVariant="search-select-reset" />
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
  return <SecureAccessLoader label={title || description || "Loading..."} />;
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
  const dashboardTablePattern = [
    "h-4 w-6 rounded-sm",
    "h-4 w-24 rounded-sm",
    "h-4 w-24 rounded-sm",
    "h-6 w-16 rounded-full",
    "h-4 w-8 rounded-sm",
    "h-5 w-16 rounded-sm",
    "h-4 w-24 rounded-sm",
    "h-8 w-36 rounded-md",
  ];

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
              <div key={index} className="flex items-center justify-between gap-3 rounded-lg border border-amber-200/70 bg-amber-50/80 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-md" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-36 max-w-full rounded-sm" />
                    <Skeleton className="h-3 w-24 max-w-full rounded-sm" />
                  </div>
                </div>
                <Skeleton className="h-6 w-14 shrink-0 rounded-lg" />
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
          <Skeleton className="size-8 shrink-0 rounded-sm" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
              <Skeleton className="size-12 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32 max-w-full rounded-sm" />
                <Skeleton className="h-3 w-24 max-w-full rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6">
        <TableFrameSkeleton
          rows={5}
          columns={9}
          titleWidth="w-40"
          descWidth="w-80"
          toolbarVariant="search-select"
          bodyPattern={dashboardTablePattern}
          toolbarInHeader
        />
      </div>
    </div>
  );
}

export function AdminStatsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );
}

// Route-level loaders for admin pages that fetch their data in a client component.
// Keep the control count and table columns explicit so a loader never invents UI.
function AdminRouteTableSkeleton({ columns, rows = 6, search = true, filters = 0, actions = 1 }) {
  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="border-b border-outline-variant/70 px-4 py-4 sm:px-5 lg:px-6">
        <Skeleton className="h-6 w-40 max-w-full rounded-sm" />
        <Skeleton className="mt-2 h-4 w-full max-w-[34rem] rounded-sm" />
      </div>
      <div className="border-b border-outline-variant/70 p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {search ? <Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:max-w-md" /> : null}
          {Array.from({ length: filters }).map((_, index) => <Skeleton key={index} className="h-10 w-full rounded-md sm:w-40" />)}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-body">
          <thead className="border-b border-outline-variant/70 bg-surface-container-low/60">
            <tr>{columns.map((width, index) => <th key={index} className="whitespace-nowrap px-3 py-3 sm:px-4"><Skeleton className={`h-3 ${width} max-w-full rounded-sm`} /></th>)}{actions ? <th className="px-3 py-3 sm:px-4"><Skeleton className="mx-auto size-3 rounded-sm" /></th> : null}</tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {Array.from({ length: rows }).map((_, rowIndex) => <tr key={rowIndex} className={rowIndex % 2 ? "bg-surface-container-low/40" : ""}>
              {columns.map((width, columnIndex) => <td key={columnIndex} className="whitespace-nowrap px-3 py-3.5 sm:px-4"><Skeleton className={`inline-block h-4 ${width} max-w-full rounded-sm`} /></td>)}
              {actions ? <td className="px-3 py-3.5 sm:px-4"><Skeleton className="mx-auto size-9 rounded-md" /></td> : null}
            </tr>)}
          </tbody>
        </table>
        <AdminListFooterSkeleton />
      </div>
    </Card>
  );
}

export function AdminCommissionsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant bg-surface-container-low/40 px-4 py-5 sm:px-6 lg:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div><Skeleton className="h-8 w-48 rounded-md" /><Skeleton className="mt-2 h-4 w-full max-w-xl rounded-md" /></div>
            <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 xl:w-auto"><Skeleton className="h-10 min-w-0 w-full rounded-md sm:w-72" /><Skeleton className="h-10 w-40 max-w-full rounded-md" /></div>
          </div>
          <div className="mt-5 flex gap-1 border-b border-outline-variant/80"><Skeleton className="h-10 w-40 rounded-t-md" /><Skeleton className="h-10 w-32 rounded-t-md" /></div>
        </div>
        <div className="p-4 sm:p-6"><AdminRouteTableSkeleton columns={["w-8", "w-20", "w-40", "w-28", "w-24", "w-20", "w-20"]} rows={6} search={false} actions={1} /></div>
      </Card>
    </div>
  );
}

export function AdminEmailTemplatesSkeleton() {
  return (
    <Card className="space-y-6 p-3 sm:p-5 lg:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><Skeleton className="h-3 w-28 rounded-md" /><Skeleton className="mt-3 h-10 w-44 rounded-md" /><Skeleton className="mt-2 h-5 w-96 max-w-full rounded-md" /></div><Skeleton className="h-10 w-full rounded-md md:w-56" /></div>
      <div className="flex gap-1 overflow-x-auto border-b border-outline-variant/80"><Skeleton className="h-11 w-40 rounded-t-md" /><Skeleton className="h-11 w-48 rounded-t-md" /></div>
      <AdminRouteTableSkeleton columns={["w-8", "w-36", "w-28", "w-24", "w-20"]} rows={6} search={false} actions={1} />
    </Card>
  );
}

export function AdminVouchersSkeleton() {
  return <AdminRouteTableSkeleton columns={["w-8", "w-24", "w-40", "w-32", "w-24", "w-20", "w-32", "w-24"]} rows={6} search filters={0} actions={1} />;
}

export function AdminProductSyncRouteSkeleton() {
  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-outline-variant px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0"><Skeleton className="h-6 w-40 max-w-full rounded-md" /><Skeleton className="mt-2 h-4 w-full max-w-[32rem] rounded-md" /></div><div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] xl:w-auto"><Skeleton className="col-span-2 h-9 w-full rounded-md sm:col-span-1 sm:w-48" /><Skeleton className="h-9 w-full rounded-md sm:w-36" /><Skeleton className="h-9 w-full rounded-md sm:w-32" /></div></div>
      <div className="grid min-w-0 gap-4 p-4 lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)]"><Card className="min-w-0 p-4"><Skeleton className="h-5 w-36 max-w-full rounded-md" /><Skeleton className="mt-3 h-10 w-full rounded-md" /><div className="mt-3 space-y-2">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10 w-full rounded-lg" />)}</div></Card><Card className="min-w-0 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><Skeleton className="h-5 w-32 max-w-full rounded-md" /><div className="grid w-full grid-cols-2 gap-2 sm:w-auto"><Skeleton className="h-9 w-full sm:w-48" /><Skeleton className="h-9 w-full sm:w-32" /></div></div><div className="mt-4 space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex items-center gap-3 rounded-lg border border-outline-variant p-3"><Skeleton className="size-5 rounded" /><Skeleton className="size-11 rounded-lg" /><div className="min-w-0 flex-1"><Skeleton className="h-4 w-3/4 max-w-full rounded-md" /><Skeleton className="mt-2 h-3 w-1/2 max-w-full rounded-md" /></div><Skeleton className="h-4 w-16 shrink-0 rounded-md" /></div>)}</div></Card></div>
    </Card>
  );
}

export function AdminHomeSkeleton() {
  return (
    <Card className="overflow-visible p-0">
      <div className="border-b border-outline-variant bg-surface-container-low/40 px-4 py-5 sm:px-5 lg:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><Skeleton className="h-8 w-72 max-w-full rounded-md" /><Skeleton className="mt-2 h-4 w-full max-w-xl rounded-md" /></div><div className="flex gap-2"><Skeleton className="h-10 w-36 rounded-md" /><Skeleton className="h-10 w-44 rounded-md" /></div></div>
      </div>
      <div className="flex flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 gap-2 overflow-x-hidden border-b border-outline-variant p-3 sm:p-5 lg:w-64 lg:flex-col lg:border-b-0 lg:border-r lg:p-6">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-10 min-w-32 flex-1 rounded-md lg:w-full lg:flex-none" />)}</aside>
        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-7"><div className="flex items-start gap-3"><Skeleton className="size-11 rounded-lg" /><div><Skeleton className="h-6 w-48 rounded-md" /><Skeleton className="mt-2 h-4 w-full max-w-md rounded-md" /></div></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><Skeleton className="h-14 rounded-md sm:col-span-2" /><Skeleton className="h-10 rounded-md" /><Skeleton className="h-10 rounded-md" /><Skeleton className="h-28 rounded-md sm:col-span-2" /><Skeleton className="h-14 rounded-md sm:col-span-2" /><Skeleton className="h-10 rounded-md sm:col-span-2" /></div></div>
      </div>
    </Card>
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

// Mirrors the storefront home page layout ("(shop)/page.jsx") using the saved
// homepage config so the skeleton only shows as many tiles/cards as the admin
// actually picked per section.
export function HomePageSkeleton({ display = {} }) {
  const { heroEnabled = false, heroCount = 0, categoriesEnabled = false, catCount = 0, sections = [] } = display;
  const categoryTiles = categoriesEnabled ? Math.max(0, Math.min(catCount, 6)) : 0;
  const heroCards = heroEnabled ? Math.max(0, Math.min(heroCount, 3)) : 0;

  return (
    <>
      {heroCards > 0 ? (
        <section className="zl-hero">
          <div className="zl-hero-left">
            <Skeleton className="h-3 w-44 rounded-sm" />
            <Skeleton className="mt-4 h-11 w-full max-w-md rounded-sm" />
            <Skeleton className="mt-2 h-11 w-80 max-w-full rounded-sm" />
            <Skeleton className="mt-5 h-4 w-full max-w-lg rounded-sm" />
            <Skeleton className="mt-2 h-4 w-96 max-w-full rounded-sm" />
            <Skeleton className="mt-7 h-12 w-40 rounded-xl" />
            <div className="zl-stats">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="zl-stat">
                  <Skeleton className="h-5 w-20 rounded-sm" />
                  <Skeleton className="mt-1.5 h-3 w-16 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="zl-mhero">
            <div className="zl-mhero-stage">
              <div className="zl-mhero-slide is-active">
                <div className="zl-mhero-copy">
                  <span className="zl-mhero-badge skeleton skeleton-on-brand block h-6 w-28 rounded-full" />
                  <span className="zl-mhero-title skeleton skeleton-on-brand block h-10 w-full max-w-[18rem] rounded-sm" />
                  <span className="zl-mhero-sub skeleton skeleton-on-brand block h-4 w-3/5 rounded-sm" />
                  <div className="zl-mhero-bottom">
                    <span className="zl-mhero-price skeleton skeleton-on-brand h-5 w-20 rounded-sm" />
                    <span className="zl-mhero-cta skeleton skeleton-on-brand h-10 w-24 rounded-full" />
                  </div>
                </div>
                <div className="zl-mhero-img">
                  <span className="skeleton skeleton-on-brand block h-[150px] w-full rounded-xl" />
                </div>
              </div>
            </div>
            <div className="zl-mhero-nav">
               <span className="skeleton size-10 rounded-full" />
               <div className="zl-mhero-dots">
                 <span className="skeleton h-2 w-5 rounded-full" />
                 {Array.from({ length: Math.max(0, heroCards - 1) }).map((_, index) => <span key={index} className="skeleton h-2 w-2 rounded-full" />)}
               </div>
               <span className="skeleton size-10 rounded-full" />
            </div>
            <div className="zl-mstats">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="zl-stat">
                  <div className="zl-stat-top">
                    <Skeleton className="h-4 w-12 rounded-sm" />
                  </div>
                  <span>
                    <Skeleton className="h-3 w-16 rounded-sm" />
                  </span>
                </div>
              ))}
            </div>
           </div>
          <div className="hero-card-col pointer-events-none">
            <article className="hero-card">
              <div className="hero-card-body">
                <span className="hero-badge skeleton skeleton-on-brand h-7 w-28 rounded-md" />
                <Skeleton className="hero-category skeleton-on-brand h-3 w-32 rounded-sm" />
                <Skeleton className="hero-name skeleton-on-brand h-14 w-full max-w-[22rem] rounded-sm" />
                <div className="hero-price-row">
                  <Skeleton className="hero-price skeleton-on-brand h-8 w-28 rounded-sm" />
                  <Skeleton className="hero-view skeleton-on-brand h-10 w-24 rounded-md" />
                </div>
                <div className="hero-shipping">
                  <Skeleton className="skeleton-on-brand size-4 shrink-0 rounded-full" />
                  <Skeleton className="skeleton-on-brand h-3 w-36 rounded-sm" />
                </div>
              </div>
              <div className="hero-media">
                <Skeleton className="h-full min-h-[13rem] w-full rounded-xl" />
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {categoryTiles > 0 ? (
        <section className="home-categories-section py-10 md:py-16">
          <div className="container-page">
          <div className="zl-sec-head mb-6 flex items-end justify-between gap-x-3 gap-y-2">
            <div className="min-w-0 w-full sm:w-auto">
              <Skeleton className="h-6 w-52 max-w-full rounded-sm sm:h-7" />
            </div>
            <div className="panel-actions w-full sm:w-auto sm:justify-end">
              <Skeleton className="h-10 w-16 rounded-sm" />
            </div>
          </div>
          <div className="category-grid grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: categoryTiles }).map((_, index) => (
              <div key={index} className="zl-skel-cat flex min-w-0 flex-col items-center justify-center rounded-[14px] border border-outline-variant bg-surface px-3 py-5 text-center">
                <Skeleton className="size-9 rounded-sm" />
                <Skeleton className="mt-3 h-4 w-28 rounded-sm" />
              </div>
            ))}
          </div>
          </div>
        </section>
      ) : null}

      {sections.map((section, index) => (
        <section key={section.id} className={`container-page py-10 md:py-16 ${index === 0 ? "section-fade-up" : ""}`}>
          <div className="zl-sec-head mb-8 flex items-end justify-between gap-x-3 gap-y-2">
            <div className="min-w-0 w-full sm:w-auto">
              <div className="mb-1">
                <Skeleton className="h-4 w-24 rounded-sm" />
              </div>
              <Skeleton className="h-6 w-56 max-w-full rounded-sm sm:h-7" />
            </div>
            <div className="panel-actions w-full sm:w-auto sm:justify-end">
              <Skeleton className="h-10 w-24 rounded-sm" />
            </div>
          </div>
          <div className="product-grid grid-home">
            {Array.from({ length: section.count }).map((_, productIndex) => (
              <HomeCardSkeleton key={productIndex} />
            ))}
          </div>
        </section>
      ))}

    </>
  );
}

// Mirrors ProductCard including the zl-* hooks so the mobile-only grid-home
// CSS (rows, 104px image, arrow circle) reshapes the skeleton the same way it
// reshapes the real cards.
function HomeCardSkeleton() {
  return (
    <Card className="zl-card group relative flex h-full flex-col border-[rgba(0,0,0,0.06)] p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
      <span className="zl-card-badge absolute left-4 top-4 z-20 inline-block">
        <Skeleton className="h-3.5 w-14 rounded-sm" />
      </span>
      <div className="zl-card-img relative h-[180px] overflow-hidden rounded-t-xl border-b-2 border-[rgba(0,0,0,0.08)] bg-transparent p-4 dark:border-slate-700">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
      <div className="zl-card-body flex min-w-0 flex-1 flex-col p-4 pt-4">
        <div className="min-w-0 min-h-10">
          <Skeleton className="h-4 w-11/12 rounded-sm" />
          <Skeleton className="mt-2 h-4 w-3/5 rounded-sm" />
        </div>
        <Skeleton className="mt-2 h-3.5 w-28 rounded-md" />
        <div className="mt-3 flex min-h-5 w-full items-center justify-between gap-2">
          <Skeleton className="h-5 w-24 shrink-0 rounded-sm" />
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5">
            <Skeleton className="size-2 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-sm" />
          </div>
        </div>
        <div className="zl-card-actions mt-auto pt-5">
          <Skeleton className="h-[30px] w-20 rounded-[7px] min-[768px]:h-10 min-[768px]:w-full min-[768px]:rounded-md" />
        </div>
      </div>
      <span className="zl-card-arrow" />
    </Card>
  );
}
