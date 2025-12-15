package com.jing.dto;

import java.time.LocalDateTime;

public class NewsArticleDto {
    private String title;
    private String url;
    private String source;
    private String summary;
    private LocalDateTime publishedAt;
    private int impactScore; // -100 to +100
    private String sentiment; // "positive", "negative", "neutral"
    private String[] keywords;

    public NewsArticleDto() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public int getImpactScore() {
        return impactScore;
    }

    public void setImpactScore(int impactScore) {
        this.impactScore = impactScore;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public String[] getKeywords() {
        return keywords;
    }

    public void setKeywords(String[] keywords) {
        this.keywords = keywords;
    }
}
