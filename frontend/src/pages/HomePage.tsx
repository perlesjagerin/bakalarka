import { Link } from 'react-router-dom';
import { Calendar, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Rezervuj vstupenky na studentské akce
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Jednoduché a rychlé nakupování vstupenek na nejlepší studentské akce. 
            Rezervuj online, plať bezpečně a užívej si skvělé zážitky.
          </p>
          <Link to="/events" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
            Prohlédnout akce
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Proč si vybrat nás?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Snadná rezervace</h3>
              <p className="text-gray-600">
                Rezervujte si vstupenky několika kliknutími. Rychle, jednoduše a bez komplikací.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bezpečná platba</h3>
              <p className="text-gray-600">
                Všechny platby jsou šifrovány a zpracovávány přes Stripe. Vaše data jsou v bezpečí.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Okamžité potvrzení</h3>
              <p className="text-gray-600">
                Po dokončení platby obdržíte okamžitě potvrzení a rezervační kód emailem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Organizujete studentskou akci?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Registrujte se jako organizátor a začněte prodávat vstupenky na vaše akce.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Registrovat se jako organizátor
          </Link>
        </div>
      </section>
    </div>
  );
}
