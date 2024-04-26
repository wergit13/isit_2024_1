import { botToken } from "/secrets.js";

let lastEvent = 0;

async function updateMessageList(){
    await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?timeout=10&offset=${lastEvent+1}`)
        .then(response => response.json())
        .then(async function (data) {
            const message_сontainer = document.querySelector(".message-container");

            data?.result.forEach(async (update) => {
                lastEvent = Math.max(lastEvent, update.update_id);
                if ( update.message === undefined )
                    return;

                const message = update.message;

                const date = convert_unixtime(message?.date);
                const text = message?.text;
                const user_name = `${message?.from?.username} (${message?.from?.first_name} ${message?.from?.last_name})`;
                const user_id = message?.from?.id;
                let user_photo;

                await fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${user_id}`)
                    .then(response => response.json())
                    .then(async function (data) {
                        const photos = data?.result?.photos;
                        user_photo = (photos.length == 0) ? undefined : (await (get_file(photos[0][1]?.file_id)));
                    })
                    .catch(error => console.log(error));


                const message_div = document.createElement("div");
                message_div.classList.add("message");
            
                if (typeof user_photo !== "undefined") {
                    const image = document.createElement("img");
                    image.src = user_photo;
                    image.classList.add("avatar")
                    message_div.appendChild(image);
                }
            
                const text_div = document.createElement("div");
                text_div.innerHTML = `
                    <p class="name"><strong>${user_name}</strong></p>
                    <p class="date">${date}</p>
                `;

                if(text !== undefined ) {
                    const mess  = document.createElement("p")
                    mess.classList.add("info");
                    mess.innerHTML = text;
                    text_div.appendChild(mess)
                }

                if(message.animation !== undefined ) {
                    const gif  = document.createElement("video")
                    gif.autoplay = true;
                    gif.loop = true;
                    gif.classList.add("info");
                    gif.src = await (get_file(message.animation.file_id));
                    text_div.appendChild(gif);
                }

                if(message.photo !== undefined ) {
                    const photo  = document.createElement("img")
                    photo.classList.add("info");
                    photo.src = await (get_file(message.photo[message.photo.length - 1].file_id));
                    text_div.appendChild(photo);
                }

                if(message.sticker !== undefined ) {
                    const photo  = document.createElement("img")
                    photo.classList.add("info");
                    photo.src = await (get_file(message.sticker.thumbnail.file_id));
                    text_div.appendChild(photo);
                }


                if(message.document !== undefined ) {
                    const photo  = document.createElement("a")
                    photo.classList.add("info");
                    photo.download = message.document.file_name;
                    photo.href = await (get_file(message.document.file_id));
                    photo.innerText = `Download "${message.document.file_name}"`;
                    text_div.appendChild(photo);
                }




                message_div.appendChild(text_div);
            
                message_сontainer.appendChild(message_div);
            });

        })
        .catch(error => console.error(error));
}

let cycle = async ()=> {
    while(true) {
        await updateMessageList();
    }
}

cycle();

function convert_unixtime(unix_time) {
    return (new Date(unix_time * 1000)).toLocaleString();
}

async function get_file(file_id) {
    let file;
    await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${file_id}`)
        .then(response => response.json())
        .then(data => {
            const file_path = data?.result?.file_path;
            file = `https://api.telegram.org/file/bot${botToken}/${file_path}`;
        })
        .catch(error => console.log(error));
    return file;
}