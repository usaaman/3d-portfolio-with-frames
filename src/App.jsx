import Header from './components/Header';
import HeroAboutScroll from './components/HeroAboutScroll';
import Projects from './components/Projects';
import Services from './components/Services';
import Contact from './components/Contact';
import './App.css';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <HeroAboutScroll />
        <Projects />
        <Services />
        <Contact />
      </main>
    </>
  );
}
