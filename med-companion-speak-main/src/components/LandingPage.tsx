import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Shield, History, Heart, Mail, Phone, MapPin, Star, Users, Award, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import heroImage from '@/assets/medical-hero.jpg';
import AuthModal from './AuthModal';
import { useTranslation } from '@/contexts/I18nContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [activeTab, setActiveTab] = useState('home');
  const { t, language, setLanguage, availableLanguages } = useTranslation();

  const handleAuthSuccess = () => {
    setShowAuth(false);
    onGetStarted();
  };

  const openAuth = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'about', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial active tab
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/10">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MediChat AI
              </h1>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')} 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeTab === 'home' ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground'
                }`}
              >
                {t('home')}
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeTab === 'about' ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground'
                }`}
              >
                {t('about')}
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeTab === 'features' ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground'
                }`}
              >
                {t('features')}
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeTab === 'testimonials' ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground'
                }`}
              >
                {t('testimonials')}
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeTab === 'contact' ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground'
                }`}
              >
                {t('contact')}
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-36">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => openAuth('signin')}>
                {t('signIn')}
              </Button>
              <Button variant="medical" onClick={() => openAuth('register')}>
                {t('register')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('personalMedicalAssistant')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t('getInstantMedical')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="medical" 
                size="lg" 
                onClick={() => openAuth('register')}
                className="text-lg px-8 py-4"
              >
                {t('startConsultation')}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => openAuth('signin')}
                className="text-lg px-8 py-4"
              >
                {t('existingPatient')}
              </Button>
            </div>
          </div>
          <div className="lg:order-first">
            <img 
              src={heroImage} 
              alt="Medical AI Assistant" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20 bg-white/50 rounded-3xl mx-6 mb-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">{t('whyChoose')}</h3>
          <p className="text-xl text-muted-foreground">{t('whyChooseSub')}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center">
              <Languages className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">{t('featureMultiLangTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                {t('featureMultiLangDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
              <CardTitle className="text-xl">{t('featureSecureTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                {t('featureSecureDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center">
              <History className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">{t('featureHistoryTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                {t('featureHistoryDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-3xl font-bold">10,000+</h4>
              <p className="text-lg opacity-90">{t('statsPatientsServed')}</p>
            </div>
            <div>
              <Languages className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-3xl font-bold">5</h4>
              <p className="text-lg opacity-90">{t('statsLangsSupported')}</p>
            </div>
            <div>
              <Award className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-3xl font-bold">24/7</h4>
              <p className="text-lg opacity-90">{t('statsAvailableSupport')}</p>
            </div>
            <div>
              <CheckCircle className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-3xl font-bold">99.9%</h4>
              <p className="text-lg opacity-90">{t('statsUptime')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-bold mb-6">{t('aboutTitle')}</h3>
            <p className="text-lg text-muted-foreground mb-6">
              {t('aboutParagraph1')}
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              {t('aboutParagraph2')}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>{t('aboutPointReviewed')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>{t('aboutPointCultural')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>{t('aboutPointPrivacy')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>{t('aboutPointAlways')}</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8">
            <h4 className="text-2xl font-bold mb-4">{t('missionTitle')}</h4>
            <p className="text-muted-foreground mb-6">
              {t('missionDesc')}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-red-500" />
                <span className="font-medium">{t('missionPointCare')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Languages className="w-6 h-6 text-blue-500" />
                <span className="font-medium">{t('missionPointMulti')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-green-500" />
                <span className="font-medium">{t('missionPointSecure')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">{t('testimonialsTitle')}</h3>
            <p className="text-xl text-muted-foreground">{t('testimonialsSub')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t('testimonial1')}
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <p className="font-medium">{t('testimonial1Name')}</p>
                    <p className="text-sm text-muted-foreground">{t('testimonial1Location')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t('testimonial2')}
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <div>
                    <p className="font-medium">{t('testimonial2Name')}</p>
                    <p className="text-sm text-muted-foreground">{t('testimonial2Location')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  {t('testimonial3')}
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div>
                    <p className="font-medium">{t('testimonial3Name')}</p>
                    <p className="text-sm text-muted-foreground">{t('testimonial3Location')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">{t('contactTitle')}</h3>
          <p className="text-xl text-muted-foreground">{t('contactSub')}</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h4 className="text-2xl font-bold mb-6">{t('contactSupportTitle')}</h4>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('contactEmail')}</p>
                  <p className="text-muted-foreground">support@medichat-ai.cm</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('contactPhone')}</p>
                  <p className="text-muted-foreground">+237 XXX XXX XXX</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('contactAddress')}</p>
                  <p className="text-muted-foreground">Yaoundé, Cameroon</p>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold mb-4">{t('contactFormTitle')}</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contactFormName')}</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder={t('contactFormNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contactFormEmail')}</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder={t('contactFormEmailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contactFormMessage')}</label>
                  <textarea 
                    rows={4} 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder={t('contactFormMessagePlaceholder')}
                  />
                </div>
                <Button className="w-full" variant="medical">
                  {t('contactFormSubmit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-bold">MediChat AI</h3>
              </div>
              <p className="text-gray-400 mb-4">
                {t('footerIntro')}
              </p>
              <p className="text-sm text-gray-500">
                &copy; 2024 MediChat AI. {t('allRightsReserved')}
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">{t('footerServices')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>{t('serviceConsultation')}</li>
                <li>{t('serviceEducation')}</li>
                <li>{t('serviceAssessment')}</li>
                <li>{t('serviceMedication')}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">{t('footerLanguages')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>{t('langEnglish')}</li>
                <li>{t('langFrench')}</li>
                <li>{t('langEwondo')}</li>
                <li>{t('langDuala')}</li>
                <li>{t('langBassa')}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">{t('footerContact')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@medichat-ai.cm</li>
                <li>+237 XXX XXX XXX</li>
                <li>Yaoundé, Cameroon</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t('footerDisclaimer')}</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal 
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
};

export default LandingPage;