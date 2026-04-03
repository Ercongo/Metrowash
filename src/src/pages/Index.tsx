import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import BookingCalendar from "@/components/BookingCalendar";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Services />
      <BookingCalendar />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
