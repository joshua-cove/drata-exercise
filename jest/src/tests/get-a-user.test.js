const axios = require('axios');

/**
 * These tests focus on the following requirements:
 * The GitHub App or user must be authenticated to use the endpoint.
 * Only provides public information about someone with a GitHub account.
 * The email in the response is the user's public email, or null.
 * Only GitHub apps that have the Plan user permission can use this endpoint to retrieve information about a user's GitHub plan.
 */

describe("GET /users/:username", () => {
    describe("unauthenticated user/app", () => {
        test("returns 401 for unauthenticated users", async () => {
            expect(
                async () => await axios.get(
                    'https://api.github.com/users/user1', 
                    {
                        headers: {
                            Authentication: false
                        }
                    }
                )
            ).rejects.toThrow("Request failed with status code 401");
        });
    });

    describe("authenticated user/app", () => {
        test("doesn't return email for user that doesn't have one", async () => {
            const res = await axios.get('https://api.github.com/users/userWithoutEmail', {
                headers: {
                    Authentication: true
                }
            });
        
            expect(res.data.login).toEqual('joe');
            expect(res.data.id).toEqual('abc123');
            expect(res.data.company).toEqual('cia');
            expect(res.data).not.toHaveProperty('email');
        });

        test("returns email for user that has one", async () => {
            const res = await axios.get('https://api.github.com/users/userWithEmail', {
                headers: {
                    Authentication: true,
                    'X-public-email': true
                }
            });
        
            expect(res.data.login).toEqual('joe');
            expect(res.data.id).toEqual('abc123');
            expect(res.data.company).toEqual('cia');
            expect(res.data.email).toEqual('joe@cia.com');
        });

        describe("without plan user permission", () => {
            test("doesn't return plan info for user without plan scope", async () => {
                const res = await axios.get('https://api.github.com/users/userWithEmail', {
                    headers: {
                        Authentication: true
                    }
                });
            
                expect(res.data.login).toEqual('joe');
                expect(res.data.id).toEqual('abc123');
                expect(res.data.company).toEqual('cia');
                expect(res.data).not.toHaveProperty('plan');
            });
        });

        describe("with plan user permission", () => {
            test("returns plan info for user with plan scope", async () => {
                const res = await axios.get('https://api.github.com/users/userWithEmail', {
                    headers: {
                        Authentication: true,
                        'X-user-plan': true
                    }
                });
            
                expect(res.data.login).toEqual('joe');
                expect(res.data.id).toEqual('abc123');
                expect(res.data.company).toEqual('cia');
                expect(res.data).toHaveProperty('plan');
            });
        });
    });
});
