package com.jing.service;


import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    //method for send verification otp email
    public void sendOtpEmail(String email,
         String otp
        ) throws MessagingException {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper=new MimeMessageHelper(mimeMessage,"utf-8");

            //Email subject and text
            String subject="Your Verification OTP";
            String text="Your OTP for verification is: "+otp;


            //Setting email details
            mimeMessageHelper.setSubject(subject);

            mimeMessageHelper.setText(text);
            mimeMessageHelper.setTo(email);

            //Exception handling for mail sending

            try{
                javaMailSender.send(mimeMessage);
            }
            catch(MailException e){
                throw new MailSendException(e.getMessage());
            }


        //Implementation for sending email
    }

    public void sendVerificationOtpEmail(String username, String otp) {
        try {
            sendOtpEmail(username, otp);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }


    
}
