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
import WordWritePage from '@/pages/WordWrite'
import MoraCountPage from '@/pages/MoraCount'
import RomajiPage from '@/pages/Romaji'
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
import { daysUntilExam } from '@/content/ja/study-plan'

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

/**
 * Kenar çubuğunun dibindeki geri sayım.
 *
 * Ayrı bir bileşen çünkü her sayfada duruyor ve tarih değişimini kendi
 * hesaplıyor; App'i yeniden çizdirmeye gerek yok.
 */
function ExamCountdown() {
  const kalan = daysUntilExam()
  if (kalan < 0) return null
  return (
    <div className="nav-foot">
      <div className="nav-foot-num tabular">{kalan}</div>
      <div className="nav-foot-label">gün kaldı · JLPT N5</div>
    </div>
  )
}

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
        <Route path="/kelime-yazma" element={<WordWritePage />} />
        <Route path="/hece-sayma" element={<MoraCountPage />} />
        <Route path="/romaji" element={<RomajiPage />} />
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
          {/*
            Marka ve geri sayım YALNIZCA geniş ekranda görünür (CSS ile).
            Telefonda alt çubuk beş sekmelik bir şerittir, oraya sığmaz ve
            zaten gerekmez. Masaüstünde ise kenar çubuğunun üstü ve altı boş
            kalıyordu; oraya kimlik ve tempo bilgisi konuldu.
          */}
          <div className="nav-brand">
            <span className="nav-brand-mark ja">語</span>
            <span>
              <span className="nav-brand-name">Dilhane</span>
              <span className="nav-brand-sub">日本語</span>
            </span>
          </div>

          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <Icon name={n.icon} size={19} />
              <span>{n.label}</span>
            </NavLink>
          ))}

          <ExamCountdown />
        </nav>
      )}
    </div>
  )
}
