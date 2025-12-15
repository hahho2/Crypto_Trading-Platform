package com.jing.controller;

import com.jing.config.JwtProvider;
import com.jing.model.TwoFactorOTP;
import com.jing.model.User;
import com.jing.reponse.AuthResponse;
import com.jing.repository.UserRepository;
import com.jing.service.CustomUserDetailsService;
import com.jing.service.EmailService;
import com.jing.service.TwoFactorOtpService;
import com.jing.utils.OtpUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private TwoFactorOtpService twoFactorOtpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> register(@RequestBody User user){


        //checking if email exists or not

        User isEmailExist=userRepository.findByEmail(user.getEmail());

        if(isEmailExist!=null){
            throw new RuntimeException("Email already Exists");
        }



        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setFullName(user.getFullName());


        userRepository.save(newUser);

        Authentication auth =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        user.getPassword()
                        );


        SecurityContextHolder.getContext().setAuthentication(auth);

        //creating jwt token

        String jwt= JwtProvider.generateToken(auth);

        AuthResponse res=new AuthResponse();
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage("register succesfull");

        return new ResponseEntity<>(res, HttpStatus.CREATED);

        //Creating JWT token






    }

    //Here we have singin post method for login
    //And accessed user and password from request body
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> login(@RequestBody User user){


        //checking if email exists or not

        String username=user.getEmail();
        String password=user.getPassword();


        //we will get below auth here
        Authentication auth=authenticate(username,password);




        SecurityContextHolder.getContext().setAuthentication(auth);

        //creating jwt token

        String jwt= JwtProvider.generateToken(auth);

        User authuser =userRepository.findByEmail(username);


        //checking if 2fa is enabled for the user
        if(user.getTwoFactorAuth().isEnabled()){
            AuthResponse res=new AuthResponse();
            res.setMessage("2FA Enabled");
            res.setTwoFactorAuthEnable(true);
            String otp=OtpUtils.generateOTP();

            TwoFactorOTP oldTwoFactorOTP=twoFactorOtpService.findByUser(authuser.getId());

            //checking if old otp exists then deleting it
            if(oldTwoFactorOTP!=null){
                twoFactorOtpService.deleteTwoFactorOtp(oldTwoFactorOTP);
            }

            //creating new otp entry
            TwoFactorOTP newTwoFactorOTP =twoFactorOtpService.createTwoFactorOtp(
                authuser,
                otp,
                jwt);


            emailService.sendVerificationOtpEmail(
                username,
                otp
            );

            //In real world application we will send otp to user email or phone number

                res.setSession(newTwoFactorOTP.getId());
                if (newTwoFactorOTP.getExpiresAt() != null) {
                    res.setOtpExpiresAt(newTwoFactorOTP.getExpiresAt().toEpochMilli());
                }
            return new ResponseEntity<>(res, HttpStatus.ACCEPTED);


            

        }


        //sending response if not 2fa
        AuthResponse res=new AuthResponse();
        //setting jwt token in response
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage("Login succesfull");

        return new ResponseEntity<>(res, HttpStatus.CREATED);

        //Creating JWT token






    }
    //Authentication method for login
    private Authentication authenticate(String username, String password) {
        UserDetails userDetails=customUserDetailsService.loadUserByUsername(username);


        //User not found exception
        if(userDetails==null){
            throw new BadCredentialsException("User not found");
        }

        //Wrong password exception
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Wrong password");
        }

        //If no exception then return authentication token
        return new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());


    }
    //Authentication OTP verification for signin
    @PostMapping("/verify-signin/{otp}")
    public ResponseEntity<AuthResponse> verifySinginOtp(
        @PathVariable String otp,
        @RequestParam String id) throws Exception {
        TwoFactorOTP twoFactorOtp = twoFactorOtpService.findById(id);

        if (twoFactorOtp != null && twoFactorOtpService.verifyTwoFactorOtp(twoFactorOtp, otp)) {
            AuthResponse res = new AuthResponse();
            res.setMessage("2FA Verification Successful");
            res.setTwoFactorAuthEnable(true);
            res.setJwt(twoFactorOtp.getJwt());

            // remove used OTP
            twoFactorOtpService.deleteTwoFactorOtp(twoFactorOtp);

            return new ResponseEntity<>(res, HttpStatus.OK);
        }

        throw new Exception("Invalid OTP");
    }

    // Forgot password: send OTP to user's email
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@RequestParam String email) throws Exception {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new Exception("User not found");
        }

        String otp = OtpUtils.generateOTP();
        TwoFactorOTP old = twoFactorOtpService.findByUser(user.getId());
        if (old != null) {
            twoFactorOtpService.deleteTwoFactorOtp(old);
        }

        TwoFactorOTP twoFactorOTP = twoFactorOtpService.createTwoFactorOtp(user, otp, null);
        emailService.sendVerificationOtpEmail(email, otp);

        AuthResponse res = new AuthResponse();
        res.setMessage("OTP sent");
        res.setSession(twoFactorOTP.getId());
        if (twoFactorOTP.getExpiresAt() != null) {
            res.setOtpExpiresAt(twoFactorOTP.getExpiresAt().toEpochMilli());
        }
        return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
    }

    // Verify OTP for forgot-password and set new password
    @PostMapping("/verify-forgot/{otp}")
    public ResponseEntity<AuthResponse> verifyForgotPassword(
        @PathVariable String otp,
        @RequestParam String id,
        @RequestParam String newPassword) throws Exception {

        TwoFactorOTP twoFactorOtp = twoFactorOtpService.findById(id);
        if (twoFactorOtp != null && twoFactorOtpService.verifyTwoFactorOtp(twoFactorOtp, otp)) {
            User user = twoFactorOtp.getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            twoFactorOtpService.deleteTwoFactorOtp(twoFactorOtp);

            AuthResponse res = new AuthResponse();
            res.setMessage("Password reset successful");
            res.setStatus(true);
            return new ResponseEntity<>(res, HttpStatus.OK);
        }

        throw new Exception("Invalid OTP");
    }

}

