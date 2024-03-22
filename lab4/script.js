import { myVkId, vkAppId, serviceKey } from "/secrets.js";


const root = document.querySelector("root");
const vkUrl = "https://api.vk.com/method/";

const reqParams = {
    access_token: serviceKey,
    v: "5.81"
};

async function jsonpRequest(url) {
    return $.getJSON({
        url: url, jsonp: "callback",
        dataType: "jsonp"
             }).promise();
} 

function vkApiRequest(method, params) {
    const queryParams = new URLSearchParams({...params, ...reqParams});
    const url = vkUrl + method + "?" + queryParams.toString();
    console.log(url);
    return jsonpRequest(url);
}

function showFriedns(friends) {
    friends = friends.map((u) => {
        return `<tr>
            <td>${u.photo_50 ? `<img src=${u.photo_50}></img>`: "-"}</td>
            <td>${u.first_name}</td>
            <td>${u.last_name}</td>
            <td>${u.bdate ? u.bdate : "-"}</td>
            <td>${u.city?.title ? u.city?.title : "-"}</td>
        </tr>`   
    }).join('');
    root.innerHTML = `<h1>My friends</h1><table>
    <tr>
        <th>Photo</th>
        <th>Name</th>
        <th>Surname</th>
        <th>Birth date</th>
        <th>City</th>
    </tr>
    ${friends}
    </table`
}

const p = vkApiRequest("friends.get", {user_id: myVkId, fields: "bdate,city,education,photo_50"});

p.then((data) => {
    if ( data.error !== undefined ) {
        root.innerHTML = "<h1>Fetch error</h1>"
    }
    showFriedns(data.response.items);
});