import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import AboutGallerySlider from '@/components/AboutGallerySlider';
import ProjectShowcaseGrid from '@/components/ProjectShowcaseGrid';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { getAllProjects } from '@/lib/projects';
import { getGalleryPostsAction } from '@/actions/gallery.actions';
import { getHeroDataAction } from '@/actions/hero.actions';

export const revalidate = 60;

export default async function Home() {
  const [projects, galleryPosts, heroData] = await Promise.all([
    getAllProjects(),
    getGalleryPostsAction(),
    getHeroDataAction(),
  ]);

  return (
    <main>
      <Navbar />
      <Hero
        slides={heroData.slides}
        settings={heroData.settings}
        projects={projects}
      />
      <AboutSection />
      <AboutGallerySlider projects={projects} />
      <ProjectShowcaseGrid initialPosts={galleryPosts} limit={18} />
      <Testimonials />
      <Footer />
    </main>
  );
}
      