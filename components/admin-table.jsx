"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eye, MoreVertical, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Button, Card, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;

export function AdminTable({
  columns,
  children,
  data,
  filters = [],
  searchPlaceholder = "Search records",
  searchKeys,
  rowActions,
  title,
  description,
  action,
  pageSize = DEFAULT_PAGE_SIZE,
  zebra = true,
  hideSearch = false,
  hidePagination = false,
  className,
  wrapperClassName,
  tableClassName,
}) {
  if (!data) {
    return (
      <Card className={cn("overflow-hidden p-0", className)}>
        <div className={cn("overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", wrapperClassName)}>
<table className={cn("w-full text-left text-body", tableClassName)}>
            <thead className="sticky top-0 z-10 bg-slate-200/95 text-meta uppercase tracking-[0.14em] text-slate-900 shadow-[0_2px_10px_rgba(15,23,42,0.1)] backdrop-blur dark:bg-slate-800/95 dark:text-white dark:shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
              <tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-5 py-4 font-semibold">{column}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
          </table>
        </div>
      </Card>
    );
  }

  return <AdminDataTable columns={columns} data={data} filters={filters} searchPlaceholder={searchPlaceholder} searchKeys={searchKeys} rowActions={rowActions} title={title} description={description} action={action} pageSize={pageSize} zebra={zebra} hideSearch={hideSearch} hidePagination={hidePagination} className={className} wrapperClassName={wrapperClassName} tableClassName={tableClassName} />;
}

function AdminDataTable({ columns, data, filters, searchPlaceholder, searchKeys, rowActions, title, description, action, pageSize, zebra, hideSearch, hidePagination, className, wrapperClassName, tableClassName }) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState(() => Object.fromEntries(filters.map((filter) => [filter.key, filter.allLabel || "All"])));
  const [sort, setSort] = useState(() => {
    const firstSortable = columns.find((column) => column.sortable);
    return firstSortable ? { key: firstSortable.key, direction: "asc" } : null;
  });
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const filteredData = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return data.filter((row) => {
      const matchesQuery = !normalizedQuery || getSearchValues(row, columns, searchKeys).some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
      const matchesFilters = filters.every((filter) => {
        const selected = filterValues[filter.key];
        if (!selected || selected === (filter.allLabel || "All")) return true;
        return String(filter.value(row)) === selected;
      });
      return matchesQuery && matchesFilters;
    });
  }, [columns, data, deferredQuery, filterValues, filters, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    const column = columns.find((item) => item.key === sort.key);
    if (!column) return filteredData;
    return [...filteredData].sort((a, b) => compareValues(getSortValue(column, a), getSortValue(column, b), sort.direction));
  }, [columns, filteredData, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = sortedData.length ? (safePage - 1) * pageSize : 0;
  const pageItems = sortedData.slice(pageStart, pageStart + pageSize);
  const showingStart = sortedData.length ? pageStart + 1 : 0;
  const showingEnd = Math.min(pageStart + pageSize, sortedData.length);
  const hasActions = typeof rowActions === "function";

  function updateQuery(value) {
    setQuery(value);
    setPage(1);
  }

  function updateFilter(key, value) {
    setFilterValues((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function resetControls() {
    setQuery("");
    setFilterValues(Object.fromEntries(filters.map((filter) => [filter.key, filter.allLabel || "All"])));
    setPage(1);
  }

  function toggleSort(column) {
    if (!column.sortable) return;
    setPage(1);
    setSort((current) => current?.key === column.key ? { key: column.key, direction: current.direction === "asc" ? "desc" : "asc" } : { key: column.key, direction: "asc" });
  }

  return (
    <Card className={cn("overflow-hidden p-0 shadow-sm", className)}>
      {title || description || !(hideSearch && !filters.length && !action) ? (
      <div className="border-b border-slate-100 p-5 dark:border-slate-800">
        {title || description ? (
          <div className="mb-4">
            <div>
              {title ? <h2 className="font-heading text-h2 font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{title}</h2> : null}
              {description ? <p className="mt-1 text-body font-regular text-slate-600 dark:text-slate-300">{description}</p> : null}
            </div>
          </div>
        ) : null}
        {hideSearch && !filters.length && !action ? null : (
        <div className={cn("grid gap-3", action ? "md:grid-cols-[minmax(0,1fr)_repeat(var(--filter-count),minmax(150px,190px))_auto_auto]" : "md:grid-cols-[minmax(0,1fr)_repeat(var(--filter-count),minmax(150px,190px))_auto]")} style={{ "--filter-count": filters.length }}>
          {!hideSearch ? (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="pl-10" />
            </div>
          ) : null}
          {filters.map((filter) => (
            <Select key={filter.key} value={filterValues[filter.key]} onChange={(event) => updateFilter(filter.key, event.target.value)} aria-label={filter.label}>
              <option>{filter.allLabel || "All"}</option>
              {filter.options.map((option) => <option key={option}>{option}</option>)}
            </Select>
          ))}
          <Button variant="secondary" onClick={resetControls}>Reset</Button>
          {action ? <div className="flex md:justify-end">{action}</div> : null}
        </div>
        )}
      </div>
      ) : null}
      <div className={cn("overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", wrapperClassName)}>
        <table className={cn("w-full text-left text-body", tableClassName)}>
          <thead className="sticky top-0 z-10 bg-slate-200/95 text-body font-bold uppercase tracking-[0.14em] text-slate-900 shadow-[0_2px_10px_rgba(15,23,42,0.1)] backdrop-blur dark:bg-slate-800/95 dark:text-white dark:shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("whitespace-nowrap px-5 py-4 font-bold", column.className)}>
                  {column.sortable ? (
                    <button type="button" onClick={() => toggleSort(column)} className="inline-flex items-center gap-1 rounded-sm transition hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:hover:text-white">
                      {column.header}
                      {sort?.key === column.key ? sort.direction === "asc" ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" /> : <ChevronDown className="size-3.5 opacity-30" />}
                    </button>
                  ) : column.header}
                </th>
              ))}
              {hasActions ? <th className="whitespace-nowrap px-5 py-4 text-center font-bold">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pageItems.map((row, rowIndex) => (
              <AdminTableRow key={row.id || row.productId || row.key || rowIndex} zebra={zebra} index={rowIndex}>
                {columns.map((column) => <AdminTableCell key={column.key} className={column.cellClassName}>{column.render ? column.render(row) : getColumnValue(column, row)}</AdminTableCell>)}
                {hasActions ? <AdminTableCell className="text-center"><AdminTableActions actions={rowActions(row)} label={`Actions for ${row.name || row.productName || row.id || "row"}`} /></AdminTableCell> : null}
              </AdminTableRow>
            ))}
            {!pageItems.length ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-5 py-12 text-center text-body font-regular text-slate-500 dark:text-slate-400">No results match your filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {!hidePagination ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-body sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="font-regular text-slate-600 dark:text-slate-300">Showing {showingStart}-{showingEnd} of {sortedData.length} results</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" />Previous</Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Button key={pageNumber} variant={pageNumber === safePage ? "primary" : "outline"} size="sm" onClick={() => setPage(pageNumber)} aria-current={pageNumber === safePage ? "page" : undefined}>{pageNumber}</Button>
            ))}
            <Button variant="secondary" size="sm" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next<ChevronRight className="size-4" /></Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export function AdminTableRow({ children, zebra = true, index = 0 }) {
  return <tr className={cn("transition hover:bg-blue-50/70 dark:hover:bg-slate-950/80", zebra && index % 2 === 1 && "bg-slate-50/55 dark:bg-slate-950/35")}>{children}</tr>;
}

export function AdminTableCell({ children, className }) {
  return <td className={cn("whitespace-nowrap px-5 py-4 align-middle text-body font-regular text-slate-700 dark:text-slate-300", className)}>{children}</td>;
}

export function AdminTableActions({ actions, label = "Row actions" }) {
  if (!actions?.length) return null;

  if (actions.length === 1) {
    const action = actions[0];
    const Icon = action.icon || Eye;
    const className = "inline-grid size-9 place-items-center rounded-sm text-slate-900 transition hover:bg-slate-100 hover:text-blue-700 dark:text-white dark:hover:bg-slate-800 dark:hover:text-blue-300";
    if (action.href) {
      return <Link href={action.href} aria-label={action.label} title={action.label} className={className}><Icon className="size-4" /></Link>;
    }
    return <button type="button" onClick={action.onClick} aria-label={action.label} title={action.label} className={className}><Icon className="size-4" /></button>;
  }

  return (
    <div className="relative inline-block text-left">
      <details className="group">
        <summary className="inline-grid size-9 cursor-pointer list-none place-items-center rounded-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 group-open:bg-slate-100 group-open:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:group-open:bg-slate-800 dark:group-open:text-white" aria-label={label}>
          <MoreVertical className="size-4" />
        </summary>
        <div className="absolute right-0 z-30 mt-2 w-36 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
          {actions.map((action) => action.href ? (
            <Link key={action.label} href={action.href} className={cn("block px-4 py-2 text-left text-body font-regular text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800", action.tone === "danger" && "text-rose-600 dark:text-rose-300")}>{action.label}</Link>
          ) : (
            <button key={action.label} type="button" onClick={action.onClick} className={cn("block w-full px-4 py-2 text-left text-body font-regular text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800", action.tone === "danger" && "text-rose-600 dark:text-rose-300")}>{action.label}</button>
          ))}
        </div>
      </details>
    </div>
  );
}

function getColumnValue(column, row) {
  return typeof column.accessor === "function" ? column.accessor(row) : row[column.accessor || column.key];
}

function getSortValue(column, row) {
  return typeof column.sortValue === "function" ? column.sortValue(row) : getColumnValue(column, row);
}

function getSearchValues(row, columns, searchKeys) {
  if (searchKeys?.length) return searchKeys.map((key) => typeof key === "function" ? key(row) : row[key]);
  return columns.map((column) => getColumnValue(column, row));
}

function compareValues(a, b, direction) {
  const modifier = direction === "asc" ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * modifier;
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" }) * modifier;
}
