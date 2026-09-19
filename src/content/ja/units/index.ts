import { u1 } from './u1'
import { u2 } from './u2'
import { u3 } from './u3'
import { u4 } from './u4'
import { u5 } from './u5'
import { u6 } from './u6'
import { u7 } from './u7'
import { u8 } from './u8'
import { u9 } from './u9'
import { u10 } from './u10'
import type { Unit } from './types'

/**
 * Ünite sırası KONUYA göre, ders kitabı sırasına göre değil.
 *
 * Dizilim standart başlangıç müfredatlarıyla (Minna no Nihongo I, Genki I)
 * ve N5'in kapsadığı günlük durumlarla örtüşüyor: tanışma → eşyalar →
 * saat ve program → alışveriş → yer bildirme → gidiş geliş → betimleme →
 * geçmiş → te formu → istek ve öneri.
 *
 * Sıra rastgele değil: her ünite bir öncekinin yapısını kullanıyor.
 * 3. ünitedeki ます biçimi olmadan 6. ünitedeki hareket fiilleri, 7.
 * ünitedeki sıfatlar olmadan 8. ünitedeki geçmiş çekimi anlatılamaz.
 */
export const UNITS: Unit[] = [u1, u2, u3, u4, u5, u6, u7, u8, u9, u10]

export const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]))

export type { Unit } from './types'
export type { UnitGrammar, UnitHomework, UnitLine, UnitRule, UnitText, UnitVocab } from './types'
