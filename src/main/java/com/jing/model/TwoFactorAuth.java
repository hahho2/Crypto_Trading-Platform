package com.jing.model;


import com.jing.domain.VerificationType;
import lombok.Data;


@Data
public class TwoFactorAuth {
    private boolean isEnabled = false;
    private VerificationType sendTo;
    private String sendToValue;
    public String getSendToValue() {
        return sendToValue;
    }

    public void setSendToValue(String sendToValue) {
        this.sendToValue = sendToValue;
    }

}
