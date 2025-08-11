# Market Summary Dashboard

A modern, responsive web interface for the Market Summary API that displays real-time market data, financial news, and stock information.

## Features

### 📊 Market Overview
- **Market Indices**: Real-time display of major market indices (S&P 500, ASX 200, NASDAQ)
- **Live Updates**: Data refreshes automatically every 5 minutes
- **Visual Indicators**: Color-coded changes (green for gains, red for losses)

### 📈 Stock Performance
- **Top Gainers**: Stocks with the highest percentage gains
- **Top Losers**: Stocks with the highest percentage losses  
- **Most Active**: Stocks with the highest trading volume
- **Tabbed Interface**: Easy switching between different performance metrics

### 📰 Financial News
- **Latest News**: Real-time financial news from Reuters RSS feeds
- **Category Filtering**: Filter news by business, technology, markets, or economy
- **Sentiment Analysis**: Color-coded sentiment indicators (positive/negative/neutral)
- **Clickable Links**: Direct links to full articles

### 🔍 Stock Lookup
- **Individual Stock Search**: Look up any stock by symbol (e.g., AAPL, MSFT, GOOGL)
- **Detailed Information**: Price, change, volume, market cap, high/low values
- **Real-time Data**: Live stock prices and market data

## How to Use

### Getting Started
1. Make sure your NestJS backend is running on `http://localhost:3000`
2. Open your browser and navigate to `http://localhost:3000`
3. The dashboard will automatically load all market data and news

### Navigation
- **Refresh Button**: Manually refresh all data
- **Tab Navigation**: Switch between Top Gainers, Top Losers, and Most Active stocks
- **News Filters**: Filter news articles by category
- **Stock Search**: Enter any stock symbol to get detailed information

### Data Sources
- **Market Data**: Mock data (will be replaced with real API integrations)
- **News**: Reuters RSS feeds with fallback to mock data
- **Auto-refresh**: Data updates every 5 minutes automatically

## Technical Details

### Frontend Technologies
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript
- **Font Awesome**: Icons for better UX
- **Google Fonts**: Inter font family for modern typography

### API Integration
- **RESTful API**: Communicates with NestJS backend
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Visual feedback during data loading
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox support

## Development

### File Structure
```
public/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js             # JavaScript functionality
└── README.md          # This file
```

### Customization
- **Colors**: Modify CSS variables in `styles.css`
- **Layout**: Adjust grid layouts and responsive breakpoints
- **API Endpoints**: Update API calls in `app.js`
- **Auto-refresh**: Change refresh interval in `app.js`

### Adding New Features
1. Update HTML structure in `index.html`
2. Add styles in `styles.css`
3. Implement functionality in `app.js`
4. Test across different screen sizes

## Troubleshooting

### Common Issues
- **Data not loading**: Check if backend is running on port 3000
- **CORS errors**: Ensure backend CORS is properly configured
- **Styling issues**: Clear browser cache and reload
- **API errors**: Check browser console for detailed error messages

### Performance Tips
- **Network**: Ensure stable internet connection for news feeds
- **Browser**: Use modern browsers for best performance
- **Cache**: Clear cache if experiencing stale data issues

## Future Enhancements

### Planned Features
- **Charts**: Interactive price charts for stocks
- **Watchlists**: Save favorite stocks for quick access
- **Alerts**: Price alerts and notifications
- **Portfolio Tracking**: Track personal investments
- **Advanced Filters**: More sophisticated data filtering
- **Dark Mode**: Toggle between light and dark themes

### API Improvements
- **Real Market Data**: Integration with live market data providers
- **WebSocket Support**: Real-time data streaming
- **Authentication**: User accounts and personalized features
- **Caching**: Improved data caching for better performance

---

**Note**: This is a development version with mock data. Production deployment will include real market data integrations and additional security measures.
