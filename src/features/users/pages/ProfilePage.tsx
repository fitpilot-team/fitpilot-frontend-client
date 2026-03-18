import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useSessionsQuery, useRevokeSessionMutation, useLogoutAllSessionsMutation } from '@/features/auth/services/auth.queries'
import type { AuthSession, User as AuthUser } from '@/features/auth/services/auth.service'
import { useUpdateProfile, useUpdateProfilePicture, useUserByIdQuery } from '../services/users.queries'
import type { UpdateUserByIdPayload } from '../services/users.service'
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Camera,
  ImagePlus,
  Move,
  ZoomIn,
  RefreshCcw,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Shield,
  Monitor,
  Globe,
  Clock3,
  Trash2,
  RefreshCw,
} from 'lucide-react'

const MAX_AVATAR_BYTES = 1024 * 1024 // 1MB
const AVATAR_EDITOR_VIEWPORT = 320
const AVATAR_OUTPUT_SIZES = [512, 448, 384, 320] as const
const AVATAR_OUTPUT_QUALITIES = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5] as const

type ProfileFormData = {
  name: string
  lastname: string
  phone_number: string
  email: string
  username: string
  password: string
  genre: string
  date_of_birth: string
}

type FlashMessage = { type: 'success' | 'error'; text: string } | null

type AvatarDraft = {
  file: File
  blob: Blob
  previewUrl: string
  sizeBytes: number
}

type AvatarEditorImage = {
  file: File
  objectUrl: string
  naturalWidth: number
  naturalHeight: number
}

type AvatarCropState = {
  x: number
  y: number
  zoom: number
}

type ProfileTab = 'info' | 'sessions'

type ProfileSourceUser = AuthUser & {
  genre?: string | null
  date_of_birth?: string | null
  professional_id?: number | null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function bytesToReadable(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return ''
  return value.slice(0, 10)
}

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

const GENRE_OPTIONS = [
  { value: 'woman', label: 'Femenino' },
  { value: 'man', label: 'Masculino' },
  { value: 'non_binary', label: 'No binario' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decirlo' },
] as const

function parseDateInputValue(dateValue: string) {
  if (!dateValue) return null
  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function formatDatePrettyEs(dateValue: string) {
  const date = parseDateInputValue(dateValue)
  if (!date) return ''
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function buildIsoDateFromParts(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function toIsoDateTimeString(dateValue: string) {
  if (!dateValue) return ''
  return `${dateValue}T00:00:00.000Z`
}

function formatSessionDateTime(dateValue: string) {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateValue))
  } catch {
    return dateValue
  }
}

function getSessionStatus(session: AuthSession) {
  if (session.is_revoked) return { label: 'Revocada', className: 'bg-rose-50 text-rose-700 border-rose-200' }
  const expiresAt = new Date(session.expires_at).getTime()
  if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
    return { label: 'Expirada', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  return { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
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
  }, [isOpen, anchorRef, popoverRef])

  return openUpward
}

function getInitials(userLike: Partial<AuthUser> | null | undefined) {
  const nameInitial = userLike?.name?.trim()?.[0] ?? ''
  const lastInitial = userLike?.lastname?.trim()?.[0] ?? ''
  const fallback = userLike?.email?.trim()?.[0] ?? 'U'
  return `${nameInitial}${lastInitial}`.trim().toUpperCase() || fallback.toUpperCase()
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada.'))
    img.src = url
  })
}

function getCoverBaseScale(naturalWidth: number, naturalHeight: number, viewportSize: number) {
  return Math.max(viewportSize / naturalWidth, viewportSize / naturalHeight)
}

function clampCropOffsets(
  crop: AvatarCropState,
  image: AvatarEditorImage,
  viewportSize: number,
) {
  const baseScale = getCoverBaseScale(image.naturalWidth, image.naturalHeight, viewportSize)
  const actualScale = baseScale * crop.zoom
  const renderedWidth = image.naturalWidth * actualScale
  const renderedHeight = image.naturalHeight * actualScale
  const limitX = Math.max(0, (renderedWidth - viewportSize) / 2)
  const limitY = Math.max(0, (renderedHeight - viewportSize) / 2)

  return {
    ...crop,
    x: clamp(crop.x, -limitX, limitX),
    y: clamp(crop.y, -limitY, limitY),
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality)
  })

  if (!blob) {
    throw new Error('No se pudo procesar la imagen.')
  }

  return blob
}

async function buildCompressedAvatar(
  image: AvatarEditorImage,
  crop: AvatarCropState,
  originalFilename: string,
): Promise<AvatarDraft> {
  const loadedImage = await loadImage(image.objectUrl)

  let bestBlob: Blob | null = null
  let bestSize = Number.POSITIVE_INFINITY

  for (const outputSize of AVATAR_OUTPUT_SIZES) {
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Tu navegador no soporta edición de imagen en canvas.')
    }

    const baseScale = getCoverBaseScale(image.naturalWidth, image.naturalHeight, AVATAR_EDITOR_VIEWPORT)
    const actualScale = baseScale * crop.zoom
    const exportScale = actualScale * (outputSize / AVATAR_EDITOR_VIEWPORT)
    const offsetX = crop.x * (outputSize / AVATAR_EDITOR_VIEWPORT)
    const offsetY = crop.y * (outputSize / AVATAR_EDITOR_VIEWPORT)
    const drawWidth = loadedImage.naturalWidth * exportScale
    const drawHeight = loadedImage.naturalHeight * exportScale
    const drawX = outputSize / 2 - drawWidth / 2 + offsetX
    const drawY = outputSize / 2 - drawHeight / 2 + offsetY

    ctx.clearRect(0, 0, outputSize, outputSize)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(loadedImage, drawX, drawY, drawWidth, drawHeight)

    for (const quality of AVATAR_OUTPUT_QUALITIES) {
      const blob = await canvasToBlob(canvas, quality)

      if (blob.size < bestSize) {
        bestBlob = blob
        bestSize = blob.size
      }

      if (blob.size <= MAX_AVATAR_BYTES) {
        const safeBaseName = (originalFilename.replace(/\.[^.]+$/, '') || 'avatar').slice(0, 80)
        const file = new File([blob], `${safeBaseName}.jpg`, { type: 'image/jpeg' })
        return {
          file,
          blob,
          previewUrl: URL.createObjectURL(blob),
          sizeBytes: blob.size,
        }
      }
    }
  }

  if (!bestBlob) {
    throw new Error('No fue posible generar una versión optimizada de la foto.')
  }

  throw new Error(
    `No se pudo bajar la imagen a menos de 1MB (mínimo logrado: ${bytesToReadable(bestBlob.size)}).`,
  )
}

type AvatarEditorModalProps = {
  image: AvatarEditorImage | null
  open: boolean
  onClose: () => void
  onApply: (avatar: AvatarDraft) => Promise<void> | void
  onError: (message: string) => void
}

function AvatarEditorModal({ image, open, onClose, onApply, onError }: AvatarEditorModalProps) {
  const [crop, setCrop] = useState<AvatarCropState>({ x: 0, y: 0, zoom: 1 })
  const [isApplying, setIsApplying] = useState(false)
  const dragStart = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null)

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0, zoom: 1 })
      setIsApplying(false)
    }
  }, [open, image?.objectUrl])

  if (!open || !image) return null

  const baseScale = getCoverBaseScale(image.naturalWidth, image.naturalHeight, AVATAR_EDITOR_VIEWPORT)
  const actualScale = baseScale * crop.zoom
  const renderedWidth = image.naturalWidth * actualScale
  const renderedHeight = image.naturalHeight * actualScale
  const maxZoom = 3.5

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      originX: crop.x,
      originY: crop.y,
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStart.current
    if (!drag || drag.pointerId !== e.pointerId) return

    const nextCrop = clampCropOffsets(
      {
        ...crop,
        x: drag.originX + (e.clientX - drag.x),
        y: drag.originY + (e.clientY - drag.y),
      },
      image,
      AVATAR_EDITOR_VIEWPORT,
    )

    setCrop(nextCrop)
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current?.pointerId === e.pointerId) {
      dragStart.current = null
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    }
  }

  const handleZoomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextZoom = Number(e.target.value)
    setCrop((prev) => clampCropOffsets({ ...prev, zoom: nextZoom }, image, AVATAR_EDITOR_VIEWPORT))
  }

  const handleResetPosition = () => {
    setCrop((prev) => ({ ...prev, x: 0, y: 0 }))
  }

  const handleResetAll = () => {
    setCrop({ x: 0, y: 0, zoom: 1 })
  }

  const handleApply = async () => {
    try {
      setIsApplying(true)
      const avatar = await buildCompressedAvatar(image, crop, image.file.name)
      await onApply(avatar)
      onClose()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'No se pudo procesar la foto.')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Editar foto de perfil</h3>
            <p className="text-sm text-gray-500">Ajusta el encuadre y zoom. Se exporta optimizada (&lt; 1MB).</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
          <div className="rounded-2xl border border-gray-200 bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fafc_55%,_#ffffff)] p-5">
            <div
              className="relative mx-auto h-80 w-80 max-w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-inner"
              style={{ touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                src={image.objectUrl}
                alt="Vista previa para recorte"
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: renderedWidth,
                  height: renderedHeight,
                  transform: `translate(calc(-50% + ${crop.x}px), calc(-50% + ${crop.y}px))`,
                }}
              />

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-black/35 [mask-image:radial-gradient(circle_120px_at_center,transparent_0,transparent_115px,black_118px)]" />
                <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.12)]" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Move className="h-3.5 w-3.5" />
                Arrastra para centrar
              </span>
              <span>
                {image.naturalWidth} x {image.naturalHeight}px
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ZoomIn className="h-4 w-4 text-emerald-600" />
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={maxZoom}
                step={0.01}
                value={crop.zoom}
                onChange={handleZoomChange}
                className="w-full accent-emerald-600"
              />
              <div className="mt-1 text-xs text-gray-500">{crop.zoom.toFixed(2)}x</div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-gray-700">Acciones rápidas</div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleResetPosition}
                  className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Move className="h-4 w-4" />
                  Centrar
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Restaurar
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Aplicar foto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

type ProfileDatePickerFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

type DateFlowStep = 'day' | 'month' | 'year'

function ProfileDatePickerField({ id, label, value, onChange, disabled = false }: ProfileDatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<DateFlowStep>('day')
  const [draftDay, setDraftDay] = useState<number | null>(null)
  const [draftMonth, setDraftMonth] = useState<number | null>(null)
  const [draftYear, setDraftYear] = useState<number | null>(null)
  const [yearPageStart, setYearPageStart] = useState<number>(() => {
    const nowYear = new Date().getFullYear()
    return nowYear - (nowYear % 12)
  })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const openUpward = usePopoverVerticalPlacement(isOpen, triggerRef, popoverRef)

  const syncDraftFromValue = (dateValue: string) => {
    const parsed = parseDateInputValue(dateValue)
    const fallback = new Date()
    const base = parsed ?? fallback

    setDraftDay(parsed ? parsed.getDate() : null)
    setDraftMonth(parsed ? parsed.getMonth() : fallback.getMonth())
    setDraftYear(parsed ? parsed.getFullYear() : fallback.getFullYear())

    const baseYear = base.getFullYear()
    setYearPageStart(baseYear - (baseYear % 12))
    setStep('day')
  }

  useEffect(() => {
    if (!isOpen) return
    syncDraftFromValue(value)
  }, [isOpen, value])

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const resolvedMonth = draftMonth ?? new Date().getMonth()
  const resolvedYear = draftYear ?? new Date().getFullYear()
  const maxDayForDraft = getDaysInMonth(resolvedYear, resolvedMonth)
  const validDraftDay = draftDay ? Math.min(draftDay, maxDayForDraft) : null
  const yearOptions = Array.from({ length: 12 }, (_, idx) => yearPageStart + idx)

  const handlePickDay = (day: number) => {
    setDraftDay(day)
    setStep('month')
  }

  const handlePickMonth = (monthIndex: number) => {
    setDraftMonth(monthIndex)
    if (draftYear && draftDay) {
      const maxDays = getDaysInMonth(draftYear, monthIndex)
      if (draftDay > maxDays) {
        setDraftDay(maxDays)
      }
    }
    setStep('year')
  }

  const handlePickYear = (year: number) => {
    setDraftYear(year)
    if (draftMonth !== null && draftDay) {
      const maxDays = getDaysInMonth(year, draftMonth)
      if (draftDay > maxDays) {
        setDraftDay(maxDays)
      }
    }
  }

  const canConfirm = validDraftDay !== null && draftMonth !== null && draftYear !== null

  const handleConfirm = () => {
    if (!canConfirm) return
    onChange(buildIsoDateFromParts(draftYear, draftMonth, validDraftDay))
    setIsOpen(false)
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-semibold text-gray-700 ml-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          id={id}
          ref={triggerRef}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm transition hover:border-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Fecha</div>
            <div className={`truncate font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>
              {value ? formatDatePrettyEs(value) : 'Selecciona una fecha'}
            </div>
          </div>
          <span className="ml-3 flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
            <Calendar className="h-4 w-4 text-blue-600" />
          </span>
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            className={`absolute left-0 z-30 w-[min(360px,calc(100vw-2rem))] max-h-[min(78vh,560px)] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl ${
              openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-blue-700">Fecha de nacimiento</div>
              <div className="mt-1 text-sm text-blue-700">Selecciona día, mes y año</div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-1">
              <div className="grid grid-cols-3 gap-1">
                {([
                  ['day', 'Dia'],
                  ['month', 'Mes'],
                  ['year', 'Año'],
                ] as const).map(([stepKey, labelText]) => (
                  <button
                    key={stepKey}
                    type="button"
                    onClick={() => setStep(stepKey)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      step === stepKey ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {labelText}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-3 text-xs text-gray-600">
              <span className="font-semibold text-gray-500">Flujo</span>{' '}
              <span>
                Dia: <strong className="text-blue-600">{validDraftDay ?? '--'}</strong> · Mes:{' '}
                <strong className="text-blue-600">
                  {draftMonth !== null ? MONTHS_ES[draftMonth] : '--'}
                </strong>{' '}
                · Año: <strong className="text-blue-600">{draftYear ?? '--'}</strong>
              </span>
            </div>

            {step === 'day' && (
              <div className="mt-4">
                <div className="mb-2 text-sm font-semibold text-gray-800">Selecciona el día</div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, idx) => idx + 1).map((day) => {
                    const disabledDay = day > maxDayForDraft
                    const selected = validDraftDay === day
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => !disabledDay && handlePickDay(day)}
                        disabled={disabledDay}
                        className={`h-10 rounded-xl text-sm font-semibold transition ${
                          selected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                            : disabledDay
                              ? 'cursor-not-allowed text-gray-300'
                              : 'text-gray-700 hover:bg-blue-50'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 'month' && (
              <div className="mt-4">
                <div className="mb-2 text-sm font-semibold text-gray-800">Selecciona el mes</div>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS_ES.map((monthLabel, monthIndex) => {
                    const selected = draftMonth === monthIndex
                    return (
                      <button
                        key={monthLabel}
                        type="button"
                        onClick={() => handlePickMonth(monthIndex)}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
                        }`}
                      >
                        {monthLabel}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 'year' && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800">Selecciona el año</div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setYearPageStart((prev) => prev - 12)}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Años anteriores"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setYearPageStart((prev) => prev + 12)}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Años siguientes"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mb-2 text-xs text-gray-500">
                  {yearOptions[0]} - {yearOptions[yearOptions.length - 1]}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {yearOptions.map((year) => {
                    const selected = draftYear === year
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handlePickYear(year)}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
                        }`}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setDraftDay(null)
                  setDraftMonth(new Date().getMonth())
                  setDraftYear(new Date().getFullYear())
                  setStep('day')
                  onChange('')
                }}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

type GenreComboboxFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function GenreComboboxField({ id, label, value, onChange, disabled = false }: GenreComboboxFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const selectedOption = GENRE_OPTIONS.find((option) => option.value === value) ?? null
  const selectedLabel = selectedOption?.label || (value ? value : '')
  const openUpward = usePopoverVerticalPlacement(isOpen, triggerRef, popoverRef)

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="space-y-2" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-semibold text-gray-700 ml-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          id={id}
          ref={triggerRef}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm transition hover:border-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Género</div>
            <div className={`truncate font-medium ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
              {selectedLabel || 'Selecciona...'}
            </div>
          </div>
          <span className="ml-3 flex h-9 w-12 items-center justify-center gap-1 rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
            <User className="h-4 w-4" />
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            className={`absolute left-0 z-30 w-[min(340px,calc(100vw-2rem))] max-h-[min(70vh,460px)] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl ${
              openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-blue-700">Selecciona género</div>
              <div className="mt-1 text-sm text-blue-700">
                Elige la opción que mejor represente tu perfil.
              </div>
            </div>

            <div className="mt-3 space-y-1" role="listbox" aria-labelledby={id}>
              {GENRE_OPTIONS.map((option) => {
                const selected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                      selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    role="option"
                    aria-selected={selected}
                  >
                    <span>{option.label}</span>
                    {selected && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Listo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const authUserId = user?.id
  const {
    data: userById,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUserByIdQuery(authUserId, isAuthenticated)
  const {
    data: sessions = [],
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useSessionsQuery(isAuthenticated)
  const updateProfileMutation = useUpdateProfile()
  const updateProfilePictureMutation = useUpdateProfilePicture()
  const revokeSessionMutation = useRevokeSessionMutation()
  const logoutAllSessionsMutation = useLogoutAllSessionsMutation()

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    lastname: '',
    phone_number: '',
    email: '',
    username: '',
    password: '',
    genre: '',
    date_of_birth: '',
  })

  const [message, setMessage] = useState<FlashMessage>(null)
  const [sessionsMessage, setSessionsMessage] = useState<FlashMessage>(null)
  const [activeTab, setActiveTab] = useState<ProfileTab>('info')
  const [avatarDraft, setAvatarDraft] = useState<AvatarDraft | null>(null)
  const [avatarEditorImage, setAvatarEditorImage] = useState<AvatarEditorImage | null>(null)
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false)
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const avatarDraftUrlRef = useRef<string | null>(null)
  const avatarEditorUrlRef = useRef<string | null>(null)

  const sourceUser = (userById ?? user) as ProfileSourceUser | null

  useEffect(() => {
    if (sourceUser) {
      setFormData({
        name: sourceUser.name || '',
        lastname: sourceUser.lastname || '',
        phone_number: sourceUser.phone_number || '',
        email: sourceUser.email || '',
        username: sourceUser.username || '',
        password: '',
        genre: sourceUser.genre || '',
        date_of_birth: toDateInputValue(sourceUser.date_of_birth),
      })
    }
  }, [sourceUser])

  useEffect(() => {
    avatarDraftUrlRef.current = avatarDraft?.previewUrl ?? null
  }, [avatarDraft])

  useEffect(() => {
    avatarEditorUrlRef.current = avatarEditorImage?.objectUrl ?? null
  }, [avatarEditorImage])

  useEffect(() => {
    return () => {
      if (avatarDraftUrlRef.current) URL.revokeObjectURL(avatarDraftUrlRef.current)
      if (avatarEditorUrlRef.current) URL.revokeObjectURL(avatarEditorUrlRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isAvatarPreviewOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAvatarPreviewOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAvatarPreviewOpen])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Selecciona un archivo de imagen válido.' })
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen original es demasiado pesada. Usa una menor a 15MB.' })
      return
    }

    try {
      setMessage(null)
      const objectUrl = URL.createObjectURL(file)
      const img = await loadImage(objectUrl)

      if (avatarEditorImage?.objectUrl) {
        URL.revokeObjectURL(avatarEditorImage.objectUrl)
      }

      setAvatarEditorImage({
        file,
        objectUrl,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      })
      setIsAvatarEditorOpen(true)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo abrir la imagen seleccionada.',
      })
    }
  }

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxiosError = error as { response?: { data?: { message?: string } } }
    return maybeAxiosError?.response?.data?.message || fallback
  }

  const handleAvatarApplied = async (nextAvatar: AvatarDraft) => {
    if (!sourceUser?.id) {
      throw new Error('No se encontró el usuario para actualizar la foto.')
    }

    try {
      await updateProfilePictureMutation.mutateAsync({ file: nextAvatar.file, userId: sourceUser.id })
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'No se pudo actualizar la foto de perfil.'))
    }

    if (avatarDraft?.previewUrl) {
      URL.revokeObjectURL(avatarDraft.previewUrl)
    }

    setAvatarDraft(nextAvatar)
    setMessage({
      type: 'success',
      text: `Foto actualizada correctamente (${bytesToReadable(nextAvatar.sizeBytes)}).`,
    })
  }

  const handleRevokeSession = (sessionId: number) => {
    setSessionsMessage(null)
    revokeSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        setSessionsMessage({ type: 'success', text: `Sesión #${sessionId} cerrada correctamente.` })
      },
      onError: (error) => {
        setSessionsMessage({ type: 'error', text: getApiErrorMessage(error, 'No se pudo cerrar la sesión.') })
      },
    })
  }

  const handleLogoutAllSessions = () => {
    setSessionsMessage(null)
    logoutAllSessionsMutation.mutate(undefined, {
      onSuccess: () => {
        setSessionsMessage({
          type: 'success',
          text: 'Se solicitó cerrar todas las sesiones. Refresca la lista para confirmar el estado.',
        })
      },
      onError: (error) => {
        setSessionsMessage({ type: 'error', text: getApiErrorMessage(error, 'No se pudieron cerrar las sesiones.') })
      },
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!sourceUser?.id) {
      setMessage({ type: 'error', text: 'No se encontró el usuario para actualizar el perfil.' })
      return
    }

    const payload: UpdateUserByIdPayload = {}

    const nextName = formData.name.trim()
    const nextLastname = formData.lastname.trim()
    const nextPhone = formData.phone_number.trim()
    const nextEmail = formData.email.trim()
    const nextPassword = formData.password.trim()
    const nextGenre = formData.genre.trim()
    const nextDateOfBirth = formData.date_of_birth.trim()

    if (nextName !== (sourceUser.name || '')) payload.name = nextName
    if (nextLastname !== (sourceUser.lastname || '')) payload.lastname = nextLastname
    if (nextPhone !== (sourceUser.phone_number || '')) payload.phone_number = nextPhone
    if (nextEmail !== (sourceUser.email || '')) payload.email = nextEmail

    const currentGenre = sourceUser.genre || ''
    if (nextGenre && nextGenre !== currentGenre) payload.genre = nextGenre

    const currentBirthDate = toDateInputValue(sourceUser.date_of_birth)
    if (nextDateOfBirth && nextDateOfBirth !== currentBirthDate) {
      payload.date_of_birth = toIsoDateTimeString(nextDateOfBirth)
    }

    if (nextPassword) payload.password = nextPassword

    if (Object.keys(payload).length === 0) {
      setMessage({ type: 'error', text: 'No hay cambios por guardar.' })
      return
    }

    updateProfileMutation.mutate({ userId: sourceUser.id, data: payload }, {
      onSuccess: () => {
        setFormData((prev) => ({ ...prev, password: '' }))
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        })
      },
      onError: (error: unknown) => {
        setMessage({ type: 'error', text: getApiErrorMessage(error, 'Failed to update profile') })
      }
    })
  }

  const currentAvatarPreview = avatarDraft?.previewUrl || sourceUser?.profile_picture || null
  const currentInitials = getInitials(sourceUser)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const activeSessionsCount = sortedSessions.filter((session) => !session.is_revoked).length
  const prefersReducedMotion = useReducedMotion()
  const avatarPreviewModal = isAvatarPreviewOpen && currentAvatarPreview
    ? createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/72 p-6 backdrop-blur-md"
        onClick={() => setIsAvatarPreviewOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Cerrar vista previa de foto"
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            setIsAvatarPreviewOpen(false)
          }
        }}
      >
        <div
          className="relative h-[min(82vh,640px)] w-[min(82vw,640px)] max-h-[640px] max-w-[640px] overflow-hidden rounded-[28px] shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentAvatarPreview}
            alt="Foto de perfil ampliada"
            className="h-full w-full object-cover"
          />
        </div>
      </div>,
      document.body,
    )
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {avatarPreviewModal}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-500">Manage your personal information and account settings.</p>

        <div className="mt-5 inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
          <motion.button
            type="button"
            onClick={() => setActiveTab('info')}
            className="relative inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition"
            aria-pressed={activeTab === 'info'}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          >
            {activeTab === 'info' && (
              <motion.span
                layoutId="profile-tab-indicator"
                className="absolute inset-0 rounded-xl bg-emerald-50 shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 inline-flex items-center gap-2 ${activeTab === 'info' ? 'text-emerald-700' : 'text-gray-600'}`}>
              <User className="h-4 w-4" />
              Información
            </span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className="relative inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition"
            aria-pressed={activeTab === 'sessions'}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          >
            {activeTab === 'sessions' && (
              <motion.span
                layoutId="profile-tab-indicator"
                className="absolute inset-0 rounded-xl bg-emerald-50 shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 inline-flex items-center gap-2 ${activeTab === 'sessions' ? 'text-emerald-700' : 'text-gray-600'}`}>
              <Shield className="h-4 w-4" />
              Sesiones
            </span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
      {activeTab === 'info' && (
      <motion.div
        key="profile-info-tab"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.995 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.995 }}
        transition={{ duration: prefersReducedMotion ? 0.14 : 0.22, ease: 'easeOut' }}
      >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="p-6 sm:p-8">
          <AvatarEditorModal
            image={avatarEditorImage}
            open={isAvatarEditorOpen}
            onClose={() => setIsAvatarEditorOpen(false)}
            onApply={handleAvatarApplied}
            onError={(text) => setMessage({ type: 'error', text })}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {isUserError && (
              <div className="p-4 rounded-xl flex items-center gap-3 bg-amber-50 text-amber-700">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  No se pudo refrescar la información desde <code>/v1/users/{'{id}'}</code>. Se muestran datos locales si existen.
                </p>
              </div>
            )}

            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[linear-gradient(145deg,#f8fafc_0%,#ffffff_35%,#ecfdf5_100%)] p-5 sm:p-6">
              <div className="absolute -right-12 -top-10 h-32 w-32 rounded-full bg-emerald-100/60 blur-2xl" />
              <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-cyan-100/60 blur-2xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-24 w-24 overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/80 ring-4 ring-white">
                      {currentAvatarPreview ? (
                        <button
                          type="button"
                          onClick={() => setIsAvatarPreviewOpen(true)}
                          className="block h-full w-full cursor-zoom-in"
                          aria-label="Ver foto de perfil grande"
                        >
                          <img src={currentAvatarPreview} alt="Foto de perfil" className="h-full w-full object-cover" />
                        </button>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-600">
                          {currentInitials}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAvatarClick}
                      disabled={updateProfilePictureMutation.isPending}
                      className="absolute -bottom-2 -right-2 rounded-xl border border-white bg-white p-2 shadow-md transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                      aria-label="Cambiar foto de perfil"
                    >
                      <Camera className="h-4 w-4 text-emerald-600" />
                    </button>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-900">Foto de perfil</h2>
                    <p className="max-w-md text-sm text-gray-600">
                      Sube una imagen, ajusta encuadre/zoom y la optimizamos automáticamente a menos de 1MB.
                    </p>
                    {isUserLoading && !sourceUser && (
                      <div className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Cargando datos de <code>/v1/users/{'{id}'}</code>...
                      </div>
                    )}
                    {avatarDraft && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {updateProfilePictureMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {updateProfilePictureMutation.isPending
                          ? 'Subiendo foto...'
                          : `Optimizada: ${bytesToReadable(avatarDraft.sizeBytes)}`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  <button
                    type="button"
                    onClick={handleSelectAvatarClick}
                    disabled={updateProfilePictureMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {currentAvatarPreview ? 'Cambiar foto' : 'Subir foto'}
                  </button>
                  {avatarDraft && avatarEditorImage && (
                    <button
                      type="button"
                      onClick={() => setIsAvatarEditorOpen(true)}
                      disabled={updateProfilePictureMutation.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Move className="h-4 w-4" />
                      Ajustar encuadre
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700 ml-1">
                  First Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Enter your first name"
                    required
                    disabled={isUserLoading && !sourceUser}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label htmlFor="lastname" className="text-sm font-semibold text-gray-700 ml-1">
                  Last Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Enter your last name"
                    required
                    disabled={isUserLoading && !sourceUser}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone_number" className="text-sm font-semibold text-gray-700 ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Enter your phone number"
                    disabled={isUserLoading && !sourceUser}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Enter your email"
                    required
                    disabled={isUserLoading && !sourceUser}
                  />
                </div>
              </div>

              {/* Username (Read Only) */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-gray-700 ml-1">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    readOnly
                    className="block w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-xl cursor-not-allowed outline-none"
                    placeholder="Username"
                  />
                </div>
                <p className="text-[11px] text-gray-400 ml-1 italic">Username cannot be changed.</p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Leave empty to keep current password"
                    maxLength={255}
                    disabled={isUserLoading && !sourceUser}
                  />
                </div>
              </div>

              {/* Genre */}
              <GenreComboboxField
                id="genre"
                label="Genero"
                value={formData.genre}
                onChange={(value) => setFormData((prev) => ({ ...prev, genre: value }))}
                disabled={isUserLoading && !sourceUser}
              />

              {/* Date of Birth */}
              <ProfileDatePickerField
                id="date_of_birth"
                label="Fecha de nacimiento"
                value={formData.date_of_birth}
                onChange={(value) => setFormData((prev) => ({ ...prev, date_of_birth: value }))}
                disabled={isUserLoading && !sourceUser}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending || (isUserLoading && !sourceUser)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      </motion.div>
      )}

      {activeTab === 'sessions' && (
      <motion.div
        key="profile-sessions-tab"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.995 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.995 }}
        transition={{ duration: prefersReducedMotion ? 0.14 : 0.22, ease: 'easeOut' }}
      >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Shield className="h-3.5 w-3.5" />
                Sesiones
              </div>
              <h2 className="mt-3 text-xl font-bold text-gray-900">Sesiones activas del usuario</h2>
              <p className="mt-1 text-sm text-gray-500">
                Revisa dispositivos conectados y cierra sesiones específicas o todas las sesiones.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Activas: {activeSessionsCount} · Total: {sortedSessions.length}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <button
                type="button"
                onClick={() => refetchSessions()}
                disabled={isSessionsLoading || revokeSessionMutation.isPending || logoutAllSessionsMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw className={`h-4 w-4 ${isSessionsLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                type="button"
                onClick={handleLogoutAllSessions}
                disabled={logoutAllSessionsMutation.isPending || revokeSessionMutation.isPending || isSessionsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {logoutAllSessionsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Cerrar todas las sesiones
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Para cerrar solo otros dispositivos, usa el botón <span className="font-semibold">Cerrar sesión</span> en cada fila.
          </p>

          {sessionsMessage && (
            <div className={`mt-5 p-4 rounded-xl flex items-center gap-3 ${
              sessionsMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {sessionsMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-medium">{sessionsMessage.text}</p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {isSessionsLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando sesiones...
                </div>
              </div>
            ) : sortedSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                No hay sesiones registradas para mostrar.
              </div>
            ) : (
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {sortedSessions.map((session) => {
                  const status = getSessionStatus(session)
                  const isRevokingThis =
                    revokeSessionMutation.isPending && Number(revokeSessionMutation.variables) === session.id

                  return (
                    <div
                      key={session.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700">
                              <Monitor className="h-4 w-4 text-gray-500" />
                              <span className="truncate max-w-[280px]">
                                {session.user_agent || 'Dispositivo no identificado'}
                              </span>
                            </div>
                            <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                              {status.label}
                            </div>
                            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-500">
                              ID #{session.id}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                            <div className="inline-flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span>{session.ip_address || 'IP no disponible'}</span>
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-gray-400" />
                              <span>Creada: {formatSessionDateTime(session.created_at)}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 sm:col-span-2">
                              <Clock3 className="h-4 w-4 text-gray-400" />
                              <span>Expira: {formatSessionDateTime(session.expires_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 lg:flex-col lg:items-end">
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={
                              session.is_revoked ||
                              revokeSessionMutation.isPending ||
                              logoutAllSessionsMutation.isPending
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isRevokingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            {session.is_revoked ? 'Revocada' : 'Cerrar sesión'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}
