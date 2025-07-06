import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Zap, Target, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">LightingPro</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="outline">搜索产品</Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Find Perfect Lighting for Your Space
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get personalized lighting recommendations based on your room, style, and budget. 
            Our AI-powered tool helps you make the right choice every time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/questionnaire">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Zap className="mr-2 h-5 w-5" />
                Start Lighting Quiz
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Target className="mr-2 h-5 w-5" />
                Browse All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose LightingPro?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Smart Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions based on your specific needs, room type, and style preferences
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Curated Selection</CardTitle>
                <CardDescription>
                  Hand-picked lighting options from top brands with verified reviews and ratings
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Quick & Easy</CardTitle>
                <CardDescription>
                  Get personalized recommendations in under 2 minutes with our simple questionnaire
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Answer Questions</h4>
              <p className="text-gray-600">Tell us about your room, style, and budget</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Get Recommendations</h4>
              <p className="text-gray-600">See personalized lighting options matched to your needs</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Shop & Install</h4>
              <p className="text-gray-600">Purchase from trusted retailers with confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Space?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who found their perfect lighting
          </p>
          <Link href="/questionnaire">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lightbulb className="h-6 w-6" />
            <span className="text-lg font-semibold">LightingPro</span>
          </div>
          <p className="text-gray-400">
            © 2024 LightingPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
