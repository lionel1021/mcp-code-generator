import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Zap, Target, Star, Code, Cpu } from "lucide-react";
import ShareProject from "@/components/ShareProject";
import AchievementSystem from "@/components/AchievementSystem";
import FloatingShareButton from "@/components/FloatingShareButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">MCP AI Code Generator</h1>
            </div>
            <div className="flex items-center gap-4">
              <ShareProject trigger="button" className="hidden sm:flex" />
              <a
                href="https://github.com/lionel1021/mcp-code-generator"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            🤖 AI-Powered Code Generation Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Generate production-ready React components 10x faster with intelligent AI assistance. 
            Built on Model Context Protocol (MCP) for next-generation development workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/lionel1021/mcp-code-generator"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Code className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </a>
            <ShareProject trigger="button" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            🚀 Why Choose MCP AI Code Generator?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>AI-Powered Generation</CardTitle>
                <CardDescription>
                  Generate React components, hooks, and APIs with intelligent AI assistance using Model Context Protocol
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>10x Development Speed</CardTitle>
                <CardDescription>
                  Create production-ready TypeScript components in seconds instead of minutes
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Cpu className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Smart Code Analysis</CardTitle>
                <CardDescription>
                  Automated quality assessment, performance optimization, and best practice enforcement
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
            🛠️ How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Describe Component</h4>
              <p className="text-gray-600">Tell the AI what component you need - button, form, modal, etc.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">AI Generates Code</h4>
              <p className="text-gray-600">Get production-ready React/TypeScript code with best practices</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Copy & Deploy</h4>
              <p className="text-gray-600">Integrate into your project and deploy with confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement System Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AchievementSystem />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            🚀 Ready to Supercharge Your Development?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join the AI revolution and boost your coding productivity by 10x
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/lionel1021/mcp-code-generator"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Star className="mr-2 h-5 w-5" />
                Star on GitHub
              </Button>
            </a>
            <ShareProject trigger="button" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-6 w-6" />
            <span className="text-lg font-semibold">MCP AI Code Generator</span>
          </div>
          <p className="text-gray-400 mb-6">
            Revolutionary AI-powered code generation platform built with Model Context Protocol
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <a href="https://github.com/lionel1021/mcp-code-generator" className="hover:text-white" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://github.com/lionel1021/mcp-code-generator/issues" className="hover:text-white" target="_blank" rel="noopener noreferrer">
              Issues
            </a>
            <a href="https://github.com/lionel1021/mcp-code-generator/blob/main/CONTRIBUTING.md" className="hover:text-white" target="_blank" rel="noopener noreferrer">
              Contributing
            </a>
            <a href="https://github.com/lionel1021/mcp-code-generator/blob/main/ROADMAP.md" className="hover:text-white" target="_blank" rel="noopener noreferrer">
              Roadmap
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
            © 2025 MCP AI Code Generator. MIT License. Built with ❤️ for developers.
          </div>
        </div>
      </footer>

      {/* Floating Share Button */}
      <FloatingShareButton />
    </div>
  );
}
