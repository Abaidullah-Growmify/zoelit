"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export function FAQAccordion({ faqs }) {
  const [openQuestion, setOpenQuestion] = useState(faqs[0]?.question ?? "");

  return (
    <div className="mx-auto mt-10 grid max-w-4xl gap-4">
      {faqs.map((item) => {
        const isOpen = openQuestion === item.question;

        return (
          <Card key={item.question} className="p-0 shadow-none transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5 dark:hover:border-blue-500/30">
            <button
              type="button"
              className="flex w-full items-center gap-4 p-6 text-left"
              onClick={() => setOpenQuestion(isOpen ? "" : item.question)}
              aria-expanded={isOpen}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10"><HelpCircle className="size-5" /></span>
              <span className="flex-1 font-bold text-slate-950 dark:text-white">{item.question}</span>
              <ChevronDown className={cn("size-5 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </button>
            <div className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
              <div className="overflow-hidden">
                <p className={cn("px-6 pb-6 pl-20 leading-7 text-slate-600 transition-transform duration-300 ease-out dark:text-slate-300", isOpen ? "translate-y-0" : "-translate-y-2")}>{item.answer}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
