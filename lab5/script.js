import { Methods, vkApiRequest } from "./vk_api.js";
import { myVkId } from "../secrets.js";
import { data } from "./data.js";


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
        
    });
}

function processItem(item) {
    const params = item.querySelectorAll(".newsitem__param");
    return [
        params[0].dateTime,
        params[1].innerText,
        item.querySelector(".newsitem__title-inner").innerText,
        item.querySelector(".newsitem__text").innerText,
        item.querySelector(".newsitem__title").href
    ];
}

function process(count) {
    const root = document.createElement("div")
    root.innerHTML = data;
    const news = Array.from(root.querySelectorAll(".newsitem"))
    const aggregated_news = news.map((item) => processItem(item));
    const blobURL = URL.createObjectURL(createCsvBlob(aggregated_news));
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
}

const main = async ()=> {
    const countInput = document.getElementById("groups-count");
    document.getElementById("btn").addEventListener("click", () => process(countInput.value));
};

main();