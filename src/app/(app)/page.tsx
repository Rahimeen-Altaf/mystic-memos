"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import messages from "@/data/messages.json";
import Autoplay from "embla-carousel-autoplay";
import { Mail } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Main content */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-12 py-8 bg-gradient-to-b from-gray-800 to-gray-900 text-white">
          <section className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Share Your Thoughts, Stay in the Shadows
            </h1>
            <p className="mt-3 md:mt-5 text-base md:text-xl max-w-lg mx-auto text-gray-300">
              MysticMemos—A realm where your identity remains hidden, but your
              words shine bright.
            </p>
          </section>

          {/* Carousel for Messages */}
          <Carousel
            plugins={[Autoplay({ delay: 2500 })]}
            className="w-full max-w-lg md:max-w-2xl"
          >
            <CarouselContent>
              {messages.map((message, index) => (
                <CarouselItem key={index} className="p-4">
                  <Card className="bg-gray-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-indigo-300">
                        {message.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                      <Mail className="text-indigo-400 flex-shrink-0" />
                      <div>
                        <p className="text-base text-gray-200">
                          {message.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          {message.received}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </main>

        {/* Footer */}
        <footer className="text-center p-4 md:p-6 bg-gray-900 text-gray-400">
          © 2024 MysticMemos. Speak freely, stay anonymous.
        </footer>
      </div>
    </>
  );
}
