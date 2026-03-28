# EIDOS Onboarding Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el flujo de onboarding de 8 pasos de EIDOS — desde la pantalla de impacto hasta la primera misión del usuario.

**Architecture:** Ruta dinámica `/onboarding/[step]` con Zustand para estado de sesión. Cada paso es un Server Component que renderiza un Client Component. OnboardingShell maneja navegación por teclado (Space/ArrowRight/ArrowLeft) en desktop y swipe en mobile. Supabase auth en paso 3 (email+contraseña y magic link). Datos guardados en Supabase en pasos 4, 6 y 8.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, Supabase JS v2, Vitest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-27-onboarding-design.md`

> ⚠️ **AGENTS.md warning:** Este proyecto usa Next.js 16 con breaking changes respecto a versiones anteriores. Antes de escribir cualquier código, leer `node_modules/next/dist/docs/` para verificar APIs actuales.

---

## Chunk 1: Setup — Dependencias, Testing y Tokens de Color

### Task 1: Instalar Zustand y PostHog

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Instalar dependencias**

```bash
cd /Users/gerardolameda/eidos
npm install zustand posthog-js
```

Salida esperada: `added X packages` sin errores.

- [ ] **Step 2: Verificar instalación**

```bash
node -e "require('./node_modules/zustand/package.json'); console.log('zustand ok')"
node -e "require('./node_modules/posthog-js/package.json'); console.log('posthog ok')"
```

Salida esperada:
```
zustand ok
posthog ok
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install zustand and posthog-js"
```

---

### Task 2: Inicializar PostHog en el Root Layout

**Files:**
- Create: `components/PostHogProvider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Leer `app/layout.tsx` para entender la estructura actual**

- [ ] **Step 2: Crear `components/PostHogProvider.tsx`**

```tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      capture_pageview: true,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

- [ ] **Step 3: Agregar `NEXT_PUBLIC_POSTHOG_KEY` a `.env.local`**

Agregar las siguientes variables (obtener valores desde el dashboard de PostHog):
```
NEXT_PUBLIC_POSTHOG_KEY=phc_XXXXXXXXXXXXXXXX
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

- [ ] **Step 4: Envolver el root layout con `PostHogProvider`**

En `app/layout.tsx`, importar y envolver `{children}` con `<PostHogProvider>`:

```tsx
import PostHogProvider from '@/components/PostHogProvider'

// Dentro del body:
<PostHogProvider>
  {children}
</PostHogProvider>
```

- [ ] **Step 5: Verificar que PostHog captura pageviews**

```bash
npm run dev
```

Abrir `http://localhost:3000/onboarding/1`, navegar a paso 2. Verificar en el dashboard de PostHog que aparecen eventos `$pageview` con las URLs `/onboarding/1` y `/onboarding/2`.

- [ ] **Step 6: Commit**

```bash
git add components/PostHogProvider.tsx app/layout.tsx .env.local
git commit -m "feat: initialize posthog provider for automatic pageview tracking"
```

---

### Task 3: Configurar Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Instalar dependencias de testing**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Crear `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 3: Crear `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Agregar script de test en `package.json`**

En la sección `"scripts"`, agregar:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Verificar que vitest corre**

```bash
npm run test:run
```

Salida esperada: `No test files found` (sin errores de configuración).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "chore: configure vitest with react testing library"
```

---

### Task 3: Definir tokens de color en Tailwind v4

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Leer `app/globals.css` para ver el estado actual**

- [ ] **Step 2: Agregar tokens EIDOS en la sección `@theme`**

Dentro del bloque `@theme` existente (o crearlo si no existe), agregar:

```css
@theme {
  --color-bg-base: #0D0D14;
  --color-accent-cyan: #22D3EE;
  --color-accent-gold: #C9A84C;
  --color-text-primary: #F0EDE8;
  --color-text-muted: #4A5568;
}
```

Esto genera automáticamente clases Tailwind:
- `bg-bg-base`, `text-bg-base`
- `bg-accent-cyan`, `text-accent-cyan`, `border-accent-cyan`
- `bg-accent-gold`, `text-accent-gold`
- `text-text-primary`, `text-text-muted`

- [ ] **Step 3: Verificar que el build no falla**

```bash
npm run build
```

Salida esperada: build exitoso sin errores de CSS.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: add EIDOS color tokens to tailwind theme"
```

---

## Chunk 2: Store y Fundación

### Task 4: Zustand Store del Onboarding

**Files:**
- Create: `store/onboardingStore.ts`
- Create: `store/__tests__/onboardingStore.test.ts`

- [ ] **Step 1: Crear directorio**

```bash
mkdir -p /Users/gerardolameda/eidos/store/__tests__
```

- [ ] **Step 2: Escribir el test primero**

Crear `store/__tests__/onboardingStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboardingStore } from '../onboardingStore'
import { act } from '@testing-library/react'

describe('onboardingStore', () => {
  beforeEach(() => {
    act(() => {
      useOnboardingStore.setState({
        nombre: '',
        nivel: 1,
        areaPrioritaria: '',
      })
    })
  })

  it('should have correct initial state', () => {
    const state = useOnboardingStore.getState()
    expect(state.nombre).toBe('')
    expect(state.nivel).toBe(1)
    expect(state.areaPrioritaria).toBe('')
  })

  it('should update nombre', () => {
    act(() => {
      useOnboardingStore.getState().setNombre('Gerardo')
    })
    expect(useOnboardingStore.getState().nombre).toBe('Gerardo')
  })

  it('should update nivel', () => {
    act(() => {
      useOnboardingStore.getState().setNivel(3)
    })
    expect(useOnboardingStore.getState().nivel).toBe(3)
  })

  it('should update areaPrioritaria', () => {
    act(() => {
      useOnboardingStore.getState().setAreaPrioritaria('Financiera')
    })
    expect(useOnboardingStore.getState().areaPrioritaria).toBe('Financiera')
  })
})
```

- [ ] **Step 3: Correr test para verificar que falla**

```bash
npm run test:run store/__tests__/onboardingStore.test.ts
```

Salida esperada: `FAIL` — `Cannot find module '../onboardingStore'`

- [ ] **Step 4: Crear `store/onboardingStore.ts`**

```typescript
import { create } from 'zustand'

type Nivel = 1 | 2 | 3 | 4 | 5

interface OnboardingState {
  nombre: string
  nivel: Nivel
  areaPrioritaria: string
  setNombre: (nombre: string) => void
  setNivel: (nivel: Nivel) => void
  setAreaPrioritaria: (area: string) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  nombre: '',
  nivel: 1,
  areaPrioritaria: '',
  setNombre: (nombre) => set({ nombre }),
  setNivel: (nivel) => set({ nivel }),
  setAreaPrioritaria: (area) => set({ areaPrioritaria: area }),
}))
```

- [ ] **Step 5: Correr test para verificar que pasa**

```bash
npm run test:run store/__tests__/onboardingStore.test.ts
```

Salida esperada: `PASS` — 4 tests passed.

- [ ] **Step 6: Commit**

```bash
git add store/onboardingStore.ts store/__tests__/onboardingStore.test.ts
git commit -m "feat: add onboarding zustand store with tests"
```

---

### Task 5: Layout del Onboarding

**Files:**
- Create: `app/onboarding/layout.tsx`

- [ ] **Step 1: Crear `app/onboarding/layout.tsx`**

```tsx
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center overflow-hidden">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Verificar que el dev server corre sin errores**

```bash
npm run dev
```

Abrir `http://localhost:3000/onboarding/1` — debe mostrar fondo oscuro (aunque la ruta no exista aún, el layout aplica).

- [ ] **Step 3: Commit**

```bash
git add app/onboarding/layout.tsx
git commit -m "feat: add onboarding layout with dark background"
```

---

### Task 6: OnboardingShell — Navegación y Transiciones

**Files:**
- Create: `components/onboarding/OnboardingShell.tsx`
- Create: `components/onboarding/__tests__/OnboardingShell.test.tsx`

- [ ] **Step 1: Crear directorio**

```bash
mkdir -p /Users/gerardolameda/eidos/components/onboarding/__tests__
```

- [ ] **Step 2: Escribir los tests primero**

Crear `components/onboarding/__tests__/OnboardingShell.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OnboardingShell from '../OnboardingShell'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('OnboardingShell', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders children', () => {
    render(
      <OnboardingShell step={1}>
        <p>Test content</p>
      </OnboardingShell>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('advances to next step on Space key', () => {
    render(
      <OnboardingShell step={1}>
        <p>Step 1</p>
      </OnboardingShell>
    )
    fireEvent.keyDown(window, { code: 'Space' })
    expect(mockPush).toHaveBeenCalledWith('/onboarding/2')
  })

  it('advances to next step on ArrowRight key', () => {
    render(
      <OnboardingShell step={3}>
        <p>Step 3</p>
      </OnboardingShell>
    )
    fireEvent.keyDown(window, { code: 'ArrowRight' })
    expect(mockPush).toHaveBeenCalledWith('/onboarding/4')
  })

  it('goes back on ArrowLeft key when step > 1', () => {
    render(
      <OnboardingShell step={4}>
        <p>Step 4</p>
      </OnboardingShell>
    )
    fireEvent.keyDown(window, { code: 'ArrowLeft' })
    expect(mockPush).toHaveBeenCalledWith('/onboarding/3')
  })

  it('does not go back on ArrowLeft when on step 1', () => {
    render(
      <OnboardingShell step={1}>
        <p>Step 1</p>
      </OnboardingShell>
    )
    fireEvent.keyDown(window, { code: 'ArrowLeft' })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to dashboard after step 8', () => {
    render(
      <OnboardingShell step={8}>
        <p>Step 8</p>
      </OnboardingShell>
    )
    fireEvent.keyDown(window, { code: 'Space' })
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('does not advance when canAdvance is false', () => {
    render(
      <OnboardingShell step={3} canAdvance={false}>
        <p>Step 3</p>
      </OnboardingShell>
    )
    fireEvent.keyDown(window, { code: 'Space' })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Correr tests para verificar que fallan**

```bash
npm run test:run components/onboarding/__tests__/OnboardingShell.test.tsx
```

Salida esperada: `FAIL` — `Cannot find module '../OnboardingShell'`

- [ ] **Step 4: Crear `components/onboarding/OnboardingShell.tsx`**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface OnboardingShellProps {
  children: React.ReactNode
  step: number
  canAdvance?: boolean
  onAdvance?: () => void
}

export default function OnboardingShell({
  children,
  step,
  canAdvance = true,
  onAdvance,
}: OnboardingShellProps) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const touchStartX = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const goNext = () => {
    if (step < 8) {
      router.push(`/onboarding/${step + 1}`)
    } else {
      router.push('/dashboard')
    }
  }

  const goBack = () => {
    if (step > 1) {
      router.push(`/onboarding/${step - 1}`)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault()
        if (!canAdvance) return
        if (onAdvance) {
          onAdvance()
        } else {
          goNext()
        }
      }
      if (e.code === 'ArrowLeft') {
        goBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, canAdvance, onAdvance])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (delta > 50 && canAdvance) {
      if (onAdvance) onAdvance()
      else goNext()
    }
    if (delta < -50) {
      goBack()
    }
  }

  return (
    <div
      className={`w-full max-w-lg px-8 transition-all duration-[400ms] ease-in-out ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Correr tests para verificar que pasan**

```bash
npm run test:run components/onboarding/__tests__/OnboardingShell.test.tsx
```

Salida esperada: `PASS` — 7 tests passed.

- [ ] **Step 6: Commit**

```bash
git add components/onboarding/OnboardingShell.tsx components/onboarding/__tests__/OnboardingShell.test.tsx
git commit -m "feat: add OnboardingShell with keyboard and swipe navigation"
```

---

## Chunk 3: Pasos de Solo Lectura (1, 2, 5, 7)

### Task 7: Step1Impacto

**Files:**
- Create: `components/onboarding/steps/Step1Impacto.tsx`
- Create: `components/onboarding/steps/__tests__/Step1Impacto.test.tsx`

- [ ] **Step 1: Crear directorio**

```bash
mkdir -p /Users/gerardolameda/eidos/components/onboarding/steps/__tests__
```

- [ ] **Step 2: Escribir el test**

Crear `components/onboarding/steps/__tests__/Step1Impacto.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Step1Impacto from '../Step1Impacto'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('Step1Impacto', () => {
  it('renders the first line of copy', () => {
    render(<Step1Impacto step={1} />)
    expect(screen.getByText(/El juego de tu vida ya empezó/i)).toBeInTheDocument()
  })

  it('renders the second line of copy', () => {
    render(<Step1Impacto step={1} />)
    expect(screen.getByText(/estás jugando/i)).toBeInTheDocument()
  })

  it('renders the continue hint', () => {
    render(<Step1Impacto step={1} />)
    expect(screen.getByText(/espacio para continuar/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Correr test para verificar que falla**

```bash
npm run test:run components/onboarding/steps/__tests__/Step1Impacto.test.tsx
```

- [ ] **Step 4: Crear `components/onboarding/steps/Step1Impacto.tsx`**

```tsx
import OnboardingShell from '../OnboardingShell'

interface StepProps {
  step: number
}

export default function Step1Impacto({ step }: StepProps) {
  return (
    <OnboardingShell step={step}>
      <div className="space-y-6">
        <p className="text-4xl font-bold leading-tight tracking-tight">
          El juego de tu vida ya empezó.
        </p>
        <p className="text-4xl font-bold leading-tight tracking-tight">
          La pregunta es: ¿estás jugando… o solo mirando?
        </p>
        <p className="text-text-muted text-sm animate-pulse mt-12">
          · · · · espacio para continuar
        </p>
      </div>
    </OnboardingShell>
  )
}
```

- [ ] **Step 5: Correr test para verificar que pasa**

```bash
npm run test:run components/onboarding/steps/__tests__/Step1Impacto.test.tsx
```

Salida esperada: `PASS` — 3 tests passed.

- [ ] **Step 6: Commit**

```bash
git add components/onboarding/steps/Step1Impacto.tsx components/onboarding/steps/__tests__/Step1Impacto.test.tsx
git commit -m "feat: add Step1Impacto component"
```

---

### Task 8: Step2Promesa

**Files:**
- Create: `components/onboarding/steps/Step2Promesa.tsx`
- Create: `components/onboarding/steps/__tests__/Step2Promesa.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `components/onboarding/steps/__tests__/Step2Promesa.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Step2Promesa from '../Step2Promesa'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('Step2Promesa', () => {
  it('renders the promise copy', () => {
    render(<Step2Promesa step={2} />)
    expect(screen.getByText(/La mayoría empieza por los hábitos/i)).toBeInTheDocument()
  })

  it('renders the differentiator', () => {
    render(<Step2Promesa step={2} />)
    expect(screen.getByText(/EIDOS empieza por ti/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Correr test para verificar que falla**

```bash
npm run test:run components/onboarding/steps/__tests__/Step2Promesa.test.tsx
```

- [ ] **Step 3: Crear `components/onboarding/steps/Step2Promesa.tsx`**

```tsx
import OnboardingShell from '../OnboardingShell'

interface StepProps {
  step: number
}

export default function Step2Promesa({ step }: StepProps) {
  return (
    <OnboardingShell step={step}>
      <div className="space-y-4">
        <p className="text-3xl font-semibold leading-snug text-text-muted">
          La mayoría empieza por los hábitos.
        </p>
        <p className="text-4xl font-bold leading-tight text-text-primary">
          EIDOS empieza por ti.
        </p>
        <p className="text-text-muted text-sm animate-pulse mt-12">
          · · · · espacio para continuar
        </p>
      </div>
    </OnboardingShell>
  )
}
```

- [ ] **Step 4: Correr test para verificar que pasa**

```bash
npm run test:run components/onboarding/steps/__tests__/Step2Promesa.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/steps/Step2Promesa.tsx components/onboarding/steps/__tests__/Step2Promesa.test.tsx
git commit -m "feat: add Step2Promesa component"
```

---

### Task 9: Step5Bienvenida

**Files:**
- Create: `components/onboarding/steps/Step5Bienvenida.tsx`
- Create: `components/onboarding/steps/__tests__/Step5Bienvenida.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `components/onboarding/steps/__tests__/Step5Bienvenida.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import Step5Bienvenida from '../Step5Bienvenida'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/store/onboardingStore', () => ({
  useOnboardingStore: () => ({ nombre: 'Gerardo' }),
}))

describe('Step5Bienvenida', () => {
  it('renders the welcome message with nombre', () => {
    render(<Step5Bienvenida step={5} />)
    expect(screen.getByText(/Bienvenido, Gerardo/i)).toBeInTheDocument()
  })

  it('renders Chronicles title in gold after 1 second', async () => {
    vi.useFakeTimers()
    render(<Step5Bienvenida step={5} />)

    // Chronicles no visible inicialmente
    const chronicles = screen.getByText(/Gerardo Chronicles/i)
    expect(chronicles.parentElement).toHaveClass('opacity-0')

    // Después de 1 segundo aparece
    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(chronicles.parentElement).toHaveClass('opacity-100')

    vi.useRealTimers()
  })

  it('renders Chronicles title without trailing period', () => {
    render(<Step5Bienvenida step={5} />)
    const chronicles = screen.getByText('Gerardo Chronicles')
    expect(chronicles).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Correr test para verificar que falla**

```bash
npm run test:run components/onboarding/steps/__tests__/Step5Bienvenida.test.tsx
```

- [ ] **Step 3: Crear `components/onboarding/steps/Step5Bienvenida.tsx`**

Nota: La spec define dos beats secuenciales con una pausa de 1 segundo entre ellos. El Chronicles debe aparecer después de la bienvenida, sin punto final.

```tsx
'use client'

import { useEffect, useState } from 'react'
import OnboardingShell from '../OnboardingShell'
import { useOnboardingStore } from '@/store/onboardingStore'

interface StepProps {
  step: number
}

export default function Step5Bienvenida({ step }: StepProps) {
  const { nombre } = useOnboardingStore()
  const [showChronicles, setShowChronicles] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowChronicles(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <OnboardingShell step={step}>
      <div className="space-y-6">
        <p className="text-3xl font-semibold text-text-muted">
          Bienvenido, {nombre}.
        </p>
        <p className="text-3xl font-semibold">
          Tu juego empieza ahora.
        </p>
        <div
          className={`pt-6 transition-all duration-[400ms] ease-in-out ${
            showChronicles ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-5xl font-bold text-accent-gold">
            {nombre} Chronicles
          </p>
        </div>
        {showChronicles && (
          <p className="text-text-muted text-sm animate-pulse mt-12">
            · · · · espacio para continuar
          </p>
        )}
      </div>
    </OnboardingShell>
  )
}
```

- [ ] **Step 4: Correr test para verificar que pasa**

```bash
npm run test:run components/onboarding/steps/__tests__/Step5Bienvenida.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/steps/Step5Bienvenida.tsx components/onboarding/steps/__tests__/Step5Bienvenida.test.tsx
git commit -m "feat: add Step5Bienvenida with Chronicles title"
```

---

### Task 10: Step7Disclaimer

**Files:**
- Create: `components/onboarding/steps/Step7Disclaimer.tsx`
- Create: `components/onboarding/steps/__tests__/Step7Disclaimer.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `components/onboarding/steps/__tests__/Step7Disclaimer.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step7Disclaimer from '../Step7Disclaimer'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('Step7Disclaimer', () => {
  it('renders the disclaimer headline', () => {
    render(<Step7Disclaimer step={7} />)
    expect(screen.getByText(/Una cosa antes/i)).toBeInTheDocument()
  })

  it('renders the disclaimer body', () => {
    render(<Step7Disclaimer step={7} />)
    expect(screen.getByText(/No reemplaza a un profesional/i)).toBeInTheDocument()
  })

  it('renders the CTA button', () => {
    render(<Step7Disclaimer step={7} />)
    expect(screen.getByRole('button', { name: /Lo entiendo. Juguemos/i })).toBeInTheDocument()
  })

  it('advances to step 8 when CTA is clicked', async () => {
    const user = userEvent.setup()
    render(<Step7Disclaimer step={7} />)
    await user.click(screen.getByRole('button', { name: /Lo entiendo. Juguemos/i }))
    expect(mockPush).toHaveBeenCalledWith('/onboarding/8')
  })
})
```

- [ ] **Step 2: Correr test para verificar que falla**

```bash
npm run test:run components/onboarding/steps/__tests__/Step7Disclaimer.test.tsx
```

- [ ] **Step 3: Crear `components/onboarding/steps/Step7Disclaimer.tsx`**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import OnboardingShell from '../OnboardingShell'

interface StepProps {
  step: number
}

export default function Step7Disclaimer({ step }: StepProps) {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/onboarding/8')
  }

  return (
    <OnboardingShell step={step} canAdvance={false}>
      <div className="space-y-6">
        <p className="text-3xl font-bold">Una cosa antes.</p>
        <div className="space-y-2 text-text-muted text-lg">
          <p>EIDOS es una herramienta de autoconocimiento.</p>
          <p>No reemplaza a un profesional.</p>
          <p>Si estás en crisis, busca ayuda.</p>
        </div>
        <button
          onClick={handleContinue}
          className="mt-8 text-accent-gold font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          Lo entiendo. Juguemos. →
        </button>
      </div>
    </OnboardingShell>
  )
}
```

- [ ] **Step 4: Correr test para verificar que pasa**

```bash
npm run test:run components/onboarding/steps/__tests__/Step7Disclaimer.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/steps/Step7Disclaimer.tsx components/onboarding/steps/__tests__/Step7Disclaimer.test.tsx
git commit -m "feat: add Step7Disclaimer with CTA"
```

---

## Chunk 4: Auth (Paso 3)

### Task 11: Auth Callback Route

Supabase necesita una ruta de callback para el magic link.

**Files:**
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p /Users/gerardolameda/eidos/app/auth/callback
```

- [ ] **Step 2: Crear `app/auth/callback/route.ts`**

```typescript
import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/onboarding/4`)
    }
  }

  return NextResponse.redirect(`${origin}/onboarding/3?error=auth`)
}
```

**Nota:** Este route requiere que `lib/supabase.ts` exporte una función `createClient()`. Ver siguiente paso.

- [ ] **Step 3: Verificar que `lib/supabase.ts` exporta `createClient` como función**

Leer `lib/supabase.ts`. Si exporta el cliente directamente (`export const supabase = ...`), agregar también la exportación de función:

```typescript
// Agregar al final de lib/supabase.ts si no existe:
export const createClient = () => createClient(supabaseUrl, supabaseAnonKey)
```

Si ya exporta `supabase` como instancia, el callback puede usarla directamente:
```typescript
import { supabase } from '@/lib/supabase'
// reemplazar createClient() por supabase
```

- [ ] **Step 4: Commit**

```bash
git add app/auth/callback/route.ts lib/supabase.ts
git commit -m "feat: add auth callback route for magic link"
```

---

### Task 12: Step3Auth

**Files:**
- Create: `components/onboarding/steps/Step3Auth.tsx`
- Create: `components/onboarding/steps/__tests__/Step3Auth.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `components/onboarding/steps/__tests__/Step3Auth.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step3Auth from '../Step3Auth'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSignUp = vi.fn()
const mockSignInWithOtp = vi.fn()
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
      signInWithOtp: mockSignInWithOtp,
    },
  },
}))

describe('Step3Auth', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSignUp.mockClear()
    mockSignInWithOtp.mockClear()
  })

  it('renders the headline', () => {
    render(<Step3Auth step={3} />)
    expect(screen.getByText(/Empieza tu juego/i)).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    render(<Step3Auth step={3} />)
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument()
  })

  it('renders magic link option', () => {
    render(<Step3Auth step={3} />)
    expect(screen.getByText(/Recibir link por email/i)).toBeInTheDocument()
  })

  it('calls signUp with email and password on submit', async () => {
    mockSignUp.mockResolvedValue({ data: { user: {} }, error: null })
    const user = userEvent.setup()
    render(<Step3Auth step={3} />)

    await user.type(screen.getByPlaceholderText(/correo/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('calls signInWithOtp on magic link click', async () => {
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })
    const user = userEvent.setup()
    render(<Step3Auth step={3} />)

    await user.type(screen.getByPlaceholderText(/correo/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Recibir link/i }))

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: { emailRedirectTo: expect.stringContaining('/auth/callback') },
    })
  })

  it('shows error message on auth failure', async () => {
    mockSignUp.mockResolvedValue({ data: null, error: { message: 'Email already registered' } })
    const user = userEvent.setup()
    render(<Step3Auth step={3} />)

    await user.type(screen.getByPlaceholderText(/correo/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'password123')
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    expect(await screen.findByText(/Email already registered/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Correr test para verificar que falla**

```bash
npm run test:run components/onboarding/steps/__tests__/Step3Auth.test.tsx
```

- [ ] **Step 3: Crear `components/onboarding/steps/Step3Auth.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import OnboardingShell from '../OnboardingShell'

interface StepProps {
  step: number
}

export default function Step3Auth({ step }: StepProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/onboarding/4')
    }
    setLoading(false)
  }

  const handleMagicLink = async () => {
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMagicLinkSent(true)
    }
    setLoading(false)
  }

  if (magicLinkSent) {
    return (
      <OnboardingShell step={step} canAdvance={false}>
        <div className="space-y-4">
          <p className="text-3xl font-bold">Revisa tu correo.</p>
          <p className="text-text-muted">
            Enviamos un link a <span className="text-text-primary">{email}</span>.
            Da click para continuar tu juego.
          </p>
        </div>
      </OnboardingShell>
    )
  }

  return (
    <OnboardingShell step={step} canAdvance={false}>
      <div className="space-y-6">
        <p className="text-3xl font-bold">Empieza tu juego.</p>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
          <input
            type="password"
            placeholder="contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full bg-accent-cyan text-bg-base font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Crear cuenta →
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-text-muted text-sm">o</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={handleMagicLink}
          disabled={loading}
          className="w-full border border-white/20 text-text-primary font-medium py-3 rounded-lg hover:border-accent-cyan transition-colors disabled:opacity-50"
        >
          Recibir link por email
        </button>
      </div>
    </OnboardingShell>
  )
}
```

- [ ] **Step 4: Correr tests para verificar que pasan**

```bash
npm run test:run components/onboarding/steps/__tests__/Step3Auth.test.tsx
```

Salida esperada: `PASS` — 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/steps/Step3Auth.tsx components/onboarding/steps/__tests__/Step3Auth.test.tsx
git commit -m "feat: add Step3Auth with email/password and magic link"
```

---

## Chunk 5: Pasos de Input (4 y 6)

### Task 13: Step4Nombre

**Files:**
- Create: `components/onboarding/steps/Step4Nombre.tsx`
- Create: `components/onboarding/steps/__tests__/Step4Nombre.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `components/onboarding/steps/__tests__/Step4Nombre.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step4Nombre from '../Step4Nombre'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSetNombre = vi.fn()
vi.mock('@/store/onboardingStore', () => ({
  useOnboardingStore: () => ({ setNombre: mockSetNombre }),
}))

const mockUpdate = vi.fn()
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    from: () => ({ upsert: mockUpdate.mockResolvedValue({ error: null }) }),
  },
}))

describe('Step4Nombre', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSetNombre.mockClear()
    mockUpdate.mockClear()
  })

  it('renders the question', () => {
    render(<Step4Nombre step={4} />)
    expect(screen.getByText(/¿Cuál es tu nombre, jugador\?/i)).toBeInTheDocument()
  })

  it('renders the name input', () => {
    render(<Step4Nombre step={4} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('updates store and advances on submit', async () => {
    const user = userEvent.setup()
    render(<Step4Nombre step={4} />)

    await user.type(screen.getByRole('textbox'), 'Gerardo')
    await user.click(screen.getByRole('button', { name: /Continuar/i }))

    expect(mockSetNombre).toHaveBeenCalledWith('Gerardo')
    expect(mockPush).toHaveBeenCalledWith('/onboarding/5')
  })

  it('does not submit with empty name', async () => {
    const user = userEvent.setup()
    render(<Step4Nombre step={4} />)

    await user.click(screen.getByRole('button', { name: /Continuar/i }))

    expect(mockSetNombre).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Correr test para verificar que falla**

```bash
npm run test:run components/onboarding/steps/__tests__/Step4Nombre.test.tsx
```

- [ ] **Step 3: Crear `components/onboarding/steps/Step4Nombre.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useOnboardingStore } from '@/store/onboardingStore'
import OnboardingShell from '../OnboardingShell'

interface StepProps {
  step: number
}

export default function Step4Nombre({ step }: StepProps) {
  const router = useRouter()
  const { setNombre } = useOnboardingStore()
  const [nombre, setNombreLocal] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!nombre.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('usuarios').upsert({
        id: user.id,
        nombre: nombre.trim(),
      })
    }

    setNombre(nombre.trim())
    router.push('/onboarding/5')
  }

  return (
    <OnboardingShell step={step} canAdvance={false}>
      <div className="space-y-6">
        <p className="text-3xl font-bold">¿Cuál es tu nombre, jugador?</p>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombreLocal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full bg-transparent border-b border-white/30 pb-2 text-2xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
          placeholder="Tu nombre"
          autoFocus
        />

        <button
          onClick={handleSubmit}
          disabled={!nombre.trim() || loading}
          className="text-accent-gold font-semibold text-lg hover:opacity-80 transition-opacity disabled:opacity-30"
        >
          Continuar →
        </button>
      </div>
    </OnboardingShell>
  )
}
```

- [ ] **Step 4: Correr tests para verificar que pasan**

```bash
npm run test:run components/onboarding/steps/__tests__/Step4Nombre.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/steps/Step4Nombre.tsx components/onboarding/steps/__tests__/Step4Nombre.test.tsx
git commit -m "feat: add Step4Nombre with supabase save"
```

---

### Task 14: Step6Nivel

**Files:**
- Create: `components/onboarding/steps/Step6Nivel.tsx`
- Create: `components/onboarding/steps/__tests__/Step6Nivel.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `components/onboarding/steps/__tests__/Step6Nivel.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step6Nivel from '../Step6Nivel'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSetNivel = vi.fn()
vi.mock('@/store/onboardingStore', () => ({
  useOnboardingStore: () => ({ setNivel: mockSetNivel }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    from: () => ({ upsert: vi.fn().mockResolvedValue({ error: null }) }),
  },
}))

const NIVELES = ['Despertando', 'Explorando', 'Construyendo', 'Dominando', 'Final Boss']

describe('Step6Nivel', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSetNivel.mockClear()
  })

  it('renders the question', () => {
    render(<Step6Nivel step={6} />)
    expect(screen.getByText(/¿En qué nivel te encuentras\?/i)).toBeInTheDocument()
  })

  it.each(NIVELES)('renders nivel option: %s', (nivel) => {
    render(<Step6Nivel step={6} />)
    expect(screen.getByText(new RegExp(nivel, 'i'))).toBeInTheDocument()
  })

  it('saves nivel and advances when option selected and CTA clicked', async () => {
    const user = userEvent.setup()
    render(<Step6Nivel step={6} />)

    await user.click(screen.getByLabelText(/Construyendo/i))
    await user.click(screen.getByRole('button', { name: /Este soy yo/i }))

    expect(mockSetNivel).toHaveBeenCalledWith(3)
    expect(mockPush).toHaveBeenCalledWith('/onboarding/7')
  })
})
```

- [ ] **Step 2: Correr test para verificar que falla**

```bash
npm run test:run components/onboarding/steps/__tests__/Step6Nivel.test.tsx
```

- [ ] **Step 3: Crear `components/onboarding/steps/Step6Nivel.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useOnboardingStore } from '@/store/onboardingStore'
import OnboardingShell from '../OnboardingShell'

const NIVELES = [
  { value: 1 as const, label: 'Despertando', descripcion: 'empiezo a ver' },
  { value: 2 as const, label: 'Explorando', descripcion: 'algo he hecho' },
  { value: 3 as const, label: 'Construyendo', descripcion: 'tengo práctica' },
  { value: 4 as const, label: 'Dominando', descripcion: 'soy consistente' },
  { value: 5 as const, label: 'Final Boss', descripcion: 'vivo desde adentro' },
]

interface StepProps {
  step: number
}

export default function Step6Nivel({ step }: StepProps) {
  const router = useRouter()
  const { setNivel } = useOnboardingStore()
  const [selected, setSelected] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('usuarios').upsert({
        id: user.id,
        nivel: selected,
      })
    }

    setNivel(selected)
    router.push('/onboarding/7')
  }

  return (
    <OnboardingShell step={step} canAdvance={false}>
      <div className="space-y-6">
        <p className="text-3xl font-bold">¿En qué nivel te encuentras?</p>

        <div className="space-y-3">
          {NIVELES.map((nivel) => (
            <label
              key={nivel.value}
              aria-label={nivel.label}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                selected === nivel.value
                  ? 'bg-accent-cyan/10 border border-accent-cyan'
                  : 'border border-white/10 hover:border-white/30'
              }`}
            >
              <input
                type="radio"
                name="nivel"
                value={nivel.value}
                checked={selected === nivel.value}
                onChange={() => setSelected(nivel.value)}
                className="sr-only"
              />
              <span className="font-semibold">{nivel.label}</span>
              <span className="text-text-muted text-sm">— {nivel.descripcion}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="text-accent-gold font-semibold text-lg hover:opacity-80 transition-opacity disabled:opacity-30"
        >
          Este soy yo →
        </button>
      </div>
    </OnboardingShell>
  )
}
```

- [ ] **Step 4: Correr tests para verificar que pasan**

```bash
npm run test:run components/onboarding/steps/__tests__/Step6Nivel.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/steps/Step6Nivel.tsx components/onboarding/steps/__tests__/Step6Nivel.test.tsx
git commit -m "feat: add Step6Nivel with radio selection and supabase save"
```

---

## Chunk 6: Primera Misión (Paso 8)

### Task 15: Step8Mision

**Files:**
- Create: `components/onboarding/steps/Step8Mision.tsx`
- Create: `components/onboarding/steps/__tests__/Step8Mision.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `components/onboarding/steps/__tests__/Step8Mision.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step8Mision from '../Step8Mision'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSetArea = vi.fn()
vi.mock('@/store/onboardingStore', () => ({
  useOnboardingStore: () => ({ setAreaPrioritaria: mockSetArea }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    from: () => ({ upsert: vi.fn().mockResolvedValue({ error: null }) }),
  },
}))

describe('Step8Mision', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSetArea.mockClear()
  })

  it('renders the mission question', () => {
    render(<Step8Mision step={8} />)
    expect(screen.getByText(/Si tu vida fuera un juego/i)).toBeInTheDocument()
  })

  it('renders 5 area options', () => {
    render(<Step8Mision step={8} />)
    expect(screen.getByText(/Personal \/ Mental/i)).toBeInTheDocument()
    expect(screen.getByText(/Física \/ Salud/i)).toBeInTheDocument()
    expect(screen.getByText(/Financiera/i)).toBeInTheDocument()
    expect(screen.getByText(/Profesional \/ Académica/i)).toBeInTheDocument()
    expect(screen.getByText(/Social \/ Relaciones/i)).toBeInTheDocument()
  })

  it('renders the gold CTA button', () => {
    render(<Step8Mision step={8} />)
    expect(screen.getByRole('button', { name: /Empezar mi juego/i })).toBeInTheDocument()
  })

  it('saves area and redirects to dashboard on submit', async () => {
    const user = userEvent.setup()
    render(<Step8Mision step={8} />)

    await user.click(screen.getByLabelText(/Financiera/i))
    await user.click(screen.getByRole('button', { name: /Empezar mi juego/i }))

    expect(mockSetArea).toHaveBeenCalledWith('Financiera')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('shows response message after area is selected', async () => {
    const user = userEvent.setup()
    render(<Step8Mision step={8} />)

    await user.click(screen.getByLabelText(/Personal \/ Mental/i))

    expect(screen.getByText(/Esa es tu base/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Correr test para verificar que falla**

```bash
npm run test:run components/onboarding/steps/__tests__/Step8Mision.test.tsx
```

- [ ] **Step 3: Crear `components/onboarding/steps/Step8Mision.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useOnboardingStore } from '@/store/onboardingStore'
import OnboardingShell from '../OnboardingShell'

const AREAS = [
  'Personal / Mental',
  'Física / Salud',
  'Financiera',
  'Profesional / Académica',
  'Social / Relaciones',
]

interface StepProps {
  step: number
}

export default function Step8Mision({ step }: StepProps) {
  const router = useRouter()
  const { setAreaPrioritaria } = useOnboardingStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('areas_vida').upsert({
        usuario_id: user.id,
        nombre: selected,
        es_prioritaria: true,
      })
    }

    setAreaPrioritaria(selected)
    router.push('/dashboard')
  }

  return (
    <OnboardingShell step={step} canAdvance={false}>
      <div className="space-y-6">
        <div>
          <p className="text-2xl font-bold">Si tu vida fuera un juego,</p>
          <p className="text-2xl font-bold">¿en qué área estarías ganando ahora mismo?</p>
        </div>

        <div className="space-y-2">
          {AREAS.map((area) => (
            <label
              key={area}
              aria-label={area}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selected === area
                  ? 'bg-accent-cyan/10 border border-accent-cyan'
                  : 'border border-white/10 hover:border-white/30'
              }`}
            >
              <input
                type="radio"
                name="area"
                value={area}
                checked={selected === area}
                onChange={() => setSelected(area)}
                className="sr-only"
              />
              <span className="font-medium">{area}</span>
            </label>
          ))}
        </div>

        {selected && (
          <p className="text-accent-cyan text-sm italic">
            Esa es tu base. Construimos desde ahí.
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="w-full bg-accent-gold text-bg-base font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 mt-4"
        >
          Empezar mi juego →
        </button>
      </div>
    </OnboardingShell>
  )
}
```

- [ ] **Step 4: Correr tests para verificar que pasan**

```bash
npm run test:run components/onboarding/steps/__tests__/Step8Mision.test.tsx
```

Salida esperada: `PASS` — 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/steps/Step8Mision.tsx components/onboarding/steps/__tests__/Step8Mision.test.tsx
git commit -m "feat: add Step8Mision with area selection and dashboard redirect"
```

---

## Chunk 7: Ruta Dinámica e Integración

### Task 16: Ruta Dinámica `/onboarding/[step]/page.tsx`

**Files:**
- Create: `app/onboarding/[step]/page.tsx`

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p /Users/gerardolameda/eidos/app/onboarding/\[step\]
```

- [ ] **Step 2: Crear `app/onboarding/[step]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Step1Impacto from '@/components/onboarding/steps/Step1Impacto'
import Step2Promesa from '@/components/onboarding/steps/Step2Promesa'
import Step3Auth from '@/components/onboarding/steps/Step3Auth'
import Step4Nombre from '@/components/onboarding/steps/Step4Nombre'
import Step5Bienvenida from '@/components/onboarding/steps/Step5Bienvenida'
import Step6Nivel from '@/components/onboarding/steps/Step6Nivel'
import Step7Disclaimer from '@/components/onboarding/steps/Step7Disclaimer'
import Step8Mision from '@/components/onboarding/steps/Step8Mision'

const STEPS: Record<number, React.ComponentType<{ step: number }>> = {
  1: Step1Impacto,
  2: Step2Promesa,
  3: Step3Auth,
  4: Step4Nombre,
  5: Step5Bienvenida,
  6: Step6Nivel,
  7: Step7Disclaimer,
  8: Step8Mision,
}

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ step: string }>
}) {
  const { step: stepParam } = await params
  const stepNumber = parseInt(stepParam, 10)

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 8) {
    notFound()
  }

  const StepComponent = STEPS[stepNumber]
  return <StepComponent step={stepNumber} />
}

export function generateStaticParams() {
  return Array.from({ length: 8 }, (_, i) => ({ step: String(i + 1) }))
}
```

- [ ] **Step 3: Verificar que la ruta funciona en dev**

```bash
npm run dev
```

Abrir `http://localhost:3000/onboarding/1` — debe mostrar el Step1Impacto con fondo oscuro y el copy correcto.

Navegar hasta `http://localhost:3000/onboarding/9` — debe mostrar página 404.

- [ ] **Step 4: Correr todos los tests**

```bash
npm run test:run
```

Salida esperada: todos los tests `PASS`.

- [ ] **Step 5: Commit**

```bash
git add app/onboarding/\[step\]/page.tsx
git commit -m "feat: add dynamic onboarding route with all 8 steps"
```

---

### Task 17: Middleware — Proteger rutas post-auth

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Crear `middleware.ts` en la raíz del proyecto**

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Pasos 1-3 son públicos (antes de crear cuenta)
  const publicOnboardingSteps = ['/onboarding/1', '/onboarding/2', '/onboarding/3']
  if (publicOnboardingSteps.some(p => pathname.startsWith(p))) {
    return res
  }

  // Pasos 4-8 requieren sesión
  if (pathname.startsWith('/onboarding') && !session) {
    return NextResponse.redirect(new URL('/onboarding/1', req.url))
  }

  // Dashboard requiere sesión
  if (pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/onboarding/1', req.url))
  }

  return res
}

export const config = {
  matcher: ['/onboarding/:path*', '/dashboard/:path*'],
}
```

- [ ] **Step 2: Instalar auth-helpers si no está instalado**

```bash
npm install @supabase/auth-helpers-nextjs
```

**Nota:** Si la instalación falla porque el paquete no es compatible con la versión de Supabase instalada, usar el cliente de Supabase del SSR package en su lugar:

```bash
npm install @supabase/ssr
```

Y ajustar el middleware para usar `createServerClient` de `@supabase/ssr`.

- [ ] **Step 3: Verificar que el middleware funciona**

```bash
npm run dev
```

- Visitar `http://localhost:3000/onboarding/5` sin sesión → debe redirigir a `/onboarding/1`
- Visitar `http://localhost:3000/dashboard` sin sesión → debe redirigir a `/onboarding/1`
- Visitar `http://localhost:3000/onboarding/1` → debe cargar normalmente

- [ ] **Step 4: Build final para verificar que todo compila**

```bash
npm run build
```

Salida esperada: build exitoso sin errores de TypeScript ni de compilación.

- [ ] **Step 5: Commit final**

```bash
git add middleware.ts package.json package-lock.json
git commit -m "feat: add middleware to protect onboarding steps 4-8 and dashboard"
```

---

## Verificación Final

- [ ] **Correr todos los tests**

```bash
npm run test:run
```

Salida esperada: todos los tests `PASS`.

- [ ] **Verificar flujo completo en dev**

```bash
npm run dev
```

Recorrer los 8 pasos manualmente:
1. `/onboarding/1` — Copy de impacto, Space avanza
2. `/onboarding/2` — Promesa, Space avanza
3. `/onboarding/3` — Auth form funciona
4. `/onboarding/4` — Input nombre funciona
5. `/onboarding/5` — Nombre aparece en dorado
6. `/onboarding/6` — Radio buttons funcionan
7. `/onboarding/7` — Disclaimer con botón CTA
8. `/onboarding/8` — Selección de área, redirige a `/dashboard`

- [ ] **Verificar en mobile (Chrome DevTools)**

Abrir DevTools → Toggle device toolbar → verificar que swipe funciona en pasos 1 y 2.

---

*EIDOS · Onboarding Implementation Plan · 2026-03-27 · GER GREATNESS*
