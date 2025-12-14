package com.jing.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

public class JwtProvider {

    private static SecretKey key =
            Keys.hmacShaKeyFor(JwtConstant.Secreat_Key.getBytes());


    public static String generateToken(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities =
                auth.getAuthorities();

        String roles = populateAuthorities(authorities);

        String jwt= Jwts.builder().issuedAt(new Date()).expiration(new Date(new Date().getTime()+86400000))
                .claim("email",auth.getName())
                .claim("authhorities",roles)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
        return jwt;

    }

    //method for email accesing with jwt token

    public static String getEmailFromToken(String token){

        token = token.substring(7);
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String email = (String) claims.get("email");
        return email;
    }

    private static String populateAuthorities(Collection<? extends GrantedAuthority> authorities) {

        //convert set into string

        Set<String> auth = new HashSet<>();
        for (GrantedAuthority ga : authorities) {
            auth.add(ga.getAuthority());
        }
        return String.join(",", auth);
    }

}

