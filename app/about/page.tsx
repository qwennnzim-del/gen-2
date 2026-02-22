'use client';

import Link from 'next/link';
import { ArrowLeft, Github, Instagram, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="h-[100dvh] overflow-y-auto custom-scrollbar bg-[#101010] text-gray-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Chat</span>
        </Link>

        <article>
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight text-gray-100">
              Membangun Masa Depan AI dari Bangku Sekolah
            </h1>
            
            <div className="flex items-center gap-4 text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0">
                MF
              </div>
              <div>
                <div className="text-white font-medium">M Fariz Alfauzi</div>
                <div className="text-sm">CEO & Founder Gen2 AI • 17 Tahun</div>
              </div>
            </div>
          </header>

          <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
            <p>
              Halo! Saya Fariz, seorang pengembang perangkat lunak berusia 17 tahun dan siswa di 
              <strong className="text-white font-semibold"> SMK Nurul Islam Affandiyah</strong>, Cianjur, Jawa Barat.
            </p>
            <p>
              Lahir pada tanggal 8 Agustus 2008, saya memiliki passion yang mendalam dalam dunia teknologi, 
              khususnya kecerdasan buatan (AI) dan pengembangan web. Gen2 AI adalah salah satu proyek 
              ambisius saya untuk menghadirkan pengalaman chatbot AI yang canggih dan responsif.
            </p>
            <p>
              Sebagai CEO dari Gen2, visi saya adalah menciptakan solusi teknologi yang tidak hanya canggih 
              secara teknis, tetapi juga bermanfaat dan mudah digunakan oleh semua orang. Saya percaya bahwa 
              inovasi tidak mengenal batas usia, dan dari bangku sekolah pun kita bisa menciptakan sesuatu 
              yang berdampak besar.
            </p>
            <p>
              Proyek Gen2 ini dibangun menggunakan teknologi modern seperti Next.js, Tailwind CSS, dan 
              diotaki oleh model bahasa canggih dari Google Gemini. Fokus utamanya adalah kecepatan, 
              kenyamanan antarmuka, dan akurasi informasi yang diberikan kepada pengguna.
            </p>
          </div>

          <hr className="border-white/10 my-12" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-400">
              Mari terhubung dan berkolaborasi:
            </div>
            <div className="flex gap-4">
              <a 
                href="https://github.com/mfarizalfauzi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-[#171717] rounded-full hover:bg-[#212121] transition-colors text-gray-400 hover:text-white border border-white/5"
                title="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://instagram.com/mfarizalfauzi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-[#171717] rounded-full hover:bg-[#212121] transition-colors text-gray-400 hover:text-white border border-white/5"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="mailto:contact@gen2-ai.app" 
                className="p-3 bg-[#171717] rounded-full hover:bg-[#212121] transition-colors text-gray-400 hover:text-white border border-white/5"
                title="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </article>

        <footer className="mt-20 text-center text-gray-600 text-sm pb-8">
          <p>&copy; {new Date().getFullYear()} Gen2 AI. Developed by M Fariz Alfauzi.</p>
        </footer>
      </div>
    </div>
  );
}
