import { cn } from '@/lib/utils';
import Link from 'next/link';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>}
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="accent">{action.label}</Button>
          </Link>
        ) : (
          <Button variant="accent" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
