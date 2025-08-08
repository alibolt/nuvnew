'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIDescriptionGeneratorProps {
  productName: string;
  productType: string;
  onGenerated: (description: string) => void;
}

export function AIDescriptionGenerator({ 
  productName, 
  productType, 
  onGenerated 
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'enthusiastic'>('professional');

  const generateDescription = async () => {
    if (!productName) {
      toast.error('Please enter a product name first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call Groq API for real AI generation
      const response = await fetch('/api/ai/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'product_description',
          prompt: productName,
          data: {
            productType,
            keywords,
            tone
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      const description = data.data?.result || data.result;
      
      if (description) {
        onGenerated(description);
        toast.success('AI generated description successfully!');
      } else {
        throw new Error('No description generated');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback to local generation if API fails
      const descriptions = {
        professional: `Introducing the ${productName}, a premium ${productType} designed for discerning customers who value quality and performance. ${keywords ? `Featuring ${keywords}, this product` : 'This product'} delivers exceptional value and reliability. Crafted with attention to detail, it meets the highest standards of excellence.`,
        casual: `Meet the ${productName} - your new favorite ${productType}! ${keywords ? `With ${keywords}, it's` : "It's"} exactly what you've been looking for. Easy to use, reliable, and just plain awesome. You're going to love it!`,
        enthusiastic: `🎉 Get ready for the amazing ${productName}! This incredible ${productType} will blow your mind! ${keywords ? `Packed with ${keywords}, it` : 'It'} delivers an experience like no other. Don't miss out on this game-changing product that everyone's talking about!`
      };
      
      onGenerated(descriptions[tone]);
      toast.info('Using fallback description (API unavailable)');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-medium">AI Description Generator</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="keywords" className="text-sm">Keywords (optional)</Label>
          <Textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., eco-friendly, durable, modern design"
            rows={2}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label className="text-sm">Tone</Label>
          <div className="flex gap-2 mt-1">
            {(['professional', 'casual', 'enthusiastic'] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={tone === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTone(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
        
        <Button
          type="button"
          onClick={generateDescription}
          disabled={isGenerating || !productName}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Description
            </>
          )}
        </Button>
      </div>
    </div>
  );
}