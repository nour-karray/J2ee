package com.entreprise.missions.api.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {
    @Mock private JwtService jwtService;
    @Mock private AppUserDetailsService userDetailsService;
    @Mock private jakarta.servlet.FilterChain filterChain;

    @Test void invalidTokenReturnsUnauthorized() throws Exception {
        when(jwtService.extractUsername("bad")).thenThrow(new MalformedJwtException("bad"));
        assertUnauthorized("bad");
    }

    @Test void expiredTokenReturnsUnauthorized() throws Exception {
        when(jwtService.extractUsername("expired")).thenThrow(new ExpiredJwtException(null, null, "expired"));
        assertUnauthorized("expired");
    }

    @Test void absentUserReturnsUnauthorized() throws Exception {
        when(jwtService.extractUsername("valid")).thenReturn("missing@demo.invalid");
        when(userDetailsService.loadUserByUsername("missing@demo.invalid"))
                .thenThrow(new UsernameNotFoundException("missing"));
        assertUnauthorized("valid");
    }

    @Test void disabledUserReturnsUnauthorized() throws Exception {
        when(jwtService.extractUsername("valid")).thenReturn("disabled@demo.invalid");
        when(userDetailsService.loadUserByUsername("disabled@demo.invalid"))
                .thenThrow(new DisabledException("disabled"));
        assertUnauthorized("valid");
    }

    private void assertUnauthorized(String token) throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userDetailsService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, filterChain);
        assertEquals(401, response.getStatus());
    }
}
