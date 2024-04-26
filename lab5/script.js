import { Methods, vkApiRequest } from "./vk_api.js";
import { myVkId } from "../secrets.js";


function createCsvBlob(data) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < data.length; i++) {
        csvFile += processRow(data[i]);
    }

    return new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
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

function addDownloadButton(groupArr) {
    const button = document.createElement("button")
    button.innerHTML = `Download CSV`;
    const blob = createCsvBlob(groupArr.map((gr) => [gr.screen_name, gr.name, gr.members_count, gr.friends_count]));

    document.querySelector(".friends").appendChild(button);
    button.addEventListener("click", async () =>{
        const supportsFileSystemAccess =
            'showSaveFilePicker' in window &&
            (() => {
                try {
                    return window.self === window.top;
                } catch {
                    return false;
                }
            })();
        if (supportsFileSystemAccess) {
            try {
                const handle = await showSaveFilePicker({
                    suggestedName:"mygroups.csv"
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error(err.name, err.message);
                    return;
                }
            }
        }
        const blobURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = "mygroups.csv";
        a.style.display = 'none';
        document.body.append(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(blobURL);
            a.remove();
        }, 1000);
    });
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
        const result = friendsWithData.filter(e => e!=null).sort((f1, f2) => f2.friends_count - f1.friends_count)
        showGroups(friendsField, result);
        addDownloadButton(result)
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