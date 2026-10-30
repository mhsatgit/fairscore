import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

type GlassTier = 'chrome' | 'panel' | 'elevated' | 'liquid'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tier?: GlassTier
  interactive?: boolean
}

export function GlassSurface({
  tier = 'panel',
  interactive = false,
  className,
  ...props
}: GlassSurfaceProps) {
  return (
    <div
      className={cx(`glass-${tier}`, interactive && 'glass-interactive', className)}
      {...props}
    />
  )
}

export function GlassCard(props: GlassSurfaceProps) {
  return <GlassSurface {...props} tier={props.tier ?? 'panel'} />
}

interface StatCardProps extends GlassSurfaceProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
}

export function StatCard({ label, value, hint, icon, className, ...props }: StatCardProps) {
  return (
    <GlassSurface className={cx('stat-card', className)} interactive {...props}>
      <div className="stat-card__row">
        <div>
          <p className="stat-card__label">{label}</p>
          <p className="stat-card__value">{value}</p>
        </div>
        {icon && <span className="icon-well" aria-hidden="true">{icon}</span>}
      </div>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </GlassSurface>
  )
}

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

export function GlassButton({
  variant = 'secondary',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={cx(`btn-${variant}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? 'Working…' : children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button className={cx('icon-button', className)} aria-label={label} title={label} {...props}>
      {children}
    </button>
  )
}

interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'positive' | 'warning' | 'risk' | 'info' | 'neutral'
  showDot?: boolean
}

export function StatusPill({
  tone = 'neutral',
  showDot = true,
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <span className={cx('status-pill', `status-pill--${tone}`, className)} {...props}>
      {showDot && <span className="status-pill__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}

export function GlassInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx('input', className)} {...props} />
}

export function GlassSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx('select', className)} {...props} />
}

export function GlassTable({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('glass-table', className)} {...props} />
}

interface StateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action, className, ...props }: StateProps) {
  return (
    <div className={cx('empty-state', className)} {...props}>
      {icon && <span className="empty-state__icon" aria-hidden="true">{icon}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}

export function ErrorState(props: StateProps) {
  return <EmptyState role="alert" {...props} className={cx('error-state', props.className)} />
}

export function LoadingSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('loading-skeleton', className)} aria-hidden="true" {...props} />
}

interface HeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  action?: ReactNode
}

export function PageHeader({ title, description, eyebrow, action, className, ...props }: HeadingProps) {
  return (
    <div className={cx('page-heading', className)} {...props}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </div>
  )
}

export function SectionHeader({ title, description, action, className, ...props }: HeadingProps) {
  return (
    <div className={cx('section-heading', className)} {...props}>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ChartContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('chart-container', className)} {...props} />
}
