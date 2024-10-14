"use client";

import { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  className?: string;
};

export const Button = ({ children, className }: ButtonProps) => {
  return (
    <button className={className} onClick={() => console.log("hello from app")}>
      {children}
    </button>
  );
};
