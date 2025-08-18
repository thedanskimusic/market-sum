import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NewsArticle } from '@/types/market.types';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor() {}
    // TODO: Use configService for RSS feed URLs
    // For now, we use hardcoded URLs but could move to config

  async getLatestNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      this.logger.log('Fetching latest news from multiple sources');
      
      // Try multiple news sources for better reliability
      const newsSources = [
        {
          name: 'MarketWatch',
          url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
          parser: 'marketwatch'
        },
        {
          name: 'CNBC',
          url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
          parser: 'cnbc'
        },
        {
          name: 'Bloomberg',
          url: 'https://feeds.bloomberg.com/markets/news.rss',
          parser: 'bloomberg'
        },
        {
          name: 'Financial Times',
          url: 'https://www.ft.com/rss/home',
          parser: 'ft'
        }
      ];

      const allArticles: NewsArticle[] = [];
      
      // Fetch from all sources concurrently
      const promises = newsSources.map(async (source) => {
        try {
          const response = await axios.get(source.url, {
            timeout: 8000,
            headers: {
              'User-Agent': 'Market-Sum-News-Bot/1.0',
            },
          });
          
          const articles = this.parseRSSFeed(response.data as string, Math.ceil(limit / newsSources.length), source.parser);
          articles.forEach(article => {
            article.source = source.name;
          });
          
          return articles;
        } catch (error: any) {
          this.logger.warn(`Failed to fetch from ${source.name}:`, error.message);
          return [];
        }
      });

      const results = await Promise.all(promises);
      
      // Combine all articles and sort by date
      results.forEach(articles => {
        allArticles.push(...articles);
      });
      
      // Sort by date (newest first) and limit
      const sortedArticles = allArticles
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, limit);
      
      this.logger.log(`Successfully fetched ${sortedArticles.length} news articles from ${results.filter(r => r.length > 0).length} sources`);
      return sortedArticles;
      
    } catch (error) {
      this.logger.error('Failed to fetch news from all sources', error);
      
      // Return mock data as fallback
      return this.getMockNews(limit);
    }
  }

  async searchNews(query: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      this.logger.log(`Searching news for query: ${query}`);
      
      const allNews = await this.getLatestNews(100); // Get more articles for search
      
      // Simple text search in title and summary
      const filteredNews = allNews.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase())
      );

      return filteredNews.slice(0, limit);
      
    } catch (error) {
      this.logger.error('Failed to search news', error);
      return [];
    }
  }

  async getNewsByCategory(category: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      this.logger.log(`Fetching news for category: ${category}`);
      
      // Special handling for Australian news
      if (category === 'australian') {
        return this.getAustralianNews(limit);
      }
      
      // Get all news and filter by category
      const allNews = await this.getLatestNews(100); // Get more articles for filtering
      
      // Filter articles based on category keywords
      const categoryKeywords = {
        business: ['business', 'corporate', 'company', 'earnings', 'revenue', 'profit'],
        technology: ['tech', 'technology', 'software', 'ai', 'artificial intelligence', 'digital', 'startup'],
        markets: ['market', 'stock', 'trading', 'investor', 'portfolio', 's&p', 'nasdaq', 'dow'],
        economy: ['economy', 'economic', 'gdp', 'inflation', 'federal reserve', 'interest rate', 'employment'],
      };
      
      const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || categoryKeywords.business;
      
      const filteredNews = allNews.filter(article => {
        const text = (article.title + ' ' + article.summary).toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
      });
      
      this.logger.log(`Successfully filtered ${filteredNews.length} articles for category: ${category}`);
      return filteredNews.slice(0, limit);
      
    } catch (error) {
      this.logger.error(`Failed to fetch news for category: ${category}`, error);
      return this.getMockNews(limit);
    }
  }

  async getAustralianNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      this.logger.log('Fetching Australian financial news');
      
      // Australian news sources
      const australianSources = [
        {
          name: 'ABC Business',
          url: 'https://www.abc.net.au/news/feed/45910/rss.xml',
          parser: 'abc'
        },
        {
          name: 'AFR',
          url: 'https://www.afr.com/rss.xml',
          parser: 'afr'
        },
        {
          name: 'SMH Business',
          url: 'https://www.smh.com.au/business/rss.xml',
          parser: 'smh'
        }
      ];

      const allArticles: NewsArticle[] = [];
      
      // Fetch from Australian sources concurrently
      const promises = australianSources.map(async (source) => {
        try {
          const response = await axios.get(source.url, {
            timeout: 8000,
            headers: {
              'User-Agent': 'Market-Sum-News-Bot/1.0',
            },
          });
          
          const articles = this.parseRSSFeed(response.data as string, Math.ceil(limit / australianSources.length), source.parser);
          articles.forEach(article => {
            article.source = source.name;
            // Add Australian flag to titles
            article.title = `🇦🇺 ${article.title}`;
          });
          
          return articles;
        } catch (error: any) {
          this.logger.warn(`Failed to fetch from ${source.name}:`, error.message);
          return [];
        }
      });

      const results = await Promise.all(promises);
      
      // Combine all articles and sort by date
      results.forEach(articles => {
        allArticles.push(...articles);
      });
      
      // Sort by date (newest first) and limit
      const sortedArticles = allArticles
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, limit);
      
      this.logger.log(`Successfully fetched ${sortedArticles.length} Australian news articles`);
      return sortedArticles;
      
    } catch (error) {
      this.logger.error('Failed to fetch Australian news', error);
      return this.getMockAustralianNews(limit);
    }
  }

  private parseRSSFeed(xmlData: string, limit: number, sourceType: string = 'default'): NewsArticle[] {
    try {
      const articles: NewsArticle[] = [];
      
      // Different regex patterns for different RSS feed formats
      const patterns = {
        default: {
          item: /<item>([\s\S]*?)<\/item>/g,
          title: /<title>([\s\S]*?)<\/title>/,
          description: /<description>([\s\S]*?)<\/description>/,
          link: /<link>([\s\S]*?)<\/link>/,
          pubDate: /<pubDate>([\s\S]*?)<\/pubDate>/,
        },
        marketwatch: {
          item: /<item>([\s\S]*?)<\/item>/g,
          title: /<title>([\s\S]*?)<\/title>/,
          description: /<description>([\s\S]*?)<\/description>/,
          link: /<link>([\s\S]*?)<\/link>/,
          pubDate: /<pubDate>([\s\S]*?)<\/pubDate>/,
        },
        cnbc: {
          item: /<item>([\s\S]*?)<\/item>/g,
          title: /<title>([\s\S]*?)<\/title>/,
          description: /<description>([\s\S]*?)<\/description>/,
          link: /<link>([\s\S]*?)<\/link>/,
          pubDate: /<pubDate>([\s\S]*?)<\/pubDate>/,
        },
        bloomberg: {
          item: /<item>([\s\S]*?)<\/item>/g,
          title: /<title>([\s\S]*?)<\/title>/,
          description: /<description>([\s\S]*?)<\/description>/,
          link: /<link>([\s\S]*?)<\/link>/,
          pubDate: /<pubDate>([\s\S]*?)<\/pubDate>/,
        },
        ft: {
          item: /<item>([\s\S]*?)<\/item>/g,
          title: /<title>([\s\S]*?)<\/title>/,
          description: /<description>([\s\S]*?)<\/description>/,
          link: /<link>([\s\S]*?)<\/link>/,
          pubDate: /<pubDate>([\s\S]*?)<\/pubDate>/,
        },
        abc: {
          item: /<item>([\s\S]*?)<\/item>/g,
          title: /<title>([\s\S]*?)<\/title>/,
          description: /<description>([\s\S]*?)<\/description>/,
          link: /<link>([\s\S]*?)<\/link>/,
          pubDate: /<pubDate>([\s\S]*?)<\/pubDate>/,
        },
        afr: {
          item: /<item>([\s\S]*?)<\/item>/g,
          title: /<title>([\s\S]*?)<\/title>/,
          description: /<description>([\s\S]*?)<\/description>/,
          link: /<link>([\s\S]*?)<\/link>/,
          pubDate: /<pubDate>([\s\S]*?)<\/pubDate>/,
        },
        smh: {
          item: /<item>([\s\S]*?)<\/item>/g,
          title: /<title>([\s\S]*?)<\/title>/,
          description: /<description>([\s\S]*?)<\/description>/,
          link: /<link>([\s\S]*?)<\/link>/,
          pubDate: /<pubDate>([\s\S]*?)<\/pubDate>/,
        }
      };
      
      const pattern = patterns[sourceType as keyof typeof patterns] || patterns.default;
      
      let match;
      let count = 0;
      
      while ((match = pattern.item.exec(xmlData)) !== null && count < limit) {
        const itemContent = match[1];
        
        const titleMatch = itemContent.match(pattern.title);
        const descriptionMatch = itemContent.match(pattern.description);
        const linkMatch = itemContent.match(pattern.link);
        const pubDateMatch = itemContent.match(pattern.pubDate);
        
        if (titleMatch && descriptionMatch && linkMatch) {
          const title = this.cleanHtml(titleMatch[1]);
          const summary = this.cleanHtml(descriptionMatch[1]);
          const url = linkMatch[1];
          const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
          
          // Skip articles that are too old (older than 7 days)
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          if (publishedAt < sevenDaysAgo) continue;
          
          // Simple sentiment analysis based on keywords
          const sentiment = this.analyzeSentiment(title + ' ' + summary);
          
          articles.push({
            id: `${sourceType}-${count}-${Date.now()}`,
            title,
            summary,
            content: summary, // For RSS, content is same as summary
            url,
            source: sourceType.charAt(0).toUpperCase() + sourceType.slice(1),
            publishedAt,
            tags: this.extractTags(title + ' ' + summary),
            sentiment,
          });
          
          count++;
        }
      }
      
      return articles;
      
    } catch (error) {
      this.logger.error(`Failed to parse RSS feed for ${sourceType}`, error);
      return [];
    }
  }

  private cleanHtml(html: string): string {
    // Remove HTML tags and decode entities
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x2014;/g, '—') // em dash
      .replace(/&#x2019;/g, '') // right single quotation mark
      .replace(/&#x2018;/g, '') // left single quotation mark
      .replace(/&#x201c;/g, '"') // left double quotation mark
      .replace(/&#x201d;/g, '"') // right double quotation mark
      .replace(/&#x2026;/g, '…') // ellipsis
      .trim();
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['gain', 'rise', 'up', 'positive', 'growth', 'profit', 'surge', 'rally', 'boost', 'strong'];
    const negativeWords = ['fall', 'drop', 'down', 'negative', 'loss', 'decline', 'crash', 'plunge', 'weak', 'concern'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Extract company names (simple approach)
    const companies = ['apple', 'microsoft', 'google', 'amazon', 'tesla', 'meta', 'netflix', 'nvidia', 'amd', 'intel'];
    companies.forEach(company => {
      if (lowerText.includes(company)) {
        tags.push(company);
      }
    });
    
    // Extract market indices
    const indices = ['s&p 500', 'nasdaq', 'dow jones', 'asx 200', 'ftse 100'];
    indices.forEach(index => {
      if (lowerText.includes(index)) {
        tags.push(index);
      }
    });
    
    // Extract currencies
    const currencies = ['usd', 'eur', 'gbp', 'jpy', 'aud', 'cad'];
    currencies.forEach(currency => {
      if (lowerText.includes(currency)) {
        tags.push(currency);
      }
    });
    
    return tags;
  }

  private getMockNews(limit: number): NewsArticle[] {
    const mockArticles: NewsArticle[] = [
      {
        id: 'mock-1',
        title: 'Markets Rally on Positive Economic Data',
        summary: 'Global markets showed strong gains today following better-than-expected economic indicators.',
        content: 'Global markets showed strong gains today following better-than-expected economic indicators. The S&P 500 rose 1.2% while the NASDAQ gained 1.8%.',
        url: 'https://example.com/news/1',
        source: 'Yahoo Finance',
        publishedAt: new Date(),
        author: 'Financial Reporter',
        tags: ['markets', 's&p 500', 'nasdaq'],
        sentiment: 'positive',
      },
      {
        id: 'mock-2',
        title: 'Tech Stocks Face Pressure from Regulatory Concerns',
        summary: 'Technology companies saw mixed trading as investors weighed regulatory risks.',
        content: 'Technology companies saw mixed trading as investors weighed regulatory risks. Apple and Microsoft were among the most active stocks.',
        url: 'https://example.com/news/2',
        source: 'MarketWatch',
        publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
        author: 'Tech Reporter',
        tags: ['technology', 'apple', 'microsoft'],
        sentiment: 'neutral',
      },
      {
        id: 'mock-3',
        title: 'Federal Reserve Signals Potential Rate Changes',
        summary: 'The Federal Reserve indicated possible adjustments to interest rates in upcoming meetings.',
        content: 'The Federal Reserve indicated possible adjustments to interest rates in upcoming meetings, causing volatility in bond markets.',
        url: 'https://example.com/news/3',
        source: 'CNBC',
        publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
        author: 'Economic Reporter',
        tags: ['federal reserve', 'interest rates'],
        sentiment: 'neutral',
      },
    ];
    
    return mockArticles.slice(0, limit);
  }

  private getMockAustralianNews(limit: number): NewsArticle[] {
    const mockArticles: NewsArticle[] = [
      {
        id: 'mock-au-1',
        title: '🇦🇺 ASX 200 Rises on Strong Mining Sector Performance',
        summary: 'The Australian share market gained ground today led by strong performance in the mining sector.',
        content: 'The Australian share market gained ground today led by strong performance in the mining sector. BHP and Rio Tinto were among the top performers.',
        url: 'https://example.com/au-news/1',
        source: 'AFR',
        publishedAt: new Date(),
        author: 'Australian Financial Reporter',
        tags: ['asx 200', 'mining', 'bhp', 'rio tinto'],
        sentiment: 'positive',
      },
      {
        id: 'mock-au-2',
        title: '🇦🇺 RBA Maintains Interest Rates at Current Level',
        summary: 'The Reserve Bank of Australia kept the cash rate unchanged at 4.35% in today\'s board meeting.',
        content: 'The Reserve Bank of Australia kept the cash rate unchanged at 4.35% in today\'s board meeting, citing ongoing economic uncertainty.',
        url: 'https://example.com/au-news/2',
        source: 'ABC Business',
        publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
        author: 'Economic Reporter',
        tags: ['rba', 'interest rates', 'australia'],
        sentiment: 'neutral',
      },
      {
        id: 'mock-au-3',
        title: '🇦🇺 Commonwealth Bank Reports Strong Quarterly Results',
        summary: 'CBA announced better-than-expected quarterly earnings, driving banking sector gains.',
        content: 'Commonwealth Bank announced better-than-expected quarterly earnings, driving banking sector gains across the ASX.',
        url: 'https://example.com/au-news/3',
        source: 'SMH Business',
        publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
        author: 'Banking Reporter',
        tags: ['cba', 'banking', 'earnings', 'asx'],
        sentiment: 'positive',
      },
    ];
    
    return mockArticles.slice(0, limit);
  }
}
