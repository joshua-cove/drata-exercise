const { rest } = require('msw');

module.exports = {
    handlers: [
        rest.get('https://api.github.com/user', (req, res, ctx) => {
            // Check if the user is authenticated in this session
            const isAuthenticated = req.headers.get("authentication") === 'true';

            // build abbreviated response body
            const resBody = {
                login: 'joe',
                id: "abc123",
                company: "cia",
                email: "joe@cia.com"
            };

            // If authenticated, respond with mocked private user details
            if (isAuthenticated) {
                resBody.business_plus = true,
                resBody.ldap_dn = "abc123",
                resBody.site_admin = true,
                resBody.two_factor_authentication = true
            };

            return res(
                ctx.status(200),
                ctx.json(resBody)
            );
        }),

        rest.patch('https://api.github.com/user', async (req, res, ctx) => {
            const body = await req.json();

            // input validation
            let validInput = true;
            // if the request body includes a login (what github calls a username), it must be valid. 
            // only strings and only letter chars
            if (body.login &&
                (typeof body.login !== 'string') ||
                    (typeof body.login === 'string' && !body.login.match(/[a-zA-Z]*/))
            ) {
                validInput = false;
            };

            // if the request body includes an email, it must be valid format
            if (
                body.email &&
                (typeof body.email !== 'string' ||
                    !body.email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/))
            ) {
                validInput = false;
            };

            // if the request body includes a blog link, it must be a valid link format
            if (
                body.blog &&
                (typeof body.blog !== 'string' ||
                    !body.blog.match(/https:\/\/www.[a-zA-Z\.\-\/]*/))
            ) {
                validInput = false;
            };

            // return a 400 error for invalid request body content
            if (!validInput) {
                return res(ctx.status(400));
            };

            const originalUser = {
                login: "bob",
                email: "bob@gmail.com",
                blog: "https://blogs.com/bob"
            };

            // otherwise update the specified user fields and keep the others unchanged
            // not using object spreading in order to more easily drop unexpected keys
            const updatedUser = {
                login: body.login ?? originalUser.login,
                email: body.email ?? originalUser.email,
                blog: body.blog ?? originalUser.blog
            };

            return res(
                ctx.status(200),
                ctx.json(updatedUser)
            )
        }),

        rest.get('https://api.github.com/users', (req, res, ctx) => {
            // 3 whole users in our database!
            const users = [
                {
                    id: 1,
                    email: "user1@gmail.com",
                    login: "user1"
                },
                {
                    id: 2,
                    email: "user2@gmail.com",
                    login: "user2"
                },
                {
                    id: 3,
                    email: "user3@gmail.com",
                    login: "user3"
                }
            ];

            // default to return all users
            const since = req.url.searchParams.get('since') || 0;
            // default to return 30 users per page
            const perPage = req.url.searchParams.get('per_page') || 30;

            const resBody = users.filter((user) => user.id > since).slice(0, perPage);

            return res(
                ctx.status(200),
                ctx.json(resBody)
            );
        }),

        rest.get('https://api.github.com/users/:username', (req, res, ctx) => {
            // using custom headers to pass around login state and the users' scopes
            const isAuthenticated = req.headers.get("authentication") === 'true';
            const hasUserPlan = req.headers.get("x-user-plan") === 'true';
            const hasPublicEmail = req.headers.get("x-public-email") === 'true';

            // error for unauthenticated users
            if (!isAuthenticated) {
                return res(ctx.status(401));
            };

            // build abbreviated response body
            const resBody = {
                login: 'joe',
                id: "abc123",
                company: "cia",
            };

            // users may or may not have a public email
            if (hasPublicEmail) {
                resBody.email = 'joe@cia.com';
            };

            // enhance responce if user has the plan scope
            if (hasUserPlan) {
                resBody.plan = {
                    login: "Medium",
                    space: 400,
                    private_repos: 20,
                    collaborators: 0
                };
            };

            return res(
                ctx.status(200),
                ctx.json(resBody)
            );
        }),

        rest.get('https://api.github.com/users/:username/hovercard', (req, res, ctx) => {
            // using custom headers to pass around login state and the users' scopes
            const isAuthenticated = req.headers.get("authentication") === 'true';
            const hasRepoScope = req.headers.get("x-repo-scope") === 'true';
            const subject_type = req.url.searchParams.get('subject_type');
            const subject_id = req.url.searchParams.get('subject_id');

            // error for unauthenticated users
            if (!isAuthenticated) {
                return res(ctx.status(401));
            };

            // error for users without required scope
            if (!hasRepoScope) {
                return res(ctx.status(404));
            };

            // error for missing a required query param
            if (subject_id && !subject_type) {
                return res(ctx.status(400));
            };

            const validSubjectTypes = ["organization", "repository", "issue", "pull_request"];
            let returnEmptyResponse = false;
            // return 200 with empty body for invalid subject types
            if (subject_type) {
                returnEmptyResponse = !validSubjectTypes.includes(subject_type);
            }
            // return 200 with empty body for invalid subject id values
            if (subject_id) {
                returnEmptyResponse = returnEmptyResponse || !subject_id.match(/\d*/);
            }

            if (returnEmptyResponse) {
                return res(
                    ctx.status(200),
                    ctx.json({ contexts: [] })
                );
            };

            const resBody = {
                contexts: [
                    {
                        message: "Owns this repository",
                        octicon: "repo"
                    }
                ]
            };

            // some made up fields to add to the response if all else looks good
            if (subject_type === "repository") {
                resBody.contexts[0].repo = {
                    name: "my-repo",
                    owner: "john"
                };
            };

            if (subject_id === '123') {
                resBody.contexts[0].repo.pull_requests = 10;
            };

            return res(
                ctx.status(200),
                ctx.json(resBody)
            );
        })
    ]
};