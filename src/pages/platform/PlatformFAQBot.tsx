import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';
import FAQManager from '@/components/platform/FAQManager';
import FAQTestBot from '@/components/platform/FAQTestBot';
import { Bot, Settings } from 'lucide-react';

export default function PlatformFAQBot() {
  return (
    <PlatformPageWrapper title="FAQ Bot">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">FAQ Bot</h1>
          <p className="text-muted-foreground">
            Gerencie perguntas frequentes e teste o chatbot inteligente
          </p>
        </div>

        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Gerenciar FAQs
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Testar Bot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <FAQManager />
          </TabsContent>

          <TabsContent value="test">
            <FAQTestBot />
          </TabsContent>
        </Tabs>
      </div>
    </PlatformPageWrapper>
  );
}