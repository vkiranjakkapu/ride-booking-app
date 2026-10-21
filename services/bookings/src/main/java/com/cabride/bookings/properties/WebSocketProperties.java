package com.cabride.bookings.properties;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cabride.socket")
public class WebSocketProperties {

    private String appPrefix = "app";

    private String userPrefix = "user";

    private List<String> subscriptionUrls = List.of("/queue", "/topic", "/user");

    public String getAppPrefix() {
        return appPrefix;
    }

    public void setAppPrefix(String appPrefix) {
        this.appPrefix = appPrefix;
    }

    public String getUserPrefix() {
        return userPrefix;
    }

    public void setUserPrefix(String userPrefix) {
        this.userPrefix = userPrefix;
    }

    public List<String> getSubscriptionUrls() {
        return subscriptionUrls;
    }

    public void setSubscriptionUrls(List<String> subscriptionUrls) {
        this.subscriptionUrls = subscriptionUrls;
    }

}
