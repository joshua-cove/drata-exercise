# drata-exercise
The repo contains two sections, `cypress` which contains the UI tests for assignment 1 and `jest` which contains the API tests for assignment 2.

## Initial Setup
Please clone the repo and run `npm install`

## Assignment 1: UI Tests
The assignment had a requirement to start the test at `drata.com`. However, it appears that the Drata website has some bot prevention measures that prevent `cypress` (and presumably other frameworks) from accessing the page. It returns a 403 status code and blank page, or a Captcha. So, I elected to test the `community.drata.com` domain instead.
This appears to be a known unresolved [issue](https://github.com/cypress-io/cypress/issues/19725) and I estimate would take longer to solve than the time allotted for the exercise.

### Running the UI Tests
The tests may be run in one of two ways.
Headed: 
1. In the terminal, enter `npm run ui-tests`.
1. This will open a browser window. Select `E2E Testing` and then `Chrome`.
1. In the Spec list, select the test to run. A report will be logged to the browser runner at the end of the test.

Headless:
1. In the terminal, enter `npm run ui-tests-headless`.
1. All tests will run sequentially. A report will be written to the `./results` folder 

### Assignment Discussion
There was a requirement that all tests pass, but between the bot prevention causing some 403 responses, and some pages having console errors, some of these tests fail as intended.

It wasn't clear whether the request was to verify all links on the page or on the entire site. I choose to implement the former, since the latter would mostly be an extension of the same logic.
The `single-test` spec implements that by getting all links from a given page, visiting them, and making the required assertions. It also builds a report of the number of passing links and an array of details for the failing links.

That said, I don't like that one test does so many things, making it more likely to be flaky. It also requires the test to build a report, which is more code to maintain, combines the test and framework functionalities, and adds potential points of failure not related to the requirements under test.

J and Ernie had mentioned the objective of auto-generating the tests, which would be my preference as well. The `dynamic-tests` implement that approach, where given an array of URLs, a test is auto-generated for each, making it easy to maintain, making it clear which ones passed or failed, and taking advantage of the frameworks reporting capabilities rather than implementing a custom report in the test.
On the other hand, it adds the pre-requisite of having a list of URLs.
There are three approaches I considered:
1. Ideally, the front end team(s) maintain a site map, or a site mapping tool could be used. Preferably that would be done outside the test suite, for instance in a nightly or periodic cron job that updates a resource file consumed by the test. This task is emulated here by the `fetch-urls` spec. While it is an anti-pattern to have tests depend on each other, or on run order, it allows demonstrating the approach, as cypress does not readily allow sharing context, to generate the list in a before hook.
1. If the first approach is not an option, then an 80 / 20 approach would be to run the `single-test` spec against an array listed in the test itself including each of the Drata subdomains, which presumably is not a large number. That would provide fairly high test coverage with few tests or maintenance efforts.
1. A third option is to modify the `fetch-urls` approach into a recursive method, as demostrated in the `getSiteLinks` method at `cypress/support/commands.js`. Recursive methods are often problematic and this would likely not be my recommendation. Too high a risk of entering an inifinite loop or getting stuck on unexpected issues. Indeed, running it against the `community.drata.com` subdomain yielded hundreds of links to discussion threads. More complex regex are needed to filter out such results.

The `single-test` writes a report to the `./results` folder.
Given more time, I would set up `mochawesome` or similar to improve on report quality in general.

## Assignment 2: API Tests
### Running the API Tests
1. In the terminal, enter `npm run api-tests`

### Assignment Discussion
Running e2e-type tests against a mock server is a touch odd, as all it verifies is the mock itself. So, I chose to simplify the various user related objects and just mock a few fields per endpoint such that the approach, both to testing and to mocking, is clear, but without implementing too much made up product logic.
This is especially true of the hovercard endpoint. The Github API docs don't specify what additional fields may be returned when including the query params, and after curling several dozen users using my own account, and inspecting the browser queries when opening hovercards, was unable to find any that returned hovercard data. So those parts of the response bodies are entirely made up.
A real product implementation would have authentication handling which would also provide the scopes. Likewise a real test implementation would create test entities with the proper attributes for each test.
To keep the implementation simple, I hacked those by passing the desired state in headers, and interpreting those values in the mock server handler.

### API Test Strategy
For real world tests, my approach to this assignment would be:
For each endpoint, verify
1. Generic requirements errors
    1. No authentication
    1. Missing or incorrect scopes
    1. Conflict with existing resources
    1. Entity not found
    1. etc
1. Endpoint specific expected errors
    1. Omitting each required field in request body or query param in URL
    1. Omitting each URL param
    1. Incorrect data type for each field or query param
    1. Boundary testing for each field or query param (below minimum, above maximum, etc)
    1. Violate any field or query param dependencies, e.g. set phone verified when there is no phone
1. Happy paths
    1. The minimal happy path, e.g. only including required request body params
    1. Happy path for each field in request body, for operations that have request bodies
    1. Happy path for each query param, for operations that have them
    1. Maximal happy path, including all fields or query params. If some are mutually exclusive, there would be several of these tests.
1. Tests per entity state
    1. For example RBAC, differences per plan, tier, etc.