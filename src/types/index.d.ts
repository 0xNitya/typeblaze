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

// For Badge component
declare module '@/components/ui/badge' {
  import { VariantProps } from 'class-variance-authority';
  
  const badgeVariants: (props?: any) => string;
  
  export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
      VariantProps<typeof badgeVariants> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
  
  export function Badge(props: BadgeProps): JSX.Element;
}

// For Tailwind CSS
declare module 'tailwind-merge' {
  export function twMerge(...classLists: string[]): string;
}

declare module 'class-variance-authority' {
  export type VariantProps<T extends (...args: any) => any> = Parameters<T>[0];
  export function cva(base: string, config?: any): any;
} 