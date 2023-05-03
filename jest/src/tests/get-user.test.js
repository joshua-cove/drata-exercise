const axios = require('axios');

/**
 * These tests focus on the following requirement:
 * If the authenticated user is authenticated through basic authentication or OAuth with the user scope, 
 * then the response lists public and private profile information.
 * If the authenticated user is authenticated through OAuth without the user scope, 
 * then the response lists only public profile information.
 */

describe("GET /user", () => {
    describe("user without user scope", () => {
        test("returns all public fields", async () => {
            const res = await axios.get('https://api.github.com/user', {
                headers: {
                    Authentication: false
                }
            });
        
            expect(res.data.login).toEqual('joe');
            expect(res.data.id).toEqual('abc123');
            expect(res.data.company).toEqual('cia');
            expect(res.data.email).toEqual('joe@cia.com');
        });
        
        test("doesn't return private fields", async () => {
            const res = await axios.get('https://api.github.com/user', {
                headers: {
                    Authentication: false
                }
            });
        
            expect(res.data.login).toEqual('joe');
            expect(res.data).not.toHaveProperty('business_plus');
            expect(res.data).not.toHaveProperty('ldap_dn');
            expect(res.data).not.toHaveProperty('site_admin');
            expect(res.data).not.toHaveProperty('two_factor_authentication');
        });
    });

    describe("user with user scope", () => {
        test("returns public fields", async () => {
            const res = await axios.get('https://api.github.com/user', {
                headers: {
                    Authentication: true
                }
            });
        
            expect(res.data.login).toEqual('joe');
            expect(res.data.id).toEqual('abc123');
            expect(res.data.company).toEqual('cia');
            expect(res.data.email).toEqual('joe@cia.com');
        });
        
        test("returns private fields", async () => {
            const res = await axios.get('https://api.github.com/user', {
                headers: {
                    Authentication: true
                }
            });
        
            expect(res.data.login).toEqual('joe');
            expect(res.data).toHaveProperty('business_plus');
            expect(res.data).toHaveProperty('ldap_dn');
            expect(res.data).toHaveProperty('site_admin');
            expect(res.data).toHaveProperty('two_factor_authentication');
        });
    });
});
