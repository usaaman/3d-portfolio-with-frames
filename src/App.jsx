import Header from './components/Header';
import HeroAboutScroll from './components/HeroAboutScroll';
import Projects from './components/Projects';
import './App.css';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <HeroAboutScroll />
        <Projects />
      </main>
    </>
  );
}
