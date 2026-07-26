import Header from './components/Header';
import HeroAboutScroll from './components/HeroAboutScroll';
import SkillsMarquee from './components/SkillsMarquee';
import './App.css';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <HeroAboutScroll />
        <SkillsMarquee />
      </main>
    </>
  );
}
