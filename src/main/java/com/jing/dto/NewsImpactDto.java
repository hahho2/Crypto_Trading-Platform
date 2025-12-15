package com.jing.dto;

public class NewsImpactDto {
    private String symbol;
    private double averageImpactScore;
    private String overallSentiment; // "bullish", "bearish", "neutral"
    private int positiveCount;
    private int negativeCount;
    private int neutralCount;
    private int totalArticles;

    public NewsImpactDto() {}

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public double getAverageImpactScore() {
        return averageImpactScore;
    }

    public void setAverageImpactScore(double averageImpactScore) {
        this.averageImpactScore = averageImpactScore;
    }

    public String getOverallSentiment() {
        return overallSentiment;
    }

    public void setOverallSentiment(String overallSentiment) {
        this.overallSentiment = overallSentiment;
    }

    public int getPositiveCount() {
        return positiveCount;
    }

    public void setPositiveCount(int positiveCount) {
        this.positiveCount = positiveCount;
    }

    public int getNegativeCount() {
        return negativeCount;
    }

    public void setNegativeCount(int negativeCount) {
        this.negativeCount = negativeCount;
    }

    public int getNeutralCount() {
        return neutralCount;
    }

    public void setNeutralCount(int neutralCount) {
        this.neutralCount = neutralCount;
    }

    public int getTotalArticles() {
        return totalArticles;
    }

    public void setTotalArticles(int totalArticles) {
        this.totalArticles = totalArticles;
    }
}
