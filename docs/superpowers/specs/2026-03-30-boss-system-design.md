# EIDOS — Boss System Design Spec
**Fecha:** 2026-03-30
**Versión:** 1.0
**Estado:** Aprobado — listo para implementar
**Proyecto:** GER GREATNESS · Ciudad de México · 2026

---

## Contexto

El Boss System convierte las metas del usuario en enemigos a vencer. No es una lista de objetivos — es una batalla con HP, fases, ataques, consecuencias y recompensas. Sin riesgo no hay juego. Sin victoria no hay dopamina. El Boss System es la mecánica que hace que EIDOS se sienta como un RPG de vida real.

---

## Principio de Diseño

> El boss que escapa no es un fracaso — es progreso incompleto.
> La narrativa nunca castiga — interpreta.

---

## 1. Tipos de Boss

| | Boss Principal | Side Boss |
|---|---|---|
| **Origen** | Usuario crea o M02 genera | M02 genera automáticamente |
| **Duración** | 1 ciclo (2–4 semanas) | Largo plazo (meses) |
| **Activos simultáneos** | 1 a la vez | Hasta 3 |
| **XP al vencer** | Alto + desbloqueo especial | Medio + insignia de área |
| **Rotación** | Manual — usuario elige el siguiente | Persiste hasta vencerse |

### Ciclo de vida

```
APARECE          ACTIVO              RESULTADO
   │                │                   │
Declaración  →  En batalla  →   Derrotado ✓  o  Escapó ↗
(dramático)     (diario)        (recompensa)     (regresa debilitado)
```

### Side Bosses desde M02

Cuando el usuario define en Módulo 02 una visión de área, EIDOS genera el Side Boss automáticamente:

- Meta M02: *"Quiero tener $200K ahorrados en 2 años"*
- Side Boss generado: **EL FONDO INQUEBRANTABLE** · HP: 1,752 · Deadline: Marzo 2028

---

## 2. Fórmula de HP

```
HP = días_al_deadline × 40 × (brecha_de_área / 100)
```

**Brecha de área** = 100% − nivel actual del usuario en esa área

**Ejemplos:**

| Meta | Días | Área actual | HP resultante |
|---|---|---|---|
| Medio Maratón | 30 | 40% (brecha 60%) | 720 HP |
| Leer 12 libros | 90 | 70% (brecha 30%) | 1,080 HP |
| Ahorrar $50K | 180 | 50% (brecha 50%) | 3,600 HP |

El HP refleja la realidad del usuario: más brecha y más tiempo = boss más poderoso.

---

## 3. Sistema de Daño

### Ataques al boss

| Acción | Daño |
|---|---|
| Core attack (misión designada por EIDOS) | −20 HP |
| Misión del área relacionada | −5 HP |
| Racha activa (3–6 días) | ×1.2 multiplicador |
| Racha legendaria (7+ días) | ×1.5 multiplicador |

### El boss se recupera (consecuencias)

| Acción negativa | Boss recupera |
|---|---|
| Dormiste mal (registrado) | +15 HP |
| Comida chatarra (registrado) | +10 HP |
| Evadiste misión core | +20 HP |
| Sin misiones en 3 días (estancamiento) | +25 HP diario |

### Core attacks vs. ataques de área

- **Core attacks** (3–5): sugeridos por EIDOS al crear el boss, alta personalización. Daño fuerte.
- **Misiones de área**: cualquier misión del área relacionada al boss. Daño menor pero siempre contribuye.

---

## 4. Fases del Boss

| HP restante | Estado | Comportamiento |
|---|---|---|
| 100–70% | 😤 **DESAFIANTE** | Boss tauntea al usuario |
| 69–40% | 😠 **HERIDO** | Mensajes de desesperación |
| 39–10% | 🔥 **EN AGONÍA** | Mecánica especial activa |
| 9–0% | 💀 **DERROTADO** | Recompensa desbloqueada |

### Mecánica especial en agonía (39–10% HP)

Aparece una **misión crítica limitada** — una sola acción de alto impacto que puede terminar el boss antes de tiempo.

Ejemplo:
> *"Corre 10K este fin de semana. Si lo haces, el boss cae esta semana."*
> → −200 HP · Disponible solo 72 horas

---

## 5. Flujo de Creación de Boss

El momento de crear un boss se siente como **declarar guerra** — no como llenar un formulario.

### Paso 1 — Nombrar al enemigo

Usuario escribe en lenguaje natural. EIDOS genera un nombre dramático:

| Input del usuario | Nombre del boss |
|---|---|
| "Correr un medio maratón" | EL CORREDOR IMPARABLE |
| "Conseguir inversión" | LA RONDA SEMILLA |
| "Terminar mi tesis" | EL MANUSCRITO FINAL |
| "Mejorar con mi papá" | EL REENCUENTRO |
| "Ahorrar $50K" | EL FONDO INQUEBRANTABLE |

### Paso 2 — Deadline

Usuario selecciona fecha. EIDOS calcula HP automáticamente y lo muestra en tiempo real.

### Paso 3 — EIDOS sugiere ataques

EIDOS propone 3–5 core attacks basados en el área y la meta. Usuario puede ajustar.

### Paso 4 — El boss aparece

Pantalla de aparición dramática con:
- Nombre del boss en tipografía grande
- Barra de HP llena
- Frase de provocación personalizada
- CTA: *"Acepto el reto →"*

---

## 6. Estados del Personaje

El usuario también tiene estados que modifican el daño que hace:

| Estado | Cómo se activa | Efecto |
|---|---|---|
| 🔥 **En racha** | 3+ días consecutivos | ×1.2 daño |
| ⚡ **En flujo** | 3+ misiones completadas hoy | +bonus XP |
| 😴 **Fatigado** | Sueño malo registrado | −30% daño hoy |
| 💀 **Estancado** | Sin misiones 3+ días | Boss recupera HP diario |
| 🛡 **Recuperando** | Día de descanso activo | Protege racha de pérdida |

---

## 7. Eventos Aleatorios

Una vez por semana EIDOS introduce un evento que cambia las condiciones del juego. Representan la realidad entrando al juego — no son castigos.

**Estructura del evento:**

```
Situación → 3 opciones con trade-offs → Usuario elige → Consecuencia
```

**Ejemplos:**

| Evento | Opciones |
|---|---|
| "Semana de trabajo intenso detectada" | Defender racha / Ignorar / Contraatacar ×2 XP |
| "Clima adverso" | Misiones físicas valen doble / Tomar descanso activo |
| "7 días sin registrar" | Retomar con misión de re-entrada / El boss crece |
| "Tuviste conversación difícil" | +25 Courage XP automático |

---

## 8. Recompensas al Vencer

```
+XP masivo (sube nivel global del orbe)
+Stat boost permanente en el área del boss
+Insignia / título de identidad
+Misión legendaria desbloqueada
+Narrativa EIDOS personalizada
```

**Pantalla de victoria:**

```
⚡ BOSS DERROTADO

EL CORREDOR IMPARABLE

+340 XP
+15% Área Física
Insignia: "El que cumple" 🏅

DESBLOQUEO:
"Ultra trail 25K" — nueva misión legendaria

Narrativa:
"Dijiste que lo harías. Lo hiciste.
 Eso ya no te lo puede quitar nadie."
```

---

## 9. Consecuencias si el Boss Escapa

El boss no muere — **huye**. Regresa el siguiente ciclo con 30% menos HP.

```
💨 EL CORREDOR IMPARABLE ESCAPÓ

Regresa el próximo ciclo.
HP reducido: 846 → 592

"Escapé esta vez.
 Pero ya sé cómo te mueves."

Lo que sí ganaste:
+89 XP por el daño que le hiciste
+Dato: fallaste más en semana 2
```

El usuario siempre recibe XP proporcional al daño que hizo — incluso en derrota.

---

## 10. Widgets del Boss System

Cada elemento es un widget independiente reutilizable en dashboard, notificaciones y pantalla de boss:

| Widget | Qué muestra |
|---|---|
| `BossHPBar` | Barra de vida con porcentaje y fase |
| `BossTaunt` | Frase del boss según su fase actual |
| `StreakCounter` | Días de racha + multiplicador activo |
| `DamagePreview` | Daño estimado de las misiones de hoy |
| `EventAlert` | Evento aleatorio de la semana |
| `StateIndicator` | Estado actual del personaje (fatigado, en flujo, etc.) |
| `GolpeFinaleAlert` | Aparece solo cuando boss está en agonía |

---

## 11. Integración con Módulos EIDOS

| Módulo | Relación con Boss System |
|---|---|
| **M01 Identidad** | El nivel de área inicial determina la brecha → HP del boss |
| **M02 Visión de Vida** | Las metas por área generan Side Bosses automáticamente |
| **M03 Ejecución** | Las misiones diarias son los ataques al boss |
| **Narrativa dinámica** | Interpreta patrones de batalla en lenguaje natural |

---

## 12. Fuera del Alcance del MVP

- Boss multijugador (accountability con amigos)
- Boss compartido (equipo atacando el mismo boss)
- Marketplace de bosses predefinidos
- Boss generado por IA conversacional (post-tracción)

---

*EIDOS · Boss System Design Spec v1.0 · Confidencial · GER GREATNESS · 2026*
