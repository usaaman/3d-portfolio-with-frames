import Header from './components/Header';
import HeroAboutScroll from './components/HeroAboutScroll';
import './App.css';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <HeroAboutScroll />

        {/* placeholder so the page has somewhere to scroll to once the
            frame sequence finishes and the stage un-pins — remove/replace
            this section when Skills is built in the next phase */}
        <section className="next-section" id="skills">
          <p className="eyebrow">// next up</p>
          <h2>Skills section — phase 2</h2>
          <p>This is where the 50-skill scrolling marquee will go.</p>
        </section>
      </main>
    </>
  );
}
