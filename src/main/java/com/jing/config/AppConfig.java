package com.jing.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

//help us to make our own login password
@Configuration
public class AppConfig {

    //during login and register we dont have any jwt token but further we must need it
    //casuse of security isuue so we did it here so we made our endpoint
    //white listed here so our end point here is secured
    //so what ever endpoint started from api is secured
    @Bean
    SecurityFilterChain securityFilterChain (HttpSecurity http) throws Exception{
        http.sessionManagement(managment->managment.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(Authorize->Authorize.requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .addFilterBefore(new
                        JwtTokenValidator(), BasicAuthenticationFilter.class)
                //Jwt it checks when a user makes a request if the user is white listed or not
                //if it is started from it should be white listed except this its permit all
                //Its also check for jwt token provided by user
                .csrf(csrf-> csrf.disable())
                .cors(cors->cors.configurationSource(corsConfigurationSource()));
//cors configurtion error is becuse it on allows our fontend to access it if another website
        // tries to acces it throws cros configuration errorand dont give them data
        return http.build();

    }
    private CorsConfigurationSource corsConfigurationSource(){
        return null;
    }

}
