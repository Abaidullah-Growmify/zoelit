import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export function AdminTable({ columns, children, className, wrapperClassName, tableClassName }) {
  return (
    <Card className={cn("overflow-hidden p-0", className)}>
      <div className={cn("overflow-x-auto", wrapperClassName)}>
        <table className={cn("w-full text-left text-sm", tableClassName)}>
          <thead className="bg-slate-50/90 text-xs uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-950/80 dark:text-slate-400">
            <tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-5 py-4 font-bold">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
        </table>
      </div>
    </Card>
  );
}

export function AdminTableRow({ children }) {
  return <tr className="transition hover:bg-blue-50/40 dark:hover:bg-slate-950/70">{children}</tr>;
}

export function AdminTableCell({ children, className }) {
  return <td className={cn("whitespace-nowrap px-5 py-4 align-middle text-slate-700 dark:text-slate-300", className)}>{children}</td>;
}
