const axios = require('axios');

/**
 * These tests focus on the following requirements:
 * If user updates a permitted attribute with valid value, it should be saved correctly
 * If user updates a permitted attribute with invalid value, it should error
 * If user updates an invalid attribute, ot should be dropped silently
 */

describe("PATCH /user", () => {
    describe("update valid attribute with valid value", () => {
        test("updates login attribute", async () => {
            const res = await axios.patch('https://api.github.com/user', {
                login: "new-login"
            });

            expect(res.data.login).toEqual('new-login');
            expect(res.data.email).toEqual('bob@gmail.com');
            expect(res.data.blog).toEqual('https://blogs.com/bob');
        });
        
        test("updates email attribute", async () => {
            const res = await axios.patch('https://api.github.com/user', {
                email: "bob@hotmail.com"
            });

            expect(res.data.login).toEqual('bob');
            expect(res.data.email).toEqual('bob@hotmail.com');
            expect(res.data.blog).toEqual('https://blogs.com/bob');
        });
    });

    describe("update valid attribute with invalid value", () => {
        test("updates login attribute", async () => {
            expect(async () => await axios.patch('https://api.github.com/user', {
                login: 1
            })).rejects.toThrow("Request failed with status code 400");
        });
        
        test("updates email attribute", async () => {
            expect(async () => await axios.patch('https://api.github.com/user', {
                email: "bobhotmail.com"
            })).rejects.toThrow("Request failed with status code 400");
        });
    });

    describe("update invalid attribute", () => {
        test("drops invalid fields from request", async () => {
            const res = await axios.patch('https://api.github.com/user', {
                invalid_field: 2
            });
        
            expect(res.data.login).toEqual('bob');
            expect(res.data.email).toEqual('bob@gmail.com');
            expect(res.data.blog).toEqual('https://blogs.com/bob');
            expect(res.data).not.toHaveProperty('invalid_field');
        });
    });
});
