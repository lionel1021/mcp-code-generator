'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  title: string
  subtitle?: string
  options: {
    value: string
    label: string
    description?: string
  }[]
}

const questions: Question[] = [
  {
    id: 'roomType',
    title: 'Which room are you lighting?',
    subtitle: 'Select the space you want to improve',
    options: [
      { value: 'living', label: 'Living Room', description: 'Main gathering space' },
      { value: 'bedroom', label: 'Bedroom', description: 'Sleep & relaxation' },
      { value: 'kitchen', label: 'Kitchen', description: 'Cooking & dining' },
      { value: 'bathroom', label: 'Bathroom', description: 'Daily routines' },
      { value: 'office', label: 'Home Office', description: 'Work & study' },
      { value: 'hallway', label: 'Hallway', description: 'Transitional space' }
    ]
  },
  {
    id: 'roomSize',
    title: 'How large is your room?',
    subtitle: 'This helps us recommend the right lighting power',
    options: [
      { value: 'small', label: 'Small', description: 'Under 150 sq ft' },
      { value: 'medium', label: 'Medium', description: '150-300 sq ft' },
      { value: 'large', label: 'Large', description: 'Over 300 sq ft' }
    ]
  },
  {
    id: 'style',
    title: 'What\'s your style preference?',
    subtitle: 'Choose the aesthetic that appeals to you most',
    options: [
      { value: 'modern', label: 'Modern', description: 'Clean lines, minimalist' },
      { value: 'traditional', label: 'Traditional', description: 'Classic, timeless' },
      { value: 'industrial', label: 'Industrial', description: 'Raw, urban feel' },
      { value: 'scandinavian', label: 'Scandinavian', description: 'Light, natural' },
      { value: 'vintage', label: 'Vintage', description: 'Retro, nostalgic' },
      { value: 'minimalist', label: 'Minimalist', description: 'Simple, uncluttered' }
    ]
  },
  {
    id: 'budget',
    title: 'What\'s your budget range?',
    subtitle: 'We\'ll find options that fit your price point',
    options: [
      { value: 'low', label: '$50 - $150', description: 'Budget-friendly options' },
      { value: 'medium', label: '$150 - $300', description: 'Mid-range quality' },
      { value: 'high', label: '$300 - $500', description: 'Premium choices' },
      { value: 'premium', label: '$500 - $1000', description: 'High-end selection' },
      { value: 'luxury', label: '$1000+', description: 'Luxury fixtures' }
    ]
  },
  {
    id: 'currentLighting',
    title: 'Current lighting situation?',
    subtitle: 'Tell us what you\'re working with now',
    options: [
      { value: 'none', label: 'No lighting', description: 'Starting from scratch' },
      { value: 'overhead', label: 'Basic overhead', description: 'Standard ceiling light' },
      { value: 'mixed', label: 'Mixed lighting', description: 'Some existing fixtures' },
      { value: 'outdated', label: 'Outdated fixtures', description: 'Ready for replacement' }
    ]
  }
]

export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const canProceed = answers[currentQuestion.id]

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // TODO: Send answers to API and get recommendations
      console.log('Questionnaire answers:', answers)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirect to recommendations page
      const params = new URLSearchParams(answers)
      window.location.href = `/recommendations?${params.toString()}`
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      setIsLoading(false)
    }
  }

  const progressPercentage = ((currentStep + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">LightingPro</h1>
            </Link>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {questions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {currentQuestion.title}
            </CardTitle>
            {currentQuestion.subtitle && (
              <p className="text-gray-600 mt-2">{currentQuestion.subtitle}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all hover:shadow-md ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : isLastStep ? (
              <>
                Get Recommendations
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}