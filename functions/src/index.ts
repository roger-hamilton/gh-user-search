import * as functions from "firebase-functions";
import axios from "axios";

export const authCallback =
  functions.https.onRequest(async (request, response) => {
    const {code, state} = request.query;

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

      response.redirect(`/#access_token=${accessToken}&state=${state}`);
    }

    response.status(400).json({message: "no code sent in the response"});
  });
