'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-2.5 border rounded-xl text-gray-800 placeholder:text-gray-400 
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
            transition-all bg-white
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-default
            ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'} 
            ${icon ? 'pl-10' : ''} 
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = '' }, ref) => {
  return (
    <div ref={ref} className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'secondary';
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    secondary: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-gray-100 ${className}`} />;
}

// ─── IconCircle ───────────────────────────────────────────────────────────────

interface IconCircleProps {
  children: React.ReactNode;
  color?: string;  // full tailwind bg class e.g. 'bg-emerald-100'
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IconCircle({ children, color = 'bg-emerald-100', size = 'md', className = '' }: IconCircleProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  return (
    <div className={`${sizeClasses[size]} ${color} rounded-full flex items-center justify-center flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
        {icon}
      </div>
      <p className="font-medium text-gray-500">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    </div>
  );
}
