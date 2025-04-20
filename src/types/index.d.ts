/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// For Tailwind CSS
declare module 'tailwind-merge' {
  export function twMerge(...classLists: string[]): string;
}

declare module 'class-variance-authority' {
  export type VariantProps<T extends (...args: any) => any> = Parameters<T>[0];
  export function cva(base: string, config?: any): any;
} 