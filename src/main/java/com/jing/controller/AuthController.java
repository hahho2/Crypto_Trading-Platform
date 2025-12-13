package com.jing.controller;

import com.jing.config.JwtProvider;
import com.jing.model.User;
import com.jing.reponse.AuthResponse;
import com.jing.repository.UserRepository;
import com.jing.service.CustomUserDetailsService;
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

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> register(@RequestBody User user){


        //checking if email exists or not

        User isEmailExist=userRepository.findByEmail(user.getEmail());

        if(isEmailExist!=null){
            throw new RuntimeException("Email already Exists");
        }



        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(user.getPassword());
        newUser.setEmail(user.getEmail());
        newUser.setFullName(user.getFullName());


        User savedUser = userRepository.save(newUser);

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
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> login(@RequestBody User user){


        //checking if email exists or not

        User isEmailExist=userRepository.findByEmail(user.getEmail());

        String username=user.getEmail();
        String password=user.getPassword();



        Authentication auth=authenticate(username,password);




        SecurityContextHolder.getContext().setAuthentication(auth);

        //creating jwt token

        String jwt= JwtProvider.generateToken(auth);

        AuthResponse res=new AuthResponse();
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage("Login succesfull");

        return new ResponseEntity<>(res, HttpStatus.CREATED);

        //Creating JWT token






    }

    private Authentication authenticate(String username, String password) {
        UserDetails userDetails=customUserDetailsService.loadUserByUsername(username);

        if(userDetails==null){
            throw new BadCredentialsException("User not found");
        }

        if (!password.equals(userDetails.getPassword())) {
            throw new BadCredentialsException("Wrong password");
        }
        return new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());


    }


}