'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  BookOpen, 
  Github, 
  Zap, 
  Brain, 
  Calendar,
  FileText,
  Trophy,
  GraduationCap,
  TrendingUp
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    thisWeek: 0,
    currentStreak: 0,
    categories: 0,
  });

  useEffect(() => {
    // Load stats (placeholder for now)
    setStats({
      totalPosts: 12,
      thisWeek: 3,
      currentStreak: 5,
      categories: 8,
    });
  }, []);

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Today I Learned",
      description: "Quick technical notes and discoveries",
      count: "5 entries",
      color: "from-blue-500 to-blue-600",
      href: "/viewer?type=til"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Daily Journal",
      description: "Personal reflections and daily thoughts",
      count: "3 entries",
      color: "from-green-500 to-green-600",
      href: "/viewer?type=journal"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Dev Blog",
      description: "In-depth technical articles",
      count: "2 entries",
      color: "from-purple-500 to-purple-600",
      href: "/viewer?type=blog"
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "100 Days of Code",
      description: "Daily coding challenge progress",
      count: "1 entry",
      color: "from-red-500 to-red-600",
      href: "/viewer?type=100days"
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Learning Log",
      description: "Course progress and study notes",
      count: "1 entry",
      color: "from-orange-500 to-orange-600",
      href: "/viewer?type=learning"
    }
  ];

  return (
    <div className="page-home min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Life
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              Your personal knowledge repository with a beautiful markdown editor and intelligent viewer
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/editor"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <PenTool className="h-5 w-5 mr-2" />
                Start Writing
              </Link>
              <Link
                href="/viewer"
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                View Posts
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Posts", value: stats.totalPosts, icon: <FileText className="h-6 w-6" /> },
            { label: "This Week", value: stats.thisWeek, icon: <Calendar className="h-6 w-6" /> },
            { label: "Current Streak", value: stats.currentStreak, icon: <TrendingUp className="h-6 w-6" /> },
            { label: "Categories", value: stats.categories, icon: <Brain className="h-6 w-6" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
                <div className="text-blue-500">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group block"
            >
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {feature.description}
                </p>
                <div className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  {feature.count}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <Link
          href="/editor"
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
          title="Write New Post"
        >
          <PenTool className="h-6 w-6" />
        </Link>
        <Link
          href="/viewer"
          className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
          title="View All Posts"
        >
          <BookOpen className="h-5 w-5" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            "Learning in public - one commit at a time" 🌱
          </p>
          <div className="flex justify-center items-center gap-6">
            <a
              href="https://github.com/aniketpr01/life"
              className="flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </a>
            <span className="text-gray-400">|</span>
            <Link href="/viewer" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              All Posts
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}