"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export function FAQAccordion({ faqs }) {
  const [openQuestion, setOpenQuestion] = useState(faqs[0]?.question ?? "");

  return (
    <div className="mt-6 grid w-full gap-3 sm:mt-8 sm:gap-4">
      {faqs.map((item) => {
        const isOpen = openQuestion === item.question;

        return (
          <Card key={item.question} className="overflow-hidden rounded-2xl border-outline-variant/70 p-0 shadow-sm transition hover:border-primary/30 hover:shadow-md">
            <button
              type="button"
              className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
              onClick={() => setOpenQuestion(isOpen ? "" : item.question)}
              aria-expanded={isOpen}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><HelpCircle className="size-5" /></span>
              <span className="flex-1 font-heading text-base font-semibold text-on-surface sm:text-lg">{item.question}</span>
              <ChevronDown className={cn("size-5 shrink-0 text-on-surface-variant transition-transform", isOpen && "rotate-180")} />
            </button>
            <div className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
              <div className="overflow-hidden">
                <p className={cn("px-5 pb-5 pl-[4.5rem] text-sm leading-7 text-on-surface-variant transition-transform duration-300 ease-out sm:px-6 sm:pb-6 sm:pl-20", isOpen ? "translate-y-0" : "-translate-y-2")}>{item.answer}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
