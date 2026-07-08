export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="6" width="38" height="36" rx="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <rect x="9" y="10" width="30" height="28" rx="4" stroke="currentColor" strokeWidth="2.2" fill="none"/>
      <circle cx="24" cy="23" r="2" fill="currentColor"/>
      <path d="M9 28l8-7 6 5 7-6 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}