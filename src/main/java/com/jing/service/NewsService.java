package com.jing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jing.dto.NewsArticleDto;
import com.jing.dto.NewsImpactDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class NewsService {

    @Value("${newsapi.api.keys}")
    private String apiKeysString;

    @Value("${newsapi.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AtomicInteger keyIndex = new AtomicInteger(0);
    private String[] apiKeys;

    // Sentiment analysis keywords
    private static final Map<String, Integer> POSITIVE_KEYWORDS = new HashMap<>();
    private static final Map<String, Integer> NEGATIVE_KEYWORDS = new HashMap<>();

    static {
        // Strong positive keywords (weight: 20-30)
        POSITIVE_KEYWORDS.put("surge", 30);
        POSITIVE_KEYWORDS.put("soar", 30);
        POSITIVE_KEYWORDS.put("rally", 25);
        POSITIVE_KEYWORDS.put("breakthrough", 25);
        POSITIVE_KEYWORDS.put("record", 25);
        POSITIVE_KEYWORDS.put("boom", 25);
        POSITIVE_KEYWORDS.put("jump", 20);
        POSITIVE_KEYWORDS.put("rise", 20);
        POSITIVE_KEYWORDS.put("gain", 20);
        POSITIVE_KEYWORDS.put("profit", 20);
        POSITIVE_KEYWORDS.put("growth", 20);
        POSITIVE_KEYWORDS.put("expansion", 20);
        POSITIVE_KEYWORDS.put("approval", 20);
        POSITIVE_KEYWORDS.put("success", 20);
        POSITIVE_KEYWORDS.put("innovation", 20);
        POSITIVE_KEYWORDS.put("launch", 15);
        POSITIVE_KEYWORDS.put("partnership", 15);
        POSITIVE_KEYWORDS.put("upgrade", 15);
        POSITIVE_KEYWORDS.put("beat", 15);
        POSITIVE_KEYWORDS.put("exceed", 15);
        POSITIVE_KEYWORDS.put("strong", 10);
        POSITIVE_KEYWORDS.put("positive", 10);
        POSITIVE_KEYWORDS.put("optimistic", 10);
        POSITIVE_KEYWORDS.put("bullish", 10);

        // Strong negative keywords (weight: -20 to -30)
        NEGATIVE_KEYWORDS.put("crash", -30);
        NEGATIVE_KEYWORDS.put("plunge", -30);
        NEGATIVE_KEYWORDS.put("collapse", -30);
        NEGATIVE_KEYWORDS.put("fraud", -30);
        NEGATIVE_KEYWORDS.put("scandal", -30);
        NEGATIVE_KEYWORDS.put("bankruptcy", -30);
        NEGATIVE_KEYWORDS.put("lawsuit", -25);
        NEGATIVE_KEYWORDS.put("investigation", -25);
        NEGATIVE_KEYWORDS.put("decline", -20);
        NEGATIVE_KEYWORDS.put("loss", -20);
        NEGATIVE_KEYWORDS.put("drop", -20);
        NEGATIVE_KEYWORDS.put("fall", -20);
        NEGATIVE_KEYWORDS.put("ban", -20);
        NEGATIVE_KEYWORDS.put("penalty", -20);
        NEGATIVE_KEYWORDS.put("warning", -15);
        NEGATIVE_KEYWORDS.put("concern", -15);
        NEGATIVE_KEYWORDS.put("risk", -15);
        NEGATIVE_KEYWORDS.put("delay", -15);
        NEGATIVE_KEYWORDS.put("miss", -15);
        NEGATIVE_KEYWORDS.put("weak", -10);
        NEGATIVE_KEYWORDS.put("negative", -10);
        NEGATIVE_KEYWORDS.put("bearish", -10);
    }

    private String getNextApiKey() {
        if (apiKeys == null) {
            apiKeys = apiKeysString.split(",");
        }
        int index = keyIndex.getAndIncrement() % apiKeys.length;
        return apiKeys[index];
    }

    public List<NewsArticleDto> getStockNews(String symbol) throws Exception {
        String apiKey = getNextApiKey();
        String companyName = getCompanyName(symbol);
        
        // Try specific search first
        List<NewsArticleDto> articles = fetchNewsWithQuery(symbol, companyName, "\"" + companyName + "\" stock", apiKey);
        
        // If no results, try broader search
        if (articles.isEmpty()) {
            System.out.println("No results with specific query, trying broader search for " + symbol);
            articles = fetchNewsWithQuery(symbol, companyName, companyName, apiKey);
        }
        
        // If still no results, try with OR operator for more results
        if (articles.isEmpty()) {
            System.out.println("No results with company name, trying OR query for " + symbol);
            articles = fetchNewsWithQuery(symbol, companyName, companyName + " OR " + symbol, apiKey);
        }
        
        System.out.println("Returning " + articles.size() + " relevant articles for " + symbol);
        
        // Return 1-3 articles: minimum 1, maximum 3
        if (articles.size() > 3) {
            return articles.subList(0, 3);
        }
        return articles;
    }
    
    private List<NewsArticleDto> fetchNewsWithQuery(String symbol, String companyName, String searchQuery, String apiKey) throws Exception {
        // NewsAPI everything endpoint - properly encode the query
        String url = String.format("%s?q=%s&language=en&sortBy=publishedAt&pageSize=50&apiKey=%s",
                apiUrl, 
                java.net.URLEncoder.encode(searchQuery, "UTF-8"), 
                apiKey);

        System.out.println("Fetching news for " + symbol + " with query: " + searchQuery);
        
        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            // Check for API errors
            if (!"ok".equals(root.get("status").asText())) {
                String errorMsg = root.has("message") ? root.get("message").asText() : "Unknown error";
                System.err.println("NewsAPI error: " + errorMsg);
                return new ArrayList<>();
            }
            
            JsonNode articlesArray = root.get("articles");

            if (articlesArray == null || !articlesArray.isArray() || articlesArray.size() == 0) {
                System.err.println("No articles found in response");
                return new ArrayList<>();
            }
            
            System.out.println("Found " + articlesArray.size() + " articles from API");

            List<NewsArticleDto> articles = new ArrayList<>();
            for (JsonNode article : articlesArray) {
                // Skip articles with removed content
                if (article.get("title").asText().contains("[Removed]")) {
                    continue;
                }
                
                String title = article.get("title").asText();
                String description = article.has("description") && !article.get("description").isNull() 
                    ? article.get("description").asText() 
                    : "";
                
                // Filter: Only include articles that mention the company name or stock symbol
                String combinedText = (title + " " + description).toLowerCase();
                if (!isRelevantToStock(combinedText, symbol, companyName)) {
                    continue;
                }
                
                NewsArticleDto dto = new NewsArticleDto();
                dto.setTitle(title);
                dto.setUrl(article.get("url").asText());
                dto.setSource(article.get("source").get("name").asText());
                dto.setSummary(description.isEmpty() ? title : description);

                // Parse published time (ISO 8601 format: "2024-12-15T10:30:00Z")
                String publishedAt = article.get("publishedAt").asText();
                dto.setPublishedAt(parseNewsApiTime(publishedAt));

                // Calculate sentiment impact score
                int impactScore = calculateImpactScore(dto.getTitle(), dto.getSummary());
                dto.setImpactScore(impactScore);
                dto.setSentiment(getSentimentLabel(impactScore));

                // Extract keywords from content
                if (article.has("content") && !article.get("content").isNull()) {
                    String content = article.get("content").asText();
                    dto.setKeywords(extractKeywords(content));
                }

                articles.add(dto);
                
                // Get at least 3 articles, up to 10 for filtering later
                if (articles.size() >= 10) {
                    break;
                }
            }

            return articles;
        } catch (Exception e) {
            System.err.println("Error fetching news for " + symbol + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public NewsImpactDto calculateNewsImpact(String symbol) throws Exception {
        List<NewsArticleDto> articles = getStockNews(symbol);

        NewsImpactDto impact = new NewsImpactDto();
        impact.setSymbol(symbol);

        if (articles.isEmpty()) {
            impact.setAverageImpactScore(0.0);
            impact.setOverallSentiment("neutral");
            impact.setPositiveCount(0);
            impact.setNegativeCount(0);
            impact.setNeutralCount(0);
            return impact;
        }

        double totalScore = 0;
        int positiveCount = 0;
        int negativeCount = 0;
        int neutralCount = 0;

        for (NewsArticleDto article : articles) {
            totalScore += article.getImpactScore();

            if (article.getImpactScore() > 10) {
                positiveCount++;
            } else if (article.getImpactScore() < -10) {
                negativeCount++;
            } else {
                neutralCount++;
            }
        }

        double avgScore = totalScore / articles.size();
        impact.setAverageImpactScore(Math.round(avgScore * 100.0) / 100.0);
        impact.setPositiveCount(positiveCount);
        impact.setNegativeCount(negativeCount);
        impact.setNeutralCount(neutralCount);

        // Determine overall sentiment
        if (avgScore > 15) {
            impact.setOverallSentiment("bullish");
        } else if (avgScore < -15) {
            impact.setOverallSentiment("bearish");
        } else {
            impact.setOverallSentiment("neutral");
        }

        return impact;
    }

    private int calculateImpactScore(String title, String summary) {
        String text = (title + " " + summary).toLowerCase();
        int score = 0;

        // Analyze positive keywords
        for (Map.Entry<String, Integer> entry : POSITIVE_KEYWORDS.entrySet()) {
            if (text.contains(entry.getKey())) {
                score += entry.getValue();
            }
        }

        // Analyze negative keywords
        for (Map.Entry<String, Integer> entry : NEGATIVE_KEYWORDS.entrySet()) {
            if (text.contains(entry.getKey())) {
                score += entry.getValue(); // Already negative values
            }
        }

        // Normalize to -100 to +100 range (with max possible raw score around 300)
        return Math.max(-100, Math.min(100, score));
    }

    private String getSentimentLabel(int score) {
        if (score > 10) return "positive";
        if (score < -10) return "negative";
        return "neutral";
    }

    private LocalDateTime parseNewsApiTime(String timeStr) {
        try {
            // NewsAPI ISO 8601 format: "2024-12-15T10:30:00Z"
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");
            return LocalDateTime.parse(timeStr, formatter);
        } catch (Exception e) {
            try {
                // Alternative format without Z
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
                return LocalDateTime.parse(timeStr, formatter);
            } catch (Exception ex) {
                return LocalDateTime.now();
            }
        }
    }

    private String[] extractKeywords(String content) {
        List<String> keywords = new ArrayList<>();
        String lowerContent = content.toLowerCase();
        
        for (String keyword : POSITIVE_KEYWORDS.keySet()) {
            if (lowerContent.contains(keyword)) {
                keywords.add(keyword);
            }
        }
        for (String keyword : NEGATIVE_KEYWORDS.keySet()) {
            if (lowerContent.contains(keyword)) {
                keywords.add(keyword);
            }
        }
        
        return keywords.toArray(new String[0]);
    }

    private String getCompanyName(String symbol) {
        return switch (symbol) {
            case "AAPL" -> "Apple";
            case "MSFT" -> "Microsoft";
            case "GOOGL" -> "Google";
            case "AMZN" -> "Amazon";
            case "TSLA" -> "Tesla";
            case "META" -> "Meta";
            case "NVDA" -> "NVIDIA";
            case "JPM" -> "JPMorgan";
            case "V" -> "Visa";
            case "WMT" -> "Walmart";
            default -> symbol;
        };
    }
    
    private boolean isRelevantToStock(String text, String symbol, String companyName) {
        String lowerText = text.toLowerCase();
        String lowerSymbol = symbol.toLowerCase();
        String lowerCompany = companyName.toLowerCase();
        
        // Must contain either the company name or stock symbol
        boolean hasCompanyName = lowerText.contains(lowerCompany);
        boolean hasSymbol = lowerText.contains(lowerSymbol);
        
        // For very common short words, be more lenient to ensure we get some results
        if (companyName.length() <= 5) {
            // Accept if has ticker format, or company name with stock keywords, or just the symbol
            boolean hasTickerFormat = lowerText.contains("$" + lowerSymbol);
            boolean hasStockContext = hasCompanyName && (
                lowerText.contains("stock") || 
                lowerText.contains("shares") || 
                lowerText.contains("trading") ||
                lowerText.contains("market") ||
                lowerText.contains("nasdaq") ||
                lowerText.contains("nyse") ||
                lowerText.contains("earnings") ||
                lowerText.contains("revenue")
            );
            // Be more lenient - accept if it has the company name or symbol
            return hasTickerFormat || hasStockContext || hasCompanyName || hasSymbol;
        }
        
        return hasCompanyName || hasSymbol;
    }
}
