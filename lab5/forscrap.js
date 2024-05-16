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

function processItem(item) {
    const params = item.querySelectorAll(".newsitem__param");
    return [
        params[0].textContent,
        params[1].innerText,
        item.querySelector(".newsitem__title-inner").innerText,
        item.querySelector(".newsitem__text").innerText,
        item.querySelector(".newsitem__title").href
    ];
}

const news = Array.from(document.querySelectorAll(".newsitem"))
const aggregated_news = news.map((item) => processItem(item));
const blobURL = URL.createObjectURL(createCsvBlob(aggregated_news));
    const a = document.createElement('a');
    a.href = blobURL;
    a.download = "news.csv";
    a.style.display = 'none';
    document.body.append(a);
    a.click();
    setTimeout(() => {
        URL.revokeObjectURL(blobURL);
        a.remove();
    }, 1000);    