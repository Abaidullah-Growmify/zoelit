"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Eye, MoreVertical, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Card, Input, Select } from "@/components/ui";
import Pagination from "@/components/pagination";
import { cn } from "@/lib/utils";
import { TransparentActionLoader } from "@/components/action-feedback";

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
  inlineToolbar = true,
  resetButtonClassName,
  searchWrapperClassName,
  filterClassName,
  filterWrapperClassName,
  toolbarInHeader = false,
  secondaryToolbar,
  hideReset = false,
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

  return <AdminDataTable columns={columns} data={data} filters={filters} searchPlaceholder={searchPlaceholder} searchKeys={searchKeys} rowActions={rowActions} title={title} description={description} toolbar={toolbar} action={action} pageSize={pageSize} zebra={zebra} hideSearch={hideSearch} hidePagination={hidePagination} disableInitialSort={disableInitialSort} page={controlledPage} onPageChange={onPageChange} onPaginationChange={onPaginationChange} totalPages={controlledTotalPages} totalItems={controlledTotalItems} className={className} wrapperClassName={wrapperClassName} tableClassName={tableClassName} inlineToolbar={inlineToolbar} resetButtonClassName={resetButtonClassName} searchWrapperClassName={searchWrapperClassName} filterClassName={filterClassName} filterWrapperClassName={filterWrapperClassName} toolbarInHeader={toolbarInHeader} secondaryToolbar={secondaryToolbar} hideReset={hideReset} />;
}

function AdminDataTable({ columns, data, filters, searchPlaceholder, searchKeys, rowActions, title, description, toolbar, action, pageSize, zebra, hideSearch, hidePagination, disableInitialSort, page: controlledPage, onPageChange, onPaginationChange, totalPages: controlledTotalPages, totalItems: controlledTotalItems, className, wrapperClassName, tableClassName, inlineToolbar, resetButtonClassName, searchWrapperClassName, filterClassName, filterWrapperClassName, toolbarInHeader, secondaryToolbar, hideReset }) {
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
  const hasToolbar = !!toolbar || !hideSearch || filters.length > 0 || (!!action && !inlineToolbar);
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

  const tableControls = (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
      {toolbar}
      {!hideSearch ? (
        <div className={cn("relative min-w-[16rem] flex-1 shrink-0 sm:max-w-md lg:max-w-xl", searchWrapperClassName)}>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <Input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="h-10 pl-10 shadow-sm" />
        </div>
      ) : null}
      {filters.map((filter) => (
        <div key={filter.key} className={filterWrapperClassName}>
          <Select value={filterValues[filter.key]} onChange={(event) => updateFilter(filter.key, event.target.value)} aria-label={filter.label} className={cn("h-10 shadow-sm", filterClassName)}>
            <option>{filter.allLabel || "All"}</option>
            {filter.options.map((option) => <option key={option}>{option}</option>)}
          </Select>
        </div>
      ))}
      {filters.length > 0 && !hideReset ? <Button variant="secondary" size="sm" onClick={resetControls} className={cn("h-10 shrink-0 shadow-sm", resetButtonClassName)}>Reset</Button> : null}
    </div>
  );

  return (
    <Card className={cn("overflow-hidden p-0 shadow-sm", className)}>
      {title || description ? (
        <div className="border-b border-outline-variant/70 px-5 py-4">
            <div className={cn("flex gap-4", inlineToolbar ? "flex-col lg:flex-row lg:items-center lg:justify-between" : "")}> 
            {title || description ? (
            <div className="mb-0">
              <div>
                 {title ? <h2 className="font-heading text-lg font-bold tracking-tight text-on-surface">{title}</h2> : null}
                {description ? <p className="mt-1 text-sm text-on-surface-variant">{description}</p> : null}
              </div>
            </div>
            ) : null}
            {toolbarInHeader ? <div className="w-full shrink-0 lg:w-auto">{tableControls}</div> : inlineToolbar && action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </div>
      ) : null}
      {hasToolbar && !toolbarInHeader ? (
        <div className="border-b border-outline-variant/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {tableControls}
            {action && !inlineToolbar ? <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">{action}</div> : null}
          </div>
        </div>
      ) : null}
      {secondaryToolbar ? <div className="flex justify-start border-b border-outline-variant/70 px-4 py-3">{secondaryToolbar}</div> : null}
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
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [loadingLabel, setLoadingLabel] = useState("");

  function runAction(action) {
    if (action.disabled) return;
    setLoadingLabel(action.loadingLabel || `${action.label}...`);
    const result = action.onClick?.();
    if (result?.finally) result.finally(() => setLoadingLabel(""));
    else window.setTimeout(() => setLoadingLabel(""), 350);
  }

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!triggerRef.current || triggerRef.current.contains(event.target)) return;
      if (event.target.closest?.("[data-row-actions-menu]")) return;
      setOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    function closeOnScroll() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, []);

  if (!actions?.length) return null;

  function handleToggle() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 176;
    const gap = 6;
    const menuHeight = actions.length * 44 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= menuHeight + gap
      ? rect.bottom + gap
      : Math.max(8, rect.bottom - menuHeight - gap);
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    setAnchor({ top, left });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setAnchor(null);
  }

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          className={`inline-grid size-8 cursor-pointer place-items-center rounded-lg border transition ${open ? "border-primary text-primary" : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40 hover:text-primary"}`}
          aria-label={label}
          aria-expanded={open}
        >
          <MoreVertical className="size-4" />
        </button>
      </div>
      {open && anchor && typeof document !== "undefined"
        ? createPortal(
            <div data-row-actions-menu style={{ position: "fixed", top: anchor.top, left: anchor.left, zIndex: 100 }} className="w-44 overflow-hidden rounded-lg border border-outline-variant bg-surface py-1 shadow-xl">
              {actions.map((action) => {
                const Icon = action.icon || Eye;
                const isDisabled = Boolean(action.disabled);
                const baseClassName = isDisabled
                  ? "flex w-full cursor-not-allowed items-center gap-2 px-4 py-2.5 text-left text-label-md font-normal text-on-surface-variant/60"
                  : cn("flex w-full items-center gap-2 px-4 py-2.5 text-left text-label-md font-normal text-on-surface-variant transition hover:bg-surface-container-low", action.tone === "danger" && "text-error");
                const content = (
                  <>
                    <Icon className={isDisabled ? "size-4 opacity-60" : "size-4"} />
                    {action.label}
                  </>
                );
                if (!isDisabled && action.href) {
                  return (
                    <Link key={action.label} href={action.href} onClick={() => { handleClose(); setLoadingLabel(action.loadingLabel || `${action.label}...`); }} aria-label={action.ariaLabel || action.label} title={action.ariaLabel || action.label} className={baseClassName}>
                      {content}
                    </Link>
                  );
                }
                return (
                  <button key={action.label} type="button" disabled={isDisabled} onClick={() => { handleClose(); runAction(action); }} aria-label={action.ariaLabel || action.label} aria-disabled={isDisabled || undefined} title={isDisabled ? (action.disabledTitle || `${action.label} is not available`) : (action.ariaLabel || action.label)} className={baseClassName}>
                    {content}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
      <TransparentActionLoader open={Boolean(loadingLabel)} label={loadingLabel} />
    </>
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
