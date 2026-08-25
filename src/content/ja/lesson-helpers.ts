import type { Exercise } from '@/types'

// Ders dosyalarının ortak alıştırma kurucuları.
// Tek yerde durur ki id sayacı da tek olsun — id çakışması alıştırmanın
// iç durumunu sıfırlayan `key` mantığını bozar.

let n = 0
const eid = () => `ja-ex-${++n}`

export const ex = {
  mcq(
    prompt: string,
    options: string[],
    answer: number,
    explanation?: string,
    skill: Exercise['skill'] = 'reading',
  ): Exercise {
    return { id: eid(), type: 'mcq', prompt, options, answer, explanation, skill }
  },

  fill(prompt: string, sentence: string, answers: string[], translation?: string, hint?: string): Exercise {
    return { id: eid(), type: 'fill', prompt, sentence, answers, translation, hint, skill: 'grammar' }
  },

  dict(text: string, answers: string[], translation: string): Exercise {
    return {
      id: eid(),
      type: 'dictation',
      prompt: 'Dinle ve duyduğunu yaz.',
      text,
      lang: 'ja',
      answers,
      translation,
      skill: 'listening',
    }
  },

  speakEx(text: string, reading: string, tr: string): Exercise {
    return {
      id: eid(),
      type: 'speak',
      prompt: 'Mikrofona bas ve cümleyi söyle.',
      text,
      reading,
      lang: 'ja',
      tr,
      skill: 'speaking',
    }
  },

  order(prompt: string, tokens: string[], translation: string): Exercise {
    return { id: eid(), type: 'order', prompt, tokens, translation, skill: 'grammar' }
  },

  translate(
    source: string,
    answers: string[],
    direction: 'to-target' | 'to-tr',
    sourceReading?: string,
  ): Exercise {
    return {
      id: eid(),
      type: 'translate',
      prompt: direction === 'to-target' ? 'Japoncaya çevir.' : 'Türkçeye çevir.',
      source,
      sourceReading,
      answers,
      direction,
      skill: 'writing',
    }
  },

  writeEx(target: string, reading: string, tr?: string): Exercise {
    return { id: eid(), type: 'write', prompt: 'Karakteri çizerek yaz.', target, reading, tr, skill: 'writing' }
  },

  match(prompt: string, pairs: { left: string; right: string }[]): Exercise {
    return { id: eid(), type: 'match', prompt, pairs, skill: 'reading' }
  },
}
