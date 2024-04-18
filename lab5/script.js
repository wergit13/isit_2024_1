import { Methods, vkApiRequest } from "./vk_api.js";
import { myVkId } from "../secrets.js";

function showFriedns(root, friends) {
    friends = friends.map((u) => {
        return `<tr>
            <td>${u.photo_50 ? `<img src=${u.photo_50}></img>`: "-"}</td>
            <td>${u.first_name}</td>
            <td>${u.last_name}</td>
            <td>${u.bdate ? u.bdate : "-"}</td>
            <td>${u.city?.title ? u.city?.title : "-"}</td>
            <td>${u.friends_count}</td>
        </tr>`   
    }).join('');
    let str = `<table>
    <tr>
        <th>Photo</th>
        <th>Name</th>
        <th>Surname</th>
        <th>Birth date</th>
        <th>City</th>
        <th>Friends count</th>
    </tr>
    ${friends}
    </table>`;
    root.innerHTML = str;
}

function showGroups(root, groups) {
    const gr = groups.map((u) => {
        return `<tr>
            <td>${u.photo_50 ? `<img src=${u.photo_50}></img>`: "-"}</td>
            <td>${u.name}</td>
            <td>${u.members_count}</td>
            <td>${u.friends_count}</td>
        </tr>`   
    }).join('');
    let str = `<table>
    <tr>
        <th>Photo</th>
        <th>Name</th>
        <th>Members count</th>
        <th>Friends count</th>
    </tr>
    ${gr}
    </table>`;
    root.innerHTML = str;
}

async function process(count) {
    const root = document.querySelector('.app');
    const friendsField = document.querySelector(".friends");
    friendsField.innerHTML = "loading...";
    try {
        const resp = await vkApiRequest(Methods.getGroups, {user_id: myVkId, extended:1, count:count, fields: "members_count,photo_50"});
        const groups = resp.items;
        const promises = groups.map(group => {
            return vkApiRequest(Methods.getMembers, {group_id: group.id, filter:"friends"})
            .then((resp) => {group.friends_count  = resp.items.length; return group})
            .catch((err) => {console.log(err); return null});
        });
        const friendsWithData = await Promise.all(promises);
        showGroups(friendsField, friendsWithData.filter(e => e!=null).sort((f1, f2) => f2.friends_count - f1.friends_count));
    } catch (err) {
        console.log(err);
        friendsField.innerHTML = "error: " + err.error_msg;
        return;
    }
}

const main = async ()=> {
    const countInput = document.getElementById("groups-count");
    document.getElementById("btn").addEventListener("click", () => process(countInput.value));
};

main();