"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Eye, MoreVertical, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select } from "@/components/ui";
import Pagination from "@/components/pagination";
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
  toolbar,
  action,
  pageSize = DEFAULT_PAGE_SIZE,
  zebra = true,
  hideSearch = false,
  hidePagination = false,
  disableInitialSort = false,
  page: controlledPage,
  onPageChange,
  onPaginationChange,
  totalPages: controlledTotalPages,
  totalItems: controlledTotalItems,
  className,
  wrapperClassName,
  tableClassName,
}) {
  if (!data) {
    return (
      <Card className={cn("overflow-hidden p-0 shadow-sm", className)}>
        <div className={cn("overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", wrapperClassName)}>
            <table className={cn("w-full text-left text-label-md", tableClassName)}>
            <thead className="sticky top-0 z-10 border-b border-outline-variant/70 bg-surface/95 text-xs font-medium text-on-surface-variant backdrop-blur">
              <tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">{column}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">{children}</tbody>
          </table>
        </div>
      </Card>
    );
  }

  return <AdminDataTable columns={columns} data={data} filters={filters} searchPlaceholder={searchPlaceholder} searchKeys={searchKeys} rowActions={rowActions} title={title} description={description} toolbar={toolbar} action={action} pageSize={pageSize} zebra={zebra} hideSearch={hideSearch} hidePagination={hidePagination} disableInitialSort={disableInitialSort} page={controlledPage} onPageChange={onPageChange} onPaginationChange={onPaginationChange} totalPages={controlledTotalPages} totalItems={controlledTotalItems} className={className} wrapperClassName={wrapperClassName} tableClassName={tableClassName} />;
}

function AdminDataTable({ columns, data, filters, searchPlaceholder, searchKeys, rowActions, title, description, toolbar, action, pageSize, zebra, hideSearch, hidePagination, disableInitialSort, page: controlledPage, onPageChange, onPaginationChange, totalPages: controlledTotalPages, totalItems: controlledTotalItems, className, wrapperClassName, tableClassName }) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState(() => Object.fromEntries(filters.map((filter) => [filter.key, filter.allLabel || "All"])));
  const [sort, setSort] = useState(() => {
    if (disableInitialSort) return null;
    const firstSortable = columns.find((column) => column.sortable);
    return firstSortable ? { key: firstSortable.key, direction: "asc" } : null;
  });
  const [internalPage, setInternalPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const page = controlledPage ?? internalPage;
  const setPage = onPageChange || setInternalPage;

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

  const totalItems = controlledTotalItems ?? sortedData.length;
  const totalPages = controlledTotalPages ?? Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const isServerPaged = controlledTotalPages !== undefined || controlledTotalItems !== undefined;
  const pageStart = sortedData.length ? (safePage - 1) * pageSize : 0;
  const pageItems = isServerPaged ? sortedData : sortedData.slice(pageStart, pageStart + pageSize);
  const showingStart = totalItems ? (safePage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min((safePage - 1) * pageSize + pageItems.length, totalItems);
  const hasActions = typeof rowActions === "function";
  const hasToolbar = !!toolbar || !hideSearch || filters.length > 0 || !!action;
  const columnCount = columns.length + (hasActions ? 1 : 0);

  useEffect(() => {
    if (!onPaginationChange) return;
    onPaginationChange({
      page: safePage,
      totalPages,
      totalItems,
      showingStart,
      showingEnd,
    });
  }, [onPaginationChange, safePage, totalPages, totalItems, showingStart, showingEnd]);

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
      {title || description ? (
        <div className="border-b border-outline-variant/70 px-5 py-4">
          {title || description ? (
            <div className="mb-0">
              <div>
                {title ? <h2 className="font-heading text-lg font-semibold tracking-tight text-on-surface">{title}</h2> : null}
                {description ? <p className="mt-1 text-sm text-on-surface-variant">{description}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {hasToolbar ? (
        <div className="border-b border-outline-variant/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              {toolbar}
              {!hideSearch ? (
                <div className="relative min-w-[16rem] flex-1 shrink-0 sm:max-w-md lg:max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="h-10 pl-10 shadow-sm" />
                </div>
              ) : null}
              {filters.map((filter) => (
                <Select key={filter.key} value={filterValues[filter.key]} onChange={(event) => updateFilter(filter.key, event.target.value)} aria-label={filter.label} className="h-10 shrink-0 shadow-sm">
                  <option>{filter.allLabel || "All"}</option>
                  {filter.options.map((option) => <option key={option}>{option}</option>)}
                </Select>
              ))}
              {filters.length > 0 ? <Button variant="secondary" size="sm" onClick={resetControls} className="h-10 shrink-0 shadow-sm">Reset</Button> : null}
            </div>
            {action ? <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">{action}</div> : null}
          </div>
        </div>
      ) : null}
      <div className={cn("overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", wrapperClassName)}>
        <table className={cn("w-full text-left text-label-md", tableClassName)}>
          <thead className="sticky top-0 z-10 border-b border-outline-variant/70 bg-surface-container-low/60 text-xs font-medium text-on-surface-variant backdrop-blur">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("whitespace-nowrap px-4 py-3 text-xs font-medium", column.className)}>
                  {column.sortable ? (
                     <button type="button" onClick={() => toggleSort(column)} className="inline-flex items-center gap-1.5 rounded-lg transition hover:text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10">
                      {column.header}
                      {sort?.key === column.key ? sort.direction === "asc" ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" /> : <ChevronDown className="size-3.5 opacity-30" />}
                    </button>
                  ) : column.header}
                </th>
              ))}
                {hasActions ? <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 dark:divide-outline-variant/40">
            {pageItems.map((row, rowIndex) => (
              <AdminTableRow key={row.id || row.productId || row.key || rowIndex} zebra={zebra} index={rowIndex}>
                {columns.map((column) => <AdminTableCell key={column.key} className={column.cellClassName}>{column.render ? column.render(row) : getColumnValue(column, row)}</AdminTableCell>)}
                {hasActions ? <AdminTableCell className="text-center"><AdminTableActions actions={rowActions(row)} label={`Actions for ${row.name || row.productName || row.id || "row"}`} /></AdminTableCell> : null}
              </AdminTableRow>
            ))}
            {!pageItems.length ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-12 text-center text-sm text-on-surface-variant">No results match your filters.</td>
              </tr>
            ) : null}
          </tbody>
          {!hidePagination ? (
            <tfoot>
              <tr>
                <th colSpan={columnCount} className="border-t border-outline-variant/70 bg-surface/60 px-4 py-3 text-sm font-normal normal-case tracking-normal">
                  <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-on-surface-variant">Showing {showingStart}-{showingEnd} of {totalItems} results</p>
                    <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
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

export function AdminTableRow({ children, zebra = true, index = 0 }) {
  return <tr className={cn("transition-colors hover:bg-surface-container-low/80", zebra && index % 2 === 1 && "bg-surface-container-low/40")}>{children}</tr>;
}

export function AdminTableCell({ children, className }) {
  return <td className={cn("whitespace-nowrap px-4 py-3.5 align-middle text-sm text-on-surface-variant", className)}>{children}</td>;
}

export function AdminTableActions({ actions, label = "Row actions" }) {
  if (!actions?.length) return null;

  if (actions.length === 1) {
    const action = actions[0];
    const Icon = action.icon || Eye;
    const className = "inline-grid size-8 place-items-center rounded-lg border border-outline-variant bg-surface text-on-surface-variant transition hover:border-primary/40 hover:text-primary";
    if (action.href) {
      return <Link href={action.href} aria-label={action.label} title={action.label} className={className}><Icon className="size-4" /></Link>;
    }
    return <button type="button" onClick={action.onClick} aria-label={action.label} title={action.label} className={className}><Icon className="size-4" /></button>;
  }

  if (actions.length === 2) {
    return (
      <div className="inline-flex items-center gap-2">
        {actions.map((action) => {
          const Icon = action.icon || Eye;
          const className = "inline-grid size-8 place-items-center rounded-lg border border-outline-variant bg-surface text-on-surface-variant transition hover:border-primary/40 hover:text-primary";
          return action.href ? (
            <Link key={action.label} href={action.href} aria-label={action.label} title={action.label} className={className}><Icon className="size-4" /></Link>
          ) : (
            <button key={action.label} type="button" onClick={action.onClick} aria-label={action.label} title={action.label} className={className}><Icon className="size-4" /></button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <details className="group">
        <summary className="inline-grid size-8 cursor-pointer list-none place-items-center rounded-lg border border-outline-variant bg-surface text-on-surface-variant transition hover:border-primary/40 hover:text-primary group-open:border-primary group-open:text-primary" aria-label={label}>
          <MoreVertical className="size-4" />
        </summary>
        <div className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-lg border border-outline-variant bg-surface py-1 shadow-xl">
          {actions.map((action) => action.href ? (
            <Link key={action.label} href={action.href} className={cn("block px-4 py-2.5 text-left text-label-md font-normal text-on-surface-variant transition hover:bg-surface-container-low", action.tone === "danger" && "text-error")}>{action.label}</Link>
          ) : (
            <button key={action.label} type="button" onClick={action.onClick} className={cn("block w-full px-4 py-2.5 text-left text-label-md font-normal text-on-surface-variant transition hover:bg-surface-container-low", action.tone === "danger" && "text-error")}>{action.label}</button>
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
