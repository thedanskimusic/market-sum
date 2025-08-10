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
      this.logger.log('Fetching latest news from Reuters RSS feed');
      
      // Reuters Business News RSS feed
      // Could use: this.configService.get("externalApis.reuters")
      const rssUrl = 'https://feeds.reuters.com/reuters/businessNews';
      
      const response = await axios.get(rssUrl, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Market-Sum-News-Bot/1.0',
        },
      });

      const articles = this.parseRSSFeed(response.data as string, limit);
      
      this.logger.log(`Successfully fetched ${articles.length} news articles`);
      return articles;
      
    } catch (error) {
      this.logger.error('Failed to fetch news from Reuters RSS feed', error);
      
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
      
      // For now, we'll use different RSS feeds for different categories
      const rssFeeds = {
        business: 'https://feeds.reuters.com/reuters/businessNews',
        technology: 'https://feeds.reuters.com/reuters/technologyNews',
        markets: 'https://feeds.reuters.com/reuters/businessNews', // Reuters doesn't have separate markets feed
        economy: 'https://feeds.reuters.com/reuters/businessNews',
      };

      const feedUrl = rssFeeds[category as keyof typeof rssFeeds] || rssFeeds.business;
      
      const response = await axios.get(feedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Market-Sum-News-Bot/1.0',
        },
      });

      const articles = this.parseRSSFeed(response.data as string, limit);
      
      this.logger.log(`Successfully fetched ${articles.length} articles for category: ${category}`);
      return articles;
      
    } catch (error) {
      this.logger.error(`Failed to fetch news for category: ${category}`, error);
      return this.getMockNews(limit);
    }
  }

  private parseRSSFeed(xmlData: string, limit: number): NewsArticle[] {
    try {
      // Simple XML parsing using regex (for now - could use xml2js library later)
      const articles: NewsArticle[] = [];
      
      // Extract items from RSS feed
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title>(.*?)<\/title>/;
      const descriptionRegex = /<description>(.*?)<\/description>/;
      const linkRegex = /<link>(.*?)<\/link>/;
      const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
      
      let match;
      let count = 0;
      
      while ((match = itemRegex.exec(xmlData)) !== null && count < limit) {
        const itemContent = match[1];
        
        const titleMatch = itemContent.match(titleRegex);
        const descriptionMatch = itemContent.match(descriptionRegex);
        const linkMatch = itemContent.match(linkRegex);
        const pubDateMatch = itemContent.match(pubDateRegex);
        
        if (titleMatch && descriptionMatch && linkMatch) {
          const title = this.cleanHtml(titleMatch[1]);
          const summary = this.cleanHtml(descriptionMatch[1]);
          const url = linkMatch[1];
          const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
          
          // Simple sentiment analysis based on keywords
          const sentiment = this.analyzeSentiment(title + ' ' + summary);
          
          articles.push({
            id: `reuters-${count}-${Date.now()}`,
            title,
            summary,
            content: summary, // For RSS, content is same as summary
            url,
            source: 'Reuters',
            publishedAt,
            tags: this.extractTags(title + ' ' + summary),
            sentiment,
          });
          
          count++;
        }
      }
      
      return articles;
      
    } catch (error) {
      this.logger.error('Failed to parse RSS feed', error);
      return this.getMockNews(limit);
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
        source: 'Reuters',
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
        source: 'Reuters',
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
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
        author: 'Economic Reporter',
        tags: ['federal reserve', 'interest rates'],
        sentiment: 'neutral',
      },
    ];
    
    return mockArticles.slice(0, limit);
  }
}
