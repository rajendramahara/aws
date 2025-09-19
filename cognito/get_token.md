Enable USER_PASSWORD_AUTH: In your User Pool App Client settings, ensure that “Enable username password based authentication (ALLOW_USER_PASSWORD_AUTH)” is checked
stackoverflow.com
. If this flow isn’t enabled, your API calls will be rejected. Also, if your app client has no secret (as in your case), you can omit the SECRET_HASH parameter; if it has a secret, you must include SECRET_HASH in the request.

POST https://cognito-idp.<region>.amazonaws.com/

Headers:
  Content-Type: application/x-amz-json-1.1
  X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth

Body:
{
  "AuthFlow": "USER_PASSWORD_AUTH",
  "ClientId": "<YourAppClientID>",
  "AuthParameters": {
    "USERNAME": "user@example.com",
    "PASSWORD": "yourpassword",
    "SECRET_HASH": "<calculated_secret_hash>" # IF CLIENT SECRET IS ENABLE
  }
}


async function getTokens({ code, clientId, clientSecret, redirectUri, domain }) {
    const tokenUrl = `https://${domain}/oauth2/token`;

    // Works in browser
    const authHeader = btoa(`${clientId}:${clientSecret}`);

    const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri,
    });

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${authHeader}`,
        },
        body: params.toString(),
    });

    const result = await response.json();
    console.log("Token Response:", result);
}

const clientId = "7m4mo2aqfprcrvlo0irll1shlr";
const clientSecret = "srhtladdp83mc1d5ueqjh87uab468ml0nsgt31cprif532g24vu";
const redirectUri = "http://localhost:8000/callback.html";
// const domain = "cognito-idp.us-east-1.amazonaws.com";
const domain = "us-east-1wqvhyixdd.auth.us-east-1.amazoncognito.com";

getTokensfromcode({
    code: "39ec2925-c8d7-4f0f-bc3b-e336f1fdebb8", // replace with actual code from login
    clientId,
    clientSecret,
    redirectUri,
    domain
});
