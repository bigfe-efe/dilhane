import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '@/components/icons'
import Home from '@/pages/Home'
import KanaPage from '@/pages/Kana'
import WritingSystemPage from '@/pages/WritingSystem'
import KanaSpeedPage from '@/pages/KanaSpeed'
import KanaQuizPage from '@/pages/KanaQuiz'
import KanaExamPage from '@/pages/KanaExam'
import KatakanaWordsPage from '@/pages/KatakanaWords'
import RoadmapPage from '@/pages/Roadmap'
import KanaRulesPage from '@/pages/KanaRules'
import KanaRuleTestPage from '@/pages/KanaRuleTest'
import ResourcesPage from '@/pages/Resources'
import N5MockPage from '@/pages/N5Mock'
import PracticePage from '@/pages/Practice'
import KanaWordsPage from '@/pages/KanaWords'
import VocabPage from '@/pages/Vocab'
import LeechesPage from '@/pages/Leeches'
import N5Page from '@/pages/N5'
import KanjiPage from '@/pages/Kanji'
import LessonsPage from '@/pages/Lessons'
import LessonPlayer from '@/pages/LessonPlayer'
import ReviewPage from '@/pages/Review'
import GrammarPage from '@/pages/Grammar'
import GrammarDetail from '@/pages/GrammarDetail'
import DictionaryPage from '@/pages/Dictionary'
import VerbsPage from '@/pages/Verbs'
import WritePage from '@/pages/Write'
import SpeakPage from '@/pages/Speak'
import WritingPage from '@/pages/Writing'
import StatsPage from '@/pages/Stats'
import SettingsPage from '@/pages/Settings'
import MorePage from '@/pages/More'

// Uygulama tek dillidir (Japonca), bu yüzden rotalarda dil parametresi yoktur.
// Eskiden /lessons/:lang gibi yollar vardı; ikinci dil kaldırılınca sadeleşti.

// Alt gezinme, GÜNLÜK yapılan işlere göre dizilir — kavramsal olarak düzgün
// görünen bir sıralamaya göre değil.
//
// Önceki sürümde burada "Rota" vardı ve kana araçları menüden çıkarılmıştı;
// sonuç: her gün kullanılan alıştırmalara ulaşmak dört tık sürüyordu. Rota
// haftalık bakılan bir şey, alıştırma ise günlük. O yüzden yer değiştirdiler:
// Rota artık ana sayfadaki karttan ve Çalış sekmesinden açılıyor.
const NAV: { to: string; icon: IconName; label: string; end?: boolean }[] = [
  { to: '/', icon: 'home', label: 'Bugün', end: true },
  { to: '/calis', icon: 'grid', label: 'Çalış' },
  { to: '/lessons', icon: 'book', label: 'Dersler' },
  { to: '/review', icon: 'repeat', label: 'Tekrar' },
  { to: '/more', icon: 'more', label: 'Daha' },
]

export default function App() {
  const { pathname } = useLocation()
  // Ders oynatıcısı ve tam ekran alıştırmalarda alt gezinme gizlenir
  const immersive = pathname.startsWith('/lesson/')

  return (
    <div className="app" style={immersive ? { paddingBottom: 0 } : undefined}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/yazi-sistemi" element={<WritingSystemPage />} />
        <Route path="/n5" element={<N5Page />} />
        <Route path="/kana/:type" element={<KanaPage />} />
        <Route path="/kana-kurallar" element={<KanaRulesPage />} />
        <Route path="/kural-testi" element={<KanaRuleTestPage />} />
        <Route path="/kaynaklar" element={<ResourcesPage />} />
        <Route path="/n5-deneme" element={<N5MockPage />} />
        <Route path="/kana-hiz" element={<KanaSpeedPage />} />
        <Route path="/kana-test" element={<KanaQuizPage />} />
        <Route path="/hiragana-sinav" element={<KanaExamPage kana="hiragana" />} />
        <Route path="/katakana-sinav" element={<KanaExamPage kana="katakana" />} />
        <Route path="/katakana-kelime" element={<KatakanaWordsPage />} />
        <Route path="/rota" element={<RoadmapPage />} />
        <Route path="/calis" element={<PracticePage />} />
        <Route path="/kana-kelime" element={<KanaWordsPage />} />
        <Route path="/kelimeler" element={<VocabPage />} />
        <Route path="/kanji" element={<KanjiPage />} />

        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lesson/:id" element={<LessonPlayer />} />

        <Route path="/review" element={<ReviewPage />} />
        <Route path="/zorlandiklarim" element={<LeechesPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/grammar/:id" element={<GrammarDetail />} />
        <Route path="/dictionary" element={<DictionaryPage />} />
        <Route path="/verbs" element={<VerbsPage />} />

        <Route path="/write" element={<WritePage />} />
        <Route path="/speak" element={<SpeakPage />} />
        <Route path="/writing" element={<WritingPage />} />

        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/more" element={<MorePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!immersive && (
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <Icon name={n.icon} size={19} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
