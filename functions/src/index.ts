import * as functions from "firebase-functions";
import axios from "axios";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const authCallback =
  functions.https.onRequest(async (request, response) => {
    const {code} = request.query;

    if (typeof code === "string") {
      const tokenRes = await axios.post("https://github.com/login/oauth/access_token", {
        client_secret: functions.config().github.client_secret,
        client_id: functions.config().github.client_id,
        code,
        redirect_uri: functions.config().github.redirect_uri,
      }, {
        headers: {Accept: "application/vnd.github.v3+json"},
      });

      const {access_token: accessToken} = tokenRes.data;

      response.redirect(`/#access_token=${accessToken}`);
    }

    response.status(400).json({message: "no code sent in the response"});
  });
