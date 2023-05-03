const axios = require('axios');

/**
 * These tests focus on the following requirements:
 * Lists all users, in the order that they signed up on GitHub. 
 * Pagination is powered exclusively by the since parameter.
 * per_page determines number of results
 */

describe("GET /users", () => {
    test("returns users in correct order", async () => {
        const res = await axios.get('https://api.github.com/users');
    
        expect(res.data[0].id).toEqual(1);
        expect(res.data[1].id).toEqual(2);
        expect(res.data[2].id).toEqual(3);
        expect(res.data.length).toEqual(3);
    });

    describe("since query param", () => {
        test("only returns users since 1", async () => {
            const res = await axios.get('https://api.github.com/users?since=1');
        
            expect(res.data[0].id).toEqual(2);
            expect(res.data[1].id).toEqual(3);
            expect(res.data.length).toEqual(2);
        });

        test("only returns users since 2", async () => {
            const res = await axios.get('https://api.github.com/users?since=2');
        
            expect(res.data[0].id).toEqual(3);
            expect(res.data.length).toEqual(1);
        });
    });

    describe("per_page query param", () => {
        test("returns specified number of users of 1", async () => {
            const res = await axios.get('https://api.github.com/users?per_page=1');
        
            expect(res.data.length).toEqual(1);
        })

        test("returns specified number of users of 2", async () => {
            const res = await axios.get('https://api.github.com/users?per_page=2');
        
            expect(res.data.length).toEqual(2);
        });
    });
});