const axios = require('axios');

/**
 * These tests focus on the following requirements:
 * Provides hovercard information when authenticated through basic auth or OAuth with the repo scope.
 * The subject_type and subject_id parameters provide context for the person's hovercard,
 * which returns more information than without the parameters.
 */

describe("GET /users/:username/hovercard", () => {
    describe("unauthenticated user/app", () => {
        test("returns 401 for unauthenticated users", async () => {
            expect(
                async () => await axios.get(
                    'https://api.github.com/users/user1/hovercard', 
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
        test("returns 404 with no repo scope", async () => {
            expect(
                async () => await axios.get(
                    'https://api.github.com/users/user1/hovercard', 
                    {
                        headers: {
                            Authentication: true
                        }
                    }
                )
            ).rejects.toThrow("Request failed with status code 404");
        });
        
        test("returns basic response when no query params are used", async () => {
            const expected = {
                contexts: [
                  {
                    "message": "Owns this repository",
                    "octicon": "repo"
                  }
                ]
            };

            const res = await axios.get('https://api.github.com/users/user2/hovercard', {
                headers: {
                    Authentication: true,
                    'X-repo-scope': true
                }
            });
        
            expect(res.data).toEqual(expected);
        });

        test("returns something more with subject_type param", async () => {
            const expected = {
                contexts: [
                    {
                        message: "Owns this repository",
                        octicon: "repo",
                        repo: {
                            name: "my-repo",
                            owner: "john"
                        }
                    }
                ]
            };
            
            const res = await axios.get('https://api.github.com/users/user3/hovercard?subject_type=repository', {
                headers: {
                    Authentication: true,
                    'X-repo-scope': true
                }
            });
        
            expect(res.data).toEqual(expected);
        });

        test("returns empty response with invalid subject_type param", async () => {
            const expected = { contexts: [] };
            
            const res = await axios.get('https://api.github.com/users/user3/hovercard?subject_type=abc', {
                headers: {
                    Authentication: true,
                    'X-repo-scope': true
                }
            });
        
            expect(res.data).toEqual(expected);
        });


        test("returns something more with subject_id param", async () => {
            const expected = {
                contexts: [
                    {
                        message: "Owns this repository",
                        octicon: "repo",
                        repo: {
                            name: "my-repo",
                            owner: "john",
                            pull_requests: 10
                        }
                    }
                ]
            };

            const res = await axios.get('https://api.github.com/users/user3/hovercard?subject_type=repository&subject_id=123', {
                headers: {
                    Authentication: true,
                    'X-repo-scope': true
                }
            });
        
            expect(res.data).toEqual(expected);
        });

        test("returns empty response with invalid subject_id param", async () => {
            const expected = { contexts: [] };
              
              const res = await axios.get('https://api.github.com/users/user4/hovercard?subject_type=abc&subject_id=abc', {
                headers: {
                    Authentication: true,
                    'X-repo-scope': true
                }
            });
        
            expect(res.data).toEqual(expected);
        });

        test("errors for subject_id param with no subject_type", async () => {
            expect(
                async () => await axios.get(
                    'https://api.github.com/users/user4/hovercard?subject_id=123', 
                    {
                        headers: {
                            Authentication: true,
                            'X-repo-scope': true
                        }
                    }
                )
            ).rejects.toThrow("Request failed with status code 400");
        });
    });
});