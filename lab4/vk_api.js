import { myVkId, vkAppId, serviceKey, accessToken } from "/secrets.js";

const vkApiUrl = "https://api.vk.com/method/";

const reqParams = {
    access_token: accessToken,
    v: "5.81"
};

export const Methods = {
    GetPosts: 'wall.get',
    GetFriends: "friends.get",
    CommentPost: "wall.createComment"
}

async function jsonpRequest(url) {
    return $.getJSON({
        url: url, jsonp: "callback",
        dataType: "jsonp"
             }).promise();
} 

export function vkApiRequest(method, params) {
    const queryParams = new URLSearchParams({...params, ...reqParams});
    const url = vkApiUrl + method + "?" + queryParams.toString();
    console.log(url);
    return jsonpRequest(url).then(
        (response) => {
            if ( response.error !== undefined ) {
                return Promise.reject(response.error);
            } else {
                return Promise.resolve(response.response);
            }
        },
        (err) => {
            return Promise.reject(err);
        }
    );
}

export async function vkAuthorise() {
    const queryParams = new URLSearchParams( {
        client_id: vkAppId,
        redirect_uri: "https://oauth.vk.com/blank.html",
        response_type: "token",
        state: "1234aboba",
        display: "page",
        revoke: "1",
        scope: 'wall,offline'
    });
    console.log("https://oauth.vk.com/authorize" + "?" + queryParams.toString());
    // try {
    //     const result = await jsonpRequest("https://oauth.vk.com/authorize" + "?" + queryParams.toString());
    //     print(result);
    // } catch (err) {
    //     console.log("posos");
    // }
}