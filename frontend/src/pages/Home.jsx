import { Link } from 'react-router-dom'
import { Brain, Target, Zap, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react'
import Footer from '../components/layout/Footer'

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white py-16 sm:py-20 md:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fadeIn">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              AI-Powered Learning
              <br className="hidden sm:block" />
              <span className="text-primary-200"> Journey Designer</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Personalized competency-based learning paths using generative AI and knowledge graphs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 group touch-target"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-800 transition-all duration-200 hover:shadow-lg border-2 border-primary-500 touch-target"
              >
                Sign In
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-primary-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                <span>100+ Competencies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to accelerate your learning journey
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-interactive">
              <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">AI-Powered</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Personalized explanations and recommendations using advanced AI
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-interactive">
              <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Competency Mapping</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Identify skill gaps and track your progress across 100+ competencies
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-interactive">
              <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Automated Paths</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Generate personalized learning journeys based on your goals
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-interactive">
              <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Monitor your learning journey with detailed analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="text-5xl sm:text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4 transition-transform group-hover:scale-110 duration-300">
                  1
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full -z-10 opacity-50 transition-all group-hover:scale-125 duration-300" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">Assess Your Skills</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take our AI-powered assessment to identify your current competency levels
              </p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="text-5xl sm:text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4 transition-transform group-hover:scale-110 duration-300">
                  2
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full -z-10 opacity-50 transition-all group-hover:scale-125 duration-300" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">Get Your Path</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive a personalized learning journey tailored to your goals
              </p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="text-5xl sm:text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4 transition-transform group-hover:scale-110 duration-300">
                  3
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full -z-10 opacity-50 transition-all group-hover:scale-125 duration-300" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">Learn & Grow</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Follow your path with curated resources and track your progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-indigo-700 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-white">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-8">
            Join thousands of learners transforming their careers with AI-powered personalized learning
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 group touch-target"
          >
            Get Started Now - It's Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home
