import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Github, Instagram, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#101010] text-gray-100 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Chat</span>
        </Link>

        <div className="bg-[#171717] rounded-3xl p-8 border border-white/5 shadow-xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image Placeholder */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shrink-0">
              MF
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">M Fariz Alfauzi</h1>
              <p className="text-blue-400 font-medium mb-4">CEO & Founder Gen2 AI</p>
              
              <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                <p>
                  Halo! Saya Fariz, seorang pengembang perangkat lunak berusia 17 tahun dan siswa di 
                  <span className="text-white font-semibold"> SMK Nurul Islam Affandiyah</span>, Cianjur, Jawa Barat.
                </p>
                <p>
                  Lahir pada tanggal 8 Agustus 2008, saya memiliki passion yang mendalam dalam dunia teknologi, 
                  khususnya kecerdasan buatan (AI) dan pengembangan web. Gen2 AI adalah salah satu proyek 
                  ambisius saya untuk menghadirkan pengalaman chatbot AI yang canggih dan responsif.
                </p>
                <p>
                  Sebagai CEO dari Gen2, visi saya adalah menciptakan solusi teknologi yang tidak hanya canggih 
                  secara teknis, tetapi juga bermanfaat dan mudah digunakan oleh semua orang.
                </p>
              </div>

              <div className="mt-8 flex gap-4">
                <a 
                  href="https://github.com/mfarizalfauzi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-[#212121] rounded-full hover:bg-[#303030] transition-colors text-gray-400 hover:text-white"
                  title="GitHub"
                >
                  <Github size={20} />
                </a>
                <a 
                  href="https://instagram.com/mfarizalfauzi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-[#212121] rounded-full hover:bg-[#303030] transition-colors text-gray-400 hover:text-white"
                  title="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="mailto:contact@gen2-ai.app" 
                  className="p-3 bg-[#212121] rounded-full hover:bg-[#303030] transition-colors text-gray-400 hover:text-white"
                  title="Email"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Gen2 AI. Developed by M Fariz Alfauzi.</p>
        </footer>
      </div>
    </div>
  );
}
