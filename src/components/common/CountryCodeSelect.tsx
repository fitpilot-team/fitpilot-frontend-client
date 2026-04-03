import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  getPhoneCountryCompactLabel,
  getPhoneCountryOption,
  getPhoneCountryOptions,
  getPhoneCountrySearchTerms,
  type PhoneCountryOption,
} from '@/constants/phoneCountries'
import { matchesAnyNormalizedQuery } from '@/utils/search'

interface CountryCodeSelectProps {
  disabled?: boolean
  emptyMessage: string
  id: string
  label: string
  locale?: string
  placeholder: string
  searchPlaceholder: string
  value: string
  onChange: (country: PhoneCountryOption) => void
}

function usePopoverVerticalPlacement(
  isOpen: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  popoverRef: React.RefObject<HTMLDivElement | null>,
) {
  const [openUpward, setOpenUpward] = useState(false)

  useLayoutEffect(() => {
    if (!isOpen) return

    let rafId = 0

    const recalculate = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect()
      const popoverRect = popoverRef.current?.getBoundingClientRect()
      if (!anchorRect || !popoverRect) return

      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - anchorRect.bottom
      const spaceAbove = anchorRect.top
      const neededHeight = popoverRect.height + 12

      setOpenUpward(spaceBelow < neededHeight && spaceAbove > spaceBelow)
    }

    const scheduleRecalculate = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(recalculate)
    }

    scheduleRecalculate()
    window.addEventListener('resize', scheduleRecalculate)
    window.addEventListener('scroll', scheduleRecalculate, true)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', scheduleRecalculate)
      window.removeEventListener('scroll', scheduleRecalculate, true)
    }
  }, [anchorRef, isOpen, popoverRef])

  return openUpward
}

export function CountryCodeSelect({
  disabled = false,
  emptyMessage,
  id,
  label,
  locale,
  placeholder,
  searchPlaceholder,
  value,
  onChange,
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const openUpward = usePopoverVerticalPlacement(isOpen, triggerRef, popoverRef)

  const countries = useMemo(() => getPhoneCountryOptions(locale), [locale])
  const selectedCountry = useMemo(() => getPhoneCountryOption(value, locale), [locale, value])
  const filteredCountries = useMemo(
    () =>
      countries.filter((country) =>
        matchesAnyNormalizedQuery(getPhoneCountrySearchTerms(country.code, locale), query, {
          ignoreSpaces: true,
          ignoreSpecialCharacters: true,
        }),
      ),
    [countries, locale, query],
  )

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false)
    }
  }, [disabled, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [isOpen])

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  const listPositionClass = openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
  const selectedLabel = selectedCountry
    ? getPhoneCountryCompactLabel(selectedCountry)
    : placeholder

  return (
    <div className="space-y-2" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-semibold text-gray-900 block">
        {label}
      </label>

      <div className="relative">
        <button
          id={id}
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          onKeyDown={handleTriggerKeyDown}
          className="flex w-full items-center justify-between rounded-2xl bg-gray-50 px-3 py-3.5 text-left text-sm text-gray-900 ring-1 ring-inset ring-gray-200 transition-all hover:bg-white hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{selectedLabel}</span>
          <span className="ml-3 text-gray-400">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            className={`absolute left-0 z-30 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-slate-200/80 ${listPositionClass}`}
          >
            <div className="border-b border-gray-100 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2" role="listbox" aria-labelledby={id}>
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-3 text-sm text-gray-500">{emptyMessage}</div>
              ) : (
                filteredCountries.map((country) => {
                  const selected = country.code === selectedCountry.code
                  return (
                    <button
                      key={country.code}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(country)
                        setIsOpen(false)
                        setQuery('')
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                        selected ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base">{country.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{country.name}</div>
                        <div className="text-xs text-gray-500">{country.dialCode}</div>
                      </div>
                      {selected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
